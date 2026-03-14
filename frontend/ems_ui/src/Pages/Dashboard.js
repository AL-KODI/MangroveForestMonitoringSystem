import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard(){
    const[units, setUnits] = useState([]);
    const navigate = useNavigate();
   useEffect(() => {
    fetch("http://localhost:5000/Data/getunits", {
        method: "POST",
      credentials: "include"
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUnits(data);
       console.log(data);
      });
  }, []);

  function gotounit(unitId){
    navigate(`/unitdashboard/${unitId}`);
  }
  return(
    <div  className="common-header">
      <video autoPlay loop muted className="bg-video">
        <source src="/background.mp4" type="video/mp4"/>
      </video>
      <div className="row" style={{padding:"50px"}}>
        
        {units.map(unit =>(
            <div className=" col-12 col-md-3 d-flex justify-content-center align-items-center " key={unit.unitId}>
              <div className="glass-card " onClick={() => {gotounit(unit.unitId)}} style={{padding: "10px",cursor: "pointer",width:"350px",height:"400px"}} >
                <center>
                  <h1>{unit.unitName}</h1>
                  <h3>{unit.unitId}</h3>
                  <h3>{unit.location}</h3>
                  <h3>{unit.unitDescription}</h3>
                  <p>Here is an example paragraph:
I love spending time in the park near my house. Every morning, I go for a walk and enjoy the fresh air. The trees and flowers make the place very beautiful and peaceful. Sometimes, I sit on a bench and read a book while listening to the birds. Being in the park helps me feel relaxed and happy.
This paragraph demonstrates a clear topic sentence, supporting details, and a concluding thought, making</p>
                </center>
              </div>
             
            </div>))}
        </div>
    </div>
  );
}

export default Dashboard;