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
  const { id } = useParams();
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

        setGraphData(prev => {
          const next = { ...prev };

          data.forEach(m => {
            if (!next[m.propertyId]) {
              next[m.propertyId] = {
                labels: [],
                datasets: [
                  {
                    data: [],
                    borderColor: propertyGraphColor[m.propertyId],
                    backgroundColor: "rgba(81, 201, 201, 0.2)"
                  }
                ]
              };
            }

            const entry = next[m.propertyId];

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

  useEffect(() => {
    if (connection.state === "Disconnected") {
      connection.start()
        .then(() => console.log("Connected to SignalR"))
        .catch(err => console.error(err));
    }
    console.log(connection.state);

    connection.on("UpdateMeasurements", (data, UnitId) => {
      console.log("Measurement Updates are Comming !!!");
      if (id == UnitId) {
        setMeasurements(data);
        setGraphData(prev => {
          const next = {};

          data.forEach(m => {
            if (!next[m.propertyId]) {
              next[m.propertyId] = {
                labels: [],
                datasets: [{
                  data: [],
                  borderColor: propertyGraphColor[m.propertyId],
                  borderColor: "cyan",
                  backgroundColor: "rgba(0,255,255,0.2)",
                  tension: 0.3,
                  fill: true,
                  pointBackgroundColor: "white",
                  pointBorderColor: "cyan",
                  pointRadius: 4
                }]
              };
            }

            const entry = next[m.propertyId];

            if (entry.labels.includes(m.timeStamp)) return;

            entry.labels.push(m.timeStamp);
            entry.datasets[0].data.push(m.value);
          });

          return next;
        });
      }
    });

    return () => {
      connection.off("ReceiveMessage");
    };
  }, []);

  function getProperties() {
    setShow(true);
    fetch("http://localhost:5000/Data/getproperties", {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setPropertydata(data);
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
    });

    setShow(false);
    window.location.reload();
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
        },
        TId: 220
      })
    });
  }

  function findGraphTitle(pId) {
    const prop = Object.values(unitproperties).find(p => p.propertyId === pId);
    console.log(prop);
    return prop?.propertyName;
  }

  return (
    <div className="glass-page d-flex justify-content-center align-items-center min-vh-100 position-relative">
      <video autoPlay loop muted className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="container py-5">
        <div className="dashboard-wrapper mx-auto">
          <div className="glass-card p-4 p-md-5 mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h2 className="fw-bold mb-1">Unit Dashboard</h2>
                <p className="glass-muted mb-0">
                  Live monitoring data and property graphs for unit {id}
                </p>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button className="glass-btn" onClick={() => { sendummydata(); }}>
                  Send Dummy Data
                </button>
                <button className="metric-pill" onClick={getProperties}>
                  Add a New Property
                </button>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="glass-stat-card p-4 text-center h-100 glass-hover">
                <div className="summary-icon mb-2">🆔</div>
                <h6 className="glass-muted mb-1">Unit ID</h6>
                <h3 className="fw-bold mb-0">{id}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="glass-stat-card p-4 text-center h-100 glass-hover">
                <div className="summary-icon mb-2">🧩</div>
                <h6 className="glass-muted mb-1">Properties</h6>
                <h3 className="fw-bold mb-0">{unitproperties?.length || 0}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="glass-stat-card p-4 text-center h-100 glass-hover">
                <div className="summary-icon mb-2">📈</div>
                <h6 className="glass-muted mb-1">Measurements</h6>
                <h3 className="fw-bold mb-0">{measurements?.length || 0}</h3>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="glass-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Assigned Properties</h5>
                  <span className="glass-badge">{unitproperties?.length || 0}</span>
                </div>

                {unitproperties?.length === 0 ? (
                  <div className="glass-empty-box p-4 text-center">
                    No properties found
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {unitproperties.map(unitproperty => (
                      <div key={unitproperty.propertyId} className="glass-list-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold">{unitproperty.propertyName}</div>
                            <small className="glass-muted">Property ID: {unitproperty.propertyId}</small>
                          </div>
                          <span className="glass-badge">Assigned</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-8">
              <div className="glass-card p-4 h-100">
                <h5 className="fw-bold mb-1">Property Graphs</h5>
                <p className="glass-muted small mb-4">
                  Real-time chart view for each connected property
                </p>

                {Object.keys(graphData || {}).length === 0 ? (
                  <div className="glass-empty-box p-4 text-center">
                    No graph data available
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {Object.keys(graphData || {}).map(pId => (
                      <div className="glass-chart-card p-3" key={pId}>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                          <h5 className="fw-bold mb-0">
                            {unitproperties.map(unitproperty => (
                              <span key={unitproperty.propertyId}>
                                {unitproperty.propertyId == pId ? unitproperty.propertyName : ""}
                              </span>
                            ))}
                          </h5>
                          <span className="glass-badge">Live</span>
                        </div>

                        <div className="chart-box">
                          <Line data={graphData[pId]} redraw={true}></Line>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {show && (
            <div className="glass-modal-overlay">
              <div className="glass-modal-card">
                <div className="glass-modal-header">
                  <h5 className="mb-0">Add Property</h5>
                </div>

                <div className="glass-modal-body">
                  {propertydata.map(property => (
                    <div
                      key={property.propertyId}
                      className="glass-list-item glass-hover unit-card mb-2"
                      onClick={() => addProperty(property.propertyId)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">{property.propertyName}</span>
                        <span className="glass-badge">Add</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-modal-footer text-end">
                  <button className="metric-pill" onClick={() => setShow(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnitDashboard;
