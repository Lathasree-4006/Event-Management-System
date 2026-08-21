import { useState, useEffect } from "react";
import api from "../services/api";
import logo from "../assets/logo.png";
function OtpVerification({ userData, setPage }) {

  const { email, role } = userData; 

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(300);
  const [isActive, setIsActive] = useState(true);

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerifyOtp = async () => {
  try {
    const response = await api.post("/auth/verify-otp", {
      email: email,
      otp: otp.join(""),
      name: userData.name,   // <-- include name
      role: userData.role    // <-- include role
    });

    alert(response.data);

    if (response.data === "OTP verified successfully") {
      if (role === "volunteer") {
        setPage("volunteerRegistration");
      } 
      if (role === "organizer") {
        setPage("organizerRegistration");
      }
    }

  } catch (error) {
    console.error("OTP verification error:", error);
    alert("OTP verification failed");
  }
};


  const handleResendOtp = async () => {
    try {
      await api.post("/auth/register", {
        email: email
      });

      alert("New OTP Sent!");
      setTimer(300);
      setIsActive(true);

    } catch (error) {
      alert("Error resending OTP");
    }
  };

  useEffect(() => {
    let interval = null;

    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timer]);

  return (
    <div>
       <div style={{backgroundColor: "white",
  width: "100%",
  padding: "10px 30px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  position: "fixed",
  top: "0px",
  left: "0",
  zIndex: "1000",
  display: "flex", 
  justifyContent: "left",
  alignItems: "center",
  borderRadius : "10px",
  marginBottom : "100%"}}>
          <img src={logo} alt="Volunteer Logo" className="logo" />
          <div className="header-left" style={{paddingLeft:"30px"}}>
            <h1>OTP Verification</h1>
          </div>

          </div>
    <div className="verify-otp-card">
    <div>
      <h2>Enter the 6-digit OTP</h2>

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        margin: "20px 0"
      }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleBackspace(e, index)}
            style={{
              width: "40px",
              height: "45px",
              textAlign: "center",
              fontSize: "18px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />
        ))}
      </div>

      <p>
        Time Remaining: {Math.floor(timer / 60)}:
        {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
      </p>
      <div style={{marginTop:"7%",display:"flex",justifyContent:"space-between"}} >
      <button onClick={handleVerifyOtp} disabled={timer === 0}>
        Verify OTP
      </button>

      <button
        onClick={handleResendOtp}
        disabled={timer > 0}
      >
        Resend OTP
      </button>
      </div>
    </div>
    </div>
    </div>
  );
}

export default OtpVerification;
