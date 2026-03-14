import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

function AddUnitForm(){
    const [UnitName, setUnitname] = useState("");
    const [UnitDescription, setUnitdescription] = useState("");
    const [Location, setUnitlocation] = useState("");
    const navigate = useNavigate();

      const handleSubmit = async (e) => {
    e.preventDefault(); // stop page reload
    
    const response = await fetch("http://localhost:5000/Data/AddUnit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        unitname: UnitName,
        unitdescription : UnitDescription,
        location : Location
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
                        value={UnitName}
                        onChange={e =>  setUnitname(e.target.value)}
                     />
                </div>

                <div>
                    <label>Description:</label><br />
                    <input
                        type="text"
                        value={UnitDescription}
                        onChange={e =>  setUnitdescription(e.target.value)}
                     />
                </div>

                <div>
                    <label>Location:</label><br />
                    <input
                        type="text"
                        value={Location}
                        onChange={e =>  setUnitlocation(e.target.value)}
                     />
                </div>
                <button type="submit">Submit</button>
                </form>
            </center>
        </div>
    );
}

export default AddUnitForm;