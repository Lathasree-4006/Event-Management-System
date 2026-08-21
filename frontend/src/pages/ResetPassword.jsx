import { useState } from "react";
import api from "../services/api";

function ResetPassword({ token, setPage }) {
  const [password, setPassword] = useState("");

  const handleReset = async () => {
    if (!password) {
      alert("Enter new password");
      return;
    }
    try {
      await api.post("/auth/reset-password", { token, password });
      alert("Password reset successful!");
      setPage("login");
    } catch {
      alert("Invalid or expired token");
    }
  };
  return (
    <div className="password-page" style={styles.container}>
      <div className="password-card" style={styles.card}>
        <h2>Reset Password</h2>
        <input
          className="password-input"
          type="password"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button className="password-action" onClick={handleReset} style={styles.button}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  card: {
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center",
    background: "#fff",
  },
  input: {
    width: "100%",
    padding: "8px",
    margin: "10px 0",
  },
  button: {
    padding: "10px",
    width: "100%",
    background: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};