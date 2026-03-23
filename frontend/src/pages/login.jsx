import { useState } from "react";
import api from "../services/api";
import logo from "../assets/logo.png";
function Login({ setPage, setUserData }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }
    
    try {
      const response = await api.post("/auth/login", { email, password });

      const { role, name } = response.data;
      const user = { email, name, role };
      if (typeof setUserData === "function") {
        setUserData(user); 
         localStorage.setItem("user", JSON.stringify(user));
      } 
    
      else {
        console.error("setUserData prop is missing!");
      }


      if (role === "admin") setPage("adminDashboard");
      else if (role === "organizer") setPage("organizerDashboard");
      else if (role === "volunteer") setPage("volunteerDashboard");

    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Login failed");
    }
  };
  return (
    <div>
      <div className="heading-container">
        <img src={logo} alt="Volunteer Logo" className="logo" />
        <div className="header-left">
          <h1>Volunteer Management System</h1>
          <p>Join hands to serve the community</p>
        </div>
        <br></br><b></b><b></b><b><b></b></b><br></br><b></b><b></b><b><b></b></b>
        <div className="nav-buttons">
          <button onClick={() => setPage("landing")}>Home</button>
          <button onClick={() => setPage("register")}>Register</button>
        </div>
      </div>
      
      <div className="card" style={{marginTop:"40%"}}>
        <h2 style={{marginBottom : "10%"}}>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>
    
      <div style={{ marginTop: "15px",justifyContent:"space-around" }}>
        <p
          style={{ color: "Black", cursor: "pointer" , marginTop:"10%" , textAlign : "left",fontSize:"medium",fontFamily:"initial" }}
          onClick={() => setPage("forgot")}
        >
          Forgot Password?
        </p>
        <div style={{display:"flex" , justifyContent:"space-between"}}>
           <p style={{ color: "Black",marginTop: "15px" ,textAlign : "left",fontsize:"medium" , fontFamily:"initial"}}>
          Don’t have an account?{" "}</p>
          <p
            style={{ marginTop: "15px", color:"#32C4C0", cursor: "pointer" ,fontsize:"small",textAlign : "right",fontFamily:"initial"}}
            onClick={() => setPage("register")}
          >
            Create an account
          </p>
        </div>
        
      </div>
      </div>
    </div>
  );
}

export default Login;
