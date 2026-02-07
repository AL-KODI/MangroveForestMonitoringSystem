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
    e.preventDefault(); // stop page reload
    
    const response = await fetch("http://localhost:5000/User/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        username: username,
        password : password
      })
    });

const res = await fetch("http://localhost:5000/User/whoami", {
      credentials: "include"
    });

    
    const data = await res.json(); // parse JSON
setUser(data);

console.log("Username:", data.username); 
  };

  return (
    <div>
        <center>
      <h2>Log In</h2>

      <form onSubmit={handleSubmit}>
        

        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={username}
            onChange={e =>  setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        

        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
      </center>
    </div>
  );
}

export default LoginForm;


