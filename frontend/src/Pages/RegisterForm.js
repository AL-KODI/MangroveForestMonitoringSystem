import { useState } from "react";
import { useNavigate } from "react-router-dom";
function RegisterForm() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop page reload

    const response = await fetch("http://localhost:5000/User/Register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
       
        email: email,
        password:password,
        confirmedPassword:confirmedPassword,
    
      })
    });

    const result = await response.json();
    if (result.success) {
        navigate(result.redirectTo);
    }
    setMessage(result.message);
  };

  return (
    <div>
        <center>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>
        

        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
        <div>
          <label>Confirm Password:</label><br />
          <input
            type="password"
            value={confirmedPassword}
            onChange={e => setConfirmedPassword(e.target.value)}
          />
        </div>

        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
      </center>
    </div>
  );
}

export default RegisterForm;


