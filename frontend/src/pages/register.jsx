import api from "../services/api";
import { useState } from "react";
import logo from "../assets/logo.png";
function Register({ setPage, setUserData }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const handleVerify = async (e) => {
  e.preventDefault(); 
  if (!name.trim() || !email.trim()) {
    alert("Please fill all fields");
    return;
  }
  if (!role) {
    alert("Please select a role");
    return;
  }
  try {
    const response = await api.post("/auth/register", {
      name: name.trim(),
      email: email.trim(),
      role: role
    });

    // Check server response
    if (response.data === "Provided Email is already existed") {
      alert(response.data);  // Show alert
      return;                // Stop further execution
    }

    // Otherwise OTP sent successfully
    alert("OTP sent successfully to your email");
    setUserData({ name: name.trim(), email: email.trim(), role: role });
    setPage("otpVerification");

  } catch (error) {
    console.error("OTP Error:", error);
    alert("Error sending OTP");
  }
};

  return (
    <div>
      <div className="heading-container">
        <img src={logo} alt="Volunteer Logo" className="logo" />
        <div className="header-left">
          <h1>Volunteer Management System</h1>
          <p>Join hands to serve the community</p>
        </div> <br></br><b></b><b></b><b><b></b></b><br></br><b></b><b></b><b><b></b></b>
        <div className="nav-buttons">
          <button onClick={() => setPage("landing")}>Home</button>
          <button onClick={() => setPage("login")}>Login</button>
        </div>
      </div>
      <div className="card" style={{ width: "1000px" }}>
        <h2 style={{ marginBottom: "10%" }}>Register</h2>
        <form onSubmit={handleVerify}>
          <input type="text" placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} /> <br />
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} /> <br />
           <select required value={role} onChange={(e) => setRole(e.target.value)} >
            <option value="">Select Role</option>
            <option value="volunteer">Volunteer</option>
            <option value="organizer">Organizer</option>
          </select> <br />
           <button type="submit"> Generate OTP </button>
        </form>
      </div>
    </div>);
}
export default Register;