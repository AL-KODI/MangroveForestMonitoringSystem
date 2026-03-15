import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

function LoginForm() {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/User/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (response.ok) {
      const res = await fetch("http://localhost:5000/User/whoami", {
        credentials: "include"
      });

      const data = await res.json();
      setUser(data);
      navigate("/dashboard");
    } else {
      setMessage("Login failed");
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center position-relative">
      <video autoPlay loop muted className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="glass-card d-flex p-4 justify-content-center align-items-center" style={{ width: "350px", height: "400px" }}>
        <center>
          <h2 className="fw-bold mb-4">Log In</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                type="email"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <input
                className="glass-input form-control-sm"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="glass-btn" type="submit">Log In</button>
          </form>

          {message && <p className="mt-3 text-white">{message}</p>}
        </center>
      </div>
    </div>
  );
}

export default LoginForm;
