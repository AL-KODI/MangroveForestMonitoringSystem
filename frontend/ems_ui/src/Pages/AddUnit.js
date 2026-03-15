import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

function AddUnitForm() {
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
        unitdescription: UnitDescription,
        location: Location
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
  return (
    <div class="  vh-100 d-flex justify-content-center align-items-center position-relative">
      <video autoPlay loop muted className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div class="glass-card d-flex p-4 justify-content-center align-items-center " style={{ width: "350px", height: "400px" }}>

        <center>
          <h2 class="fw-bold mb-4" >Add Unit</h2>
          <form onSubmit={handleSubmit}>
            <div class="mb-3">
              <input
                class="glass-input form-control-sm"
                placeholder="Name"
                type="text"
                value={UnitName}
                onChange={e => setUnitname(e.target.value)}
              />
            </div>

            <div class="mb-3">
              <textarea
                class="glass-input form-control-sm"
                placeholder="Description"
                type="text"
                value={UnitDescription}
                onChange={e => setUnitdescription(e.target.value)}
              />
            </div>

            <div class="mb-3">
              <input
                class="glass-input form-control-sm"
                placeholder="Location"
                type="text"
                value={Location}
                onChange={e => setUnitlocation(e.target.value)}
              />
            </div>
            <button class="glass-btn" type="submit">Submit</button>
          </form>
        </center>
      </div>
    </div>
  );
}

export default AddUnitForm;