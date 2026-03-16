import { useState } from "react";
import { useNavigate } from "react-router-dom";
function RegisterForm() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/User/Register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password,
          confirmedPassword: confirmedPassword,
        })
      });

      const result = await response.json();

      if (result.success) {
        navigate(result.redirectTo);
      } else {
        setMessage(result.message || "Registration failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMessageClass = () => {
    if (message.includes("success") || message.includes("welcome")) return "text-success";
    if (message.includes("error") || message.includes("failed")) return "text-danger";
    return "text-warning";
  };

  return (
    <div className="  vh-100 d-flex justify-content-center align-items-center position-relative">
      <video autoPlay loop muted className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="glass-card d-flex p-4 justify-content-center align-items-center " style={{ width: "350px", height: "400px" }}>

        <center>
          <h2 className="fw-bold mb-4" >Sign Up</h2>

          <form onSubmit={handleSubmit}>


            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                type="password"
                placeholder="Confirm Password"
                value={confirmedPassword}
                onChange={e => setConfirmedPassword(e.target.value)}
              />
            </div>

            <button className="glass-btn" type="submit">Submit</button>
          </form>

          {message && <p>{message}</p>}
        </center>
      </div>
    </div>
  );
}

export default RegisterForm;


