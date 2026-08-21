import { useState } from "react";
import api from "../services/api";

function ForgotPassword({ setPage }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });

      setMessage("✅ Reset link sent! Check your email.");
      setEmail("");

      // optional auto-redirect
      setTimeout(() => setPage("login"), 2500);

    } catch (err) {
      setError("❌ Email not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-page" style={styles.container}>
      <div className="password-card" style={styles.card}>
        <h2 style={{ marginBottom: "10px" }}>Forgot Password</h2>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Enter your registered email to receive a reset link.
        </p>

        <input
          className="password-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <button
          className="password-action"
          onClick={handleSubmit}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p
          className="password-back"
          style={styles.back}
          onClick={() => setPage("login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  width: "520px",
  height: "430px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",   
  alignItems: "center",      
  gap: "18px",              
  textAlign: "center",
  animation: "fadeIn 0.4s ease"
},
  input: {
  width: "100%",
  maxWidth: "380px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px"
},

button: {
  width: "100%",
  maxWidth: "380px",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#3aa6a0",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer"
},
  success: {
    color: "green",
    fontSize: "14px",
    marginBottom: "10px"
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px"
  },
  back: {
    marginTop: "15px",
    color: "#3aa6a0",
    cursor: "pointer",
    fontSize: "14px"
  }
};