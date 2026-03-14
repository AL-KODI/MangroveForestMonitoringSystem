import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

function AddPropertyForm(){
    const [PropertyName, setpropertyname] = useState("");
    const [PropertyDescription, setPropertyDescription] = useState("");
    const [MaxValue, setMaxValue] = useState("");
    const [MinValue, setMinValue] = useState("");
    const [MeasuringUnit, setMeasuringUnit] = useState("");
   // const [Location, setUnitlocation] = useState("");
    const navigate = useNavigate();

      const handleSubmit = async (e) => {
    e.preventDefault(); // stop page reload
    
    const response = await fetch("http://localhost:5000/Data/AddProperty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        propertyname: PropertyName,
        maxvalue: MaxValue,
        minvalue: MaxValue,
        description: PropertyDescription,
        measuringunit: MeasuringUnit
      })
    });
    if (response.ok) {
        console.log("ok");
      } else {
        console.log("bad response");
      }

//const res = await fetch("http://localhost:5000/User/whoami", {
   //   credentials: "include"
   // });

    
//const data = await res.json(); // parse JSON
//setUser(data);

//console.log("Username:", data.username); 
  };
    return(
        <div>
            <center>
                <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label><br />
                    <input
                        type="text"
                        value={PropertyName}
                        onChange={e =>  setpropertyname(e.target.value)}
                     />
                </div>

                <div>
                    <label>Description:</label><br />
                    <input
                        type="text"
                        value={PropertyDescription}
                        onChange={e =>  setPropertyDescription(e.target.value)}
                    
                     />
                </div>

                <div>
                    <label>Maximum Range:</label><br />
                    <input
                        type="text"
                        value={MaxValue}
                        onChange={e =>  setMaxValue(e.target.value)}
                        
                     />
                </div>

                <div>
                    <label>Minimum Range:</label><br />
                    <input
                        type="text"
                        value={MinValue}
                        onChange={e =>  setMinValue(e.target.value)}
                        
                     />
                </div>

                <div>
                    <label>Measuring Unit:</label><br />
                    <input
                        type="text"
                        value={MeasuringUnit}
                        onChange={e =>  setMeasuringUnit(e.target.value)}
                        
                     />
                </div>

                
                <button type="submit">Submit</button>
                </form>
            </center>
        </div>
    );
}

export default AddPropertyForm;