import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { connection } from "../signalr";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);
let propertyGraphColor = ["red", "green", "blue", "yellow", "purple", "cyan", "orange"];
let properties = [];
function UnitDashboard() {
  const { id } = useParams(); //GET Parameters
  const [unitproperties, setUnitproperties] = useState([]);
  const [propertydata, setPropertydata] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [firstTime, setfirstTime] = useState(true);
  const [graphData, setGraphData] = useState({});





  useEffect(() => {
    fetch("http://localhost:5000/Data/getunitproperties", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        UnitId: id
      })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUnitproperties(data);
        properties = data;
        console.log("####");
        console.log(properties);

        /*const initialGraph = data.reduce((acc, e) => {
           acc[e.propertyId] = [];  // or = null / 0 / whatever default you need
           return acc;
         }, {});
   
         setGraphData(initialGraph);*/

        /* const newEntries = {};
           data.forEach(e => {
             newEntries[e.propertyId] = [];
           });
     
           setGraphData(prev => ({ ...prev, ...newEntries }));
     
     */
      });

    const propertyIds = unitproperties.map(prop => prop.id);
    fetch("http://localhost:5000/Data/getmeasurements", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, propertyIds })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setMeasurements(data);

        /*   setGraphData(prev => {
               const reset = {};
               Object.keys(prev).forEach(key => {
                 reset[key] = {
                   labels: [],     // or: prev[key].labels.slice(0,0) 
                   datasets: [],     // same
                   // datasets: [] if you use that structure
                 };
               });
               return reset;
           });*/

        setGraphData(prev => {
          const next = { ...prev };

          data.forEach(m => {
            if (!next[m.propertyId]) {
              next[m.propertyId] = {
                labels: [],
                datasets: [{ data: [], borderColor: propertyGraphColor[m.propertyId], backgroundColor: "rgba(81, 201, 201, 0.2)" }] // minimal valid
              };
            }

            const entry = next[m.propertyId];

            // Prevent duplicates (optional but recommended)
            if (entry.labels.includes(m.timeStamp)) return;

            entry.labels.push(m.timeStamp);
            entry.datasets[0].data.push(m.value);
          });

          return next;
        });



      });
  }, []);

  useEffect(() => {
    console.log("graphData actually became:", graphData);
  }, [graphData]);
  //==========================================================================
  useEffect(() => {
    if (connection.state === "Disconnected") {
      connection.start()
        .then(() => console.log("Connected to SignalR"))
        .catch(err => console.error(err));
    }
    console.log(connection.state);




    // Listen for server → client messages
    connection.on("UpdateMeasurements", (data, UnitId) => {
      console.log("Measurement Updates are Comming !!!")
      if (id == UnitId) {
        setMeasurements(data);
        setGraphData(prev => {
          const next = {};

          data.forEach(m => {
            if (!next[m.propertyId]) {
              next[m.propertyId] = {
                labels: [],
                datasets: [{
                  data: [], borderColor: propertyGraphColor[m.propertyId], borderColor: "cyan",
                  backgroundColor: "rgba(0,255,255,0.2)", // area under the line
                  tension: 0.3, // smooth curve
                  fill: true,
                  pointBackgroundColor: "white",
                  pointBorderColor: "cyan",
                  pointRadius: 4
                }] // minimal valid
              };
            }

            const entry = next[m.propertyId];

            // Prevent duplicates (optional but recommended)
            if (entry.labels.includes(m.timeStamp)) return;

            entry.labels.push(m.timeStamp);
            entry.datasets[0].data.push(m.value);

          });

          return next;
        });
      }

      // console.log(data);
    });

    return () => {
      connection.off("ReceiveMessage");
    };
  }, []);

  //===========================================================================







  function getProperties() {
    setShow(true);
    fetch("http://localhost:5000/Data/getproperties", {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setPropertydata(data);

        //let ids = propertydata.id;
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        // console.log(data);
      });

  }

  function addProperty(PId) {
    console.log("addProperty !!!");
    fetch("http://localhost:5000/Data/addunitproperty", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pid: PId,
        uid: id
      })
    })


    setShow(false);
    window.location.reload()
  }

  function sendummydata() {
    fetch("http://localhost:5000/Data/sendunitdata", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: id,
        Vals: {
          1: 50,
          2: 65
          //change here
        },
        TId: 220                         //{setGraphData(measurement.propertyId,measurement.value,measurement.timeStamp)}
      })
    })


  }

  function findGraphTitle(pId) {
    /* Object.keys(properties).forEach(p => {
       if(p.propertyId === pId){
         console.log("p name is ******************  ");
         console.log(p.propertyName)
         return p.propertyName;
       }
      
     })*/
    const prop = Object.values(unitproperties).find(p => p.propertyId === pId);
    console.log(prop)
    return prop?.propertyName;
  }
  return (
    <div  >
      <div>
        <button className="btn btn-success" onClick={() => { sendummydata() }}>Send Dummy Data</button>
        <div >
          {unitproperties.map(unitproperty => (
            <div
              key={unitproperty.propertyId}>


            </div>
          ))}
        </div>

        <div >
          {Object.keys(graphData || {}).map(pId => <div className="card mb-5" style={{ width: "60%" }}>
            <h1> {unitproperties.map(unitproperty => (
              <div>
                {unitproperty.propertyId == pId ? unitproperty.propertyName : ""}

              </div>
            ))}</h1>
            <Line data={graphData[pId]} redraw={true}></Line>
          </div>
          )}
        </div>





        {id}
        <button className="btn btn-success" onClick={getProperties}>Add a new Property</button>

      </div>
      <div>
        {show && (
          <div className="overlay">
            <div className="popup">
              {propertydata.map(property => (
                <div
                  style={{
                    border: "2px solid black",
                    padding: "10px",
                    cursor: "pointer",
                    width: "100px"
                  }}
                  onClick={() => addProperty(property.propertyId)} key={property.propertyId} >{property.propertyName}</div>))}
              <button className="btn btn-success" onClick={() => setShow(false)}>Close</button>
            </div>
          </div>
        )}
      </div>



    </div>
  );
}

export default UnitDashboard;