import "./App.css";
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Routes, Route, useNavigate } from "react-router-dom";

import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import OtpVerification from "./pages/otpVerification";
import VolunteerRegistration from "./pages/volunteerRegistration";
import OrganizerRegistration from "./pages/organizerRegistration";
import AdminDashboard from "./pages/adminDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {

  const [userData, setUserData] = useState(() => {
  const savedUser = localStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
});

  const navigate = useNavigate();

  // this replaces setPage
  const setPage = (page) => {

    if (page === "landing") navigate("/");
    if (page === "login") navigate("/login");
    if (page === "register") navigate("/register");
    if (page === "otpVerification") navigate("/otpVerification");
    if (page === "volunteerRegistration") navigate("/volunteerRegistration");
    if (page === "organizerRegistration") navigate("/organizerRegistration");
    if (page === "organizerDashboard") navigate("/organizer/dashboard");
    if (page === "volunteerDashboard") navigate("/volunteer/dashboard");
    if (page === "adminDashboard") navigate("/admin/dashboard");
    if (page === "forgot") navigate("/forgotPassword");

  };

  return (
    <div className="container">

      <Routes>

        <Route
          path="/"
          element={<Landing setPage={setPage} />}
        />

        <Route
          path="/login"
          element={<Login setPage={setPage} setUserData={setUserData} />}
        />

        <Route
          path="/register"
          element={<Register setPage={setPage} setUserData={setUserData} />}
        />

        <Route
          path="/otpVerification"
          element={<OtpVerification userData={userData} setPage={setPage} />}
        />

        <Route
          path="/volunteerRegistration"
          element={<VolunteerRegistration userData={userData} setPage={setPage} />}
        />

        <Route
          path="/organizerRegistration"
          element={<OrganizerRegistration userData={userData} setPage={setPage} />}
        />

        <Route
          path="/organizer/dashboard"
          element={<OrganizerDashboard userData={userData} setPage={setPage} />}
        />

        <Route
          path="/volunteer/dashboard"
          element={<VolunteerDashboard userData={userData} setPage={setPage} />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard userData={userData} setPage={setPage} />}
        />

        <Route
          path="/forgotPassword"
          element={<ForgotPassword setPage={setPage} />}
        />

        <Route
          path="/ResetPassword/:token"
          element={<ResetPassword />}
        />

      </Routes>

    </div>
  );
}

export default App;