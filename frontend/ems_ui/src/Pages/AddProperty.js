import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddPropertyForm() {
  const [PropertyName, setpropertyname] = useState("");
  const [PropertyDescription, setPropertyDescription] = useState("");
  const [MaxValue, setMaxValue] = useState("");
  const [MinValue, setMinValue] = useState("");
  const [MeasuringUnit, setMeasuringUnit] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/Data/AddProperty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        propertyname: PropertyName,
        maxvalue: MaxValue,
        minvalue: MinValue,
        description: PropertyDescription,
        measuringunit: MeasuringUnit
      })
    });

    if (response.ok) {
      setMessage("Property added successfully.");
    } else {
      setMessage("Failed to add property.");
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center position-relative">
      <video autoPlay loop muted className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="glass-card d-flex p-4 justify-content-center align-items-center" style={{ width: "380px", minHeight: "520px" }}>
        <center className="w-100">
          <h2 className="fw-bold mb-4">Add Property</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                placeholder="Name"
                type="text"
                value={PropertyName}
                onChange={(e) => setpropertyname(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                placeholder="Description"
                type="text"
                value={PropertyDescription}
                onChange={(e) => setPropertyDescription(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                placeholder="Maximum Range"
                type="text"
                value={MaxValue}
                onChange={(e) => setMaxValue(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                placeholder="Minimum Range"
                type="text"
                value={MinValue}
                onChange={(e) => setMinValue(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                placeholder="Measuring Unit"
                type="text"
                value={MeasuringUnit}
                onChange={(e) => setMeasuringUnit(e.target.value)}
              />
            </div>

            <button className="glass-btn" type="submit">Submit</button>
          </form>

          {message && <p className="mt-3 text-white">{message}</p>}
        </center>
      </div>
    </div>
  );
}

export default AddPropertyForm;
