import { useEffect, useState } from "react";
import api from "../services/api";
import axios from "axios";
import { MdVerified } from "react-icons/md";
import { FaUser, FaSignOutAlt, FaBell, FaCalendarAlt, FaHistory, FaFilter, FaTrash, FaInbox, FaStar,FaCertificate,FaShieldAlt } from "react-icons/fa";
function VolunteerDashboard({ userData, setPage, setUserData }) {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [requests, setRequests] = useState([]);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [selectedHistoryEvent, setSelectedHistoryEvent] = useState(null);
  const [requestStatuses, setRequestStatuses] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [rating, setRating] = useState(0);
  const [submittedFeedback, setSubmittedFeedback] = useState({});
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [message, setMessage] = useState("");
  const [certificateEvents, setCertificateEvents] = useState([]);
  const [govtIdFile, setGovtIdFile] = useState(null);
const [validationStatus, setValidationStatus] = useState(null);
const [validationDocument, setValidationDocument] = useState(null);
const [preview, setPreview] = useState(null);
useEffect(() => {

  if (profile && profile.id) {
    fetchValidationStatus();
  }

}, [profile]);
  const [filters, setFilters] = useState({
    location: "",
    category: ""
  });
  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
  document.title = "Volunteer"
}, []);

  useEffect(() => {
    if (tab === "requests" && profile?.id) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 10000);
      return () => clearInterval(interval);
    }
  }, [tab, profile]);
useEffect(()=>{

  if(tab === "validation"){
    fetchValidationStatus();
  }

},[tab]);

useEffect(() => {
  if(userData?.email){
    fetchValidationStatus();
  }
}, [userData]);
useEffect(() => {
  return () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };
}, [preview]);
  useEffect(() => {
    if (!userData?.email) return;


    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);

  }, [userData?.email]);
  const fetchProfile = async () => {
    try {
      const res = await api.get(`/volunteer/email/${userData.email}`);
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadValidationDocument = async () => {
  
    if (!govtIdFile) {
      alert("Please select the document");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", govtIdFile);
  
    try {
  
      await api.post(
        `/volunteer/validation/${profile.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
  
      alert("Document uploaded successfully");
  
      setValidationStatus("PENDING");
  
    } catch (error) {
  
      console.error("Upload Error:", error.response?.data);
  
      alert("Upload failed");
  
    }
  
  };
const fetchValidationStatus = async () => {

  if (!profile || !profile.id) return;

  try {

    const res = await api.get(`/volunteer/validation/${profile.id}`);

    setValidationStatus(res.data.validationStatus);
    setValidationDocument(res.data.validationDocument);

  } catch (error) {

    console.error("Validation status error", error);

  }

};

  const fetchStatuses = async (events) => {
    if (!profile?.id) return;

    const statuses = {};

    for (let event of events) {
      try {
        const res = await api.get(`/events/${event.id}/status/${profile.id}`);
        statuses[event.id] = res.data;
      } catch (err) {
        console.error("Status fetch failed:", err);
        statuses[event.id] = "NOT_REQUESTED"; // fallback
      }
    }

    setRequestStatuses(statuses);
  };


  const fetchNotifications = async () => {
    try {
      console.log("Fetching notifications for:", userData.email);

      const res = await api.get(`/notifications/${userData.email}`);

      console.log("Notifications:", res.data);

      setNotifications(res.data);

      const unread = res.data.filter(n => !n.read).length;
      console.log("Unread count:", unread);

      setUnreadCount(unread);

    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    if (!notifications.length) return;

    const newAssignments = notifications.filter(n =>
      !n.read && n.message.includes("APPROVED")
    );

    newAssignments.forEach(n => {
      alert(`New task assigned: ${n.message}`);
    });
  }, [notifications]);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return created.toLocaleDateString(); // fallback
  };

  const fetchEvents = async () => {
    const res = await api.get("/events");
    setEvents(res.data);
    setTimeout(() => fetchStatuses(res.data), 100);
  };

  const filterEvents = async () => {
    const res = await api.get("/events/filter", {
      params: {
        location: filters.location,
        category: filters.category.toUpperCase()
      }
    });
    setEvents(res.data);
  };

  const submitFeedback = async (eventId) => {

  try {

    await axios.post(
      "http://localhost:8080/api/feedback/submit",
      {
        eventId: eventId,
        volunteerId: profile.id,
        rating: rating,
        message: message
      }
    );

    alert("Feedback Saved");

    // fetch updated feedback from backend
    fetchFeedback(eventId);

  } catch (err) {
    alert(err.response?.data || "Feedback failed");
  }

};

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/${userData.email}/mark-read`);
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notifications read", err);
    }
  };

  const fetchFeedback = async (eventId) => {
  try {
    const res = await axios.get(
      `http://localhost:8080/api/feedback/event/${eventId}/volunteer/${profile.id}`
    );

    if (res.data) {

      setSubmittedFeedback(prev => ({
        ...prev,
        [eventId]: res.data
      }));

      // load feedback into form
      setRating(res.data.rating);
      setMessage(res.data.message);
    }

  } catch (err) {
    console.log("No feedback found");
  }
};

  const joinEvent = async (eventId) => {
    if (!profile?.id) return alert("Profile not loaded");

    try {
      await api.post(`/events/${eventId}/apply`, {
        volunteerId: profile.id
      });

      alert("Request sent to organizer");

      //  refresh status immediately
      fetchStatuses(events);

    } catch (err) {
      if (err.response?.status === 409) {
        alert("You already applied");
        fetchStatuses(events); // sync UI
      } else {
        console.error("Join error:", err);
        alert("Failed to send request");
      }
    }
  };

  const fetchRequests = async () => {
    const res = await api.get(`/volunteer/requests/${profile.id}`);
    setRequests(res.data);
  };

  const fetchHistory = async () => {
    if (!profile?.id) return;
    try {
      const res = await api.get(`/volunteer/${profile.id}/events`);
      console.log("History response:", res.data); // <--- ADD THIS
      setHistoryEvents(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };
  useEffect(() => {
    if (tab === "history" && profile?.id) {
      fetchHistory();
      fetchAttendance();
    }
  }, [tab, profile]);

  const dropEvent = async (eventId, volunteerId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8080/api/events/${eventId}/cancel/${volunteerId}`
      );
      return res;
    } catch (error) {
      console.error("Error cancelling participation", error);
      throw error;
    }
  };
  useEffect(() => {
    if (tab === "events" && profile?.id) {
      fetchEvents();
    }
    if (tab === "requests" && profile?.id) fetchRequests();

  }, [tab, profile]);


  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Error deleting notification", err);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await api.get(`/certificate/volunteer/${profile.id}`);
      setCertificateEvents(res.data);
    } catch (err) {
      console.error("Error fetching certificates", err);
    }
  };
  useEffect(() => {
    if (tab === "certificate" && profile?.id) {
      fetchCertificates();
    }
  }, [tab, profile]);

  const fetchAttendance = async () => {
    const res = await axios.get(
      `http://localhost:8080/api/attendance/volunteer/${profile.id}`
    );
    setAttendance(res.data);
  };

  const downloadCertificate = async (eventId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/certificate/${profile.id}/${eventId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "certificate.pdf");

      document.body.appendChild(link);
      link.click();

    } catch (error) {
      console.error("Error downloading certificate", error);
      alert("Failed to download certificate");
    }
  };

  useEffect(() => {
    if (selectedHistoryEvent && profile?.id) {
      fetchAttendance();
    }
  }, [selectedHistoryEvent, profile]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append(
        "volunteer",
        new Blob([JSON.stringify(profile)], { type: "application/json" })
      );

      if (selectedFile) {
        formData.append("profilePic", selectedFile);
      }

      await api.put(`/volunteer/update/${profile.id}`, formData);

      alert("Profile updated successfully!");
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Update failed");
    }
  };

  if (loading) return <p>Loading volunteer profile...</p>;
  if (!profile) return <p>No profile found</p>;

  const cardStyle = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    textAlign: "center"
  };

  const thStyle = {
    padding: "10px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
  };

  const tdStyle = {
    padding: "10px",
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#1abc9c", "#3498db", "#9b59b6", "#e67e22",
      "#e74c3c", "#2ecc71", "#f39c12", "#16a085"
    ];

    if (!name) return "#95a5a6";

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleLogout = () => {
    localStorage.clear();
    setPage("login");
  };

  const selectedEventAttendance = attendance.find(
    a => a.eventId === selectedHistoryEvent?.eventId
  );

  // Total event hours (calculate from start & end time)
  const totalEventHours = selectedHistoryEvent
    ? Number(
      (
        (new Date(selectedHistoryEvent.endDateTime) -
          new Date(selectedHistoryEvent.startDateTime)) /
        (1000 * 60 * 60)
      ).toFixed(1)
    )
    : 0;
  // Attended hours
  const attendedHours = selectedEventAttendance?.hoursAttended || 0;

  // Percentage calculation
  const eventAttendancePercentage =
    totalEventHours > 0
      ? Math.round((attendedHours / totalEventHours) * 100)
      : 0;

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);

    if (now < start) return { text: "Upcoming", color: "#3498db" };
    if (now >= start && now <= end) return { text: "Ongoing", color: "#27ae60" };
    if (now > end) return { text: "Completed", color: "#95a5a6" };

    return { text: "Unknown", color: "#7f8c8d" };
  };

  const isEventCompleted = (endDateTime) => {
  return new Date(endDateTime) < new Date();
};

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: "Arial" }}>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "60px",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          zIndex: 1000
        }}
      >
        {/* LEFT */}
        <div style={{ width: "60px" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>

        {/* CENTER */}
        <div style={{ flex: 1, textAlign: "center", fontSize: "25px", fontWeight: "60" }}>
          Volunteer Dashboard
        </div>

        {/* RIGHT */}
        <div style={{ width: "120px", display: "flex", justifyContent: "flex-end", gap: "15px" }}>

          {/*  Bell */}
          <div style={{ position: "relative", cursor: "pointer", justifyContent: "center" }} onClick={() => { setTab("notifications"); markAllAsRead() }}>
            <FaBell size={20} />

            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  justifyContent: "center"
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          <div
  style={{
    position: "relative",
    width: "40px",
    height: "40px"
  }}
>

  {/* Avatar */}
  <div
    style={{
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "#e74c3c",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold"
    }}
  >
    {(profile?.name || userData?.name || "O").charAt(0).toUpperCase()}
  </div>

  {/* Verified Badge */}
  {validationStatus === "APPROVED" && (
    <MdVerified
      size={18}
      color="green"
      style={{
        position: "absolute",
        top: "-4px",
        right: "-4px",
        background: "white",
        borderRadius: "50%"
      }}
    />
  )}
</div>
</div>      </header>

      {sidebarOpen && (
        <div className="sidebar-org"
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            width: "220px",
            height: "calc(100vh - 60px)",
            background: "#2c3e50",
            color: "white",
            padding: "20px",
            zIndex: 999
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li
              style={{ padding: "10px 0", cursor: "pointer" ,marginBottom:"10px", backgroundColor: tab === "profile" ? "rgb(245, 188, 82)" : " "}}
              onClick={() => setTab("profile")}
            >
              <FaUser style={{ marginRight: "10px" }} />
              Profile
            </li>
            <li
              style={{ padding: "10px 0", cursor: "pointer" ,marginBottom:"10px",  backgroundColor: tab === "requests" ? "rgb(245, 188, 82)" : " "}}
              onClick={() => setTab("requests")}
            >
              <FaInbox /> My Requests
            </li>
            <li
              style={{ padding: "10px 0", cursor: "pointer" ,marginBottom:"10px", backgroundColor: tab === "certificate" ? "rgb(245, 188, 82)" : " "}}
              onClick={() => setTab("certificate")}
            >
              <FaCertificate style={{ marginRight: "10px" }} />
              Certificates
            </li>
            <li
style={{ padding: "10px 0", cursor: "pointer" ,marginBottom:"10px", backgroundColor: tab === "validation" ? "rgb(245, 188, 82)" : " "}}
onClick={() => setTab("validation")}
>
<FaShieldAlt style={{ marginRight: "10px" }} />  Validation
</li>
            <li
              onClick={() => { setTab("notifications"); markAllAsRead(); }}
              style={{ padding: "10px 0", cursor: "pointer",marginBottom:"10px", backgroundColor: tab === "notifications" ? "rgb(245, 188, 82)" : " " }}
            >
              <FaBell style={{ marginRight: "10px" }} />
              Notifications
            </li>
            <li style={{ padding: "10px 0", cursor: "pointer",marginBottom:"10px", backgroundColor: tab === "events" ? "rgb(245, 188, 82)" : " " }} onClick={() => setTab("events")}><FaCalendarAlt /> Events Available</li>
            <li style={{ padding: "10px 0", cursor: "pointer",marginBottom:"10px", backgroundColor: tab === "history" ? "rgb(245, 188, 82)" : " " }} onClick={() => setTab("history")}><FaHistory /> Participation History</li>
            <li style={{ padding: "10px 0", cursor: "pointer"}} onClick={handleLogout}>
              <FaSignOutAlt style={{ marginRight: "10px" }} />
              Logout
            </li>
          </ul>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "60px",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px",
          overflowY: "auto",
          marginLeft: sidebarOpen ? "220px" : "0",
          transition: "margin-left 0.3s ease",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "Black" }}>
          Welcome, {profile.name}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}
        >
          <div style={cardStyle}>
            <h3>Status</h3>
            <p>{profile.status}</p>
          </div>

          <div style={cardStyle}>
            <h3>Languages</h3>
            <p>{profile.languagesKnown || "N/A"}</p>
          </div>

          <div style={cardStyle}>
            <h3>Address</h3>
            <p>{profile.fullAddress || "N/A"}</p>
          </div>
        </div>


        {tab === "profile" && (
          <div style={{ ...cardStyle, textAlign: "left" }}>
            <h3>Profile Details</h3>

            <p><strong>Email:</strong> {profile.email}</p>

            <p>
              <strong>Phone:</strong>{" "}
              {editMode ? (
                <input name="phone" value={profile.phone || ""} onChange={handleChange} />
              ) : (
                profile.phone
              )}
            </p>

            <p>
              <strong>Full Address:</strong>{" "}
              {editMode ? (
                <input name="fullAddress" value={profile.fullAddress || ""} onChange={handleChange} />
              ) : (
                profile.fullAddress
              )}
            </p>

            <p>
              <strong>Languages Known:</strong>{" "}
              {editMode ? (
                <input name="languagesKnown" value={profile.languagesKnown || ""} onChange={handleChange} />
              ) : (
                profile.languagesKnown
              )}
            </p>

            <p>
              <strong>Areas of Interest:</strong>{" "}
              {editMode ? (
                <input name="areasOfInterest" value={profile.areasOfInterest || ""} onChange={handleChange} />
              ) : (
                profile.areasOfInterest
              )}
            </p>

            <div style={{ marginTop: "15px" }}>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} style={{ backgroundColor: "rgb(235, 156, 10)" }}>Edit Profile</button>
              ) : (
                <button onClick={handleSave} style={{ backgroundColor: "rgb(235, 156, 10)" }}>Save Changes</button>
              )}
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div style={{ ...cardStyle, textAlign: "left" }}>
            <h3>Notifications</h3>
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{
                  background: n.read
                    ? "#eee"
                    : n.message.includes("APPROVED")
                      ? "#c3e6cb" // green for approved task
                      : "#fff3cd",  // yellow for other unread
                  padding: "10px",
                  margin: "15px",
                  borderRadius: "5px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <p style={{ flex: 1 }}>{n.message}</p>
                  <small style={{ color: "gray" }}>
                    {formatTimeAgo(n.createdAt)}
                  </small>
                  <button className="delete-btn" onClick={() => deleteNotification(n.id)}>
                    <FaTrash />
                  </button>
                </div>
              ))
            )}

          </div>
        )}


        {tab === "events" && (
          <div style={{ ...cardStyle, textAlign: "left" }}>
            <h3>Available Events</h3>

            <div style={{ marginBottom: "15px", justifyContent: "right", display: "flex", paddingRight: "12px" }}>
              <button onClick={filterEvents} style={{ borderRadius: "200px", border: "1px solid black" }}><FaFilter /></button>
              <input
                placeholder="Location"
                value={filters.location}
                onChange={e => setFilters({ ...filters, location: e.target.value })}
                style={{ marginRight: "10px", marginLeft: "10px" }}
              />

              <select
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
                style={{ marginRight: "10px" }}
              >
                <option value="">All Categories</option>
                <option>Disaster Relief</option>
                <option>Health</option>
                <option>Environment</option>
                <option>Education</option>
                <option>Social Service</option>
                <option>Animal Welfare</option>
                <option>Celebration</option>
              </select>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px"
            }}>
              {events.map(event => (
                <div key={event.id} style={cardStyle}>
                  <h4>{event.eventName}</h4>
                  <p>{event.location}</p>
                  <p>{"Starts at : " + event.startDateTime}</p>
                  <p>{"ends at : " + event.endDateTime}</p>
                  <p>Category: {event.category}</p>
                  <p>Slots: {event.volunteersRequired}</p>
                  {requestStatuses[event.id] === "APPROVED" ? (
                    <span className="approved-tag">Approved</span>
                  ) : requestStatuses[event.id] === "PENDING" ? (
                    <span className="pending-tag">Pending</span>
                  ) : requestStatuses[event.id] === "REJECTED" ? (
                    <span className="rejected-tag">Rejected</span>
                  ) : (
                    <button
                      disabled={!event.registrationOpen}
                      onClick={() => joinEvent(event.id)}
                      className={`join-btn ${!event.registrationOpen ? "disabled" : ""}`}
                    >
                      {event.registrationOpen ? "Join" : "Registration Closed"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "requests" && (
          <div style={{ ...cardStyle, textAlign: "left" }}>
            <h3>My Requests</h3>

            {requests.length === 0 ? (
              <p>No requests found</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                <thead>
                  <tr style={{ background: "#ffffff", color: "Black" }}>
                    <th style={thStyle}>Event</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Organizer</th>
                    <th style={thStyle}>Start Date</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Requested At</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={tdStyle}>{r.eventName}</td>
                      <td style={tdStyle}>{r.location}</td>
                      <td style={tdStyle}>{r.organizerName}</td>
                      <td style={tdStyle}>
                        {new Date(r.startDateTime).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "15px",
                            color: "white",
                            background:
                              r.status === "APPROVED"
                                ? "green"
                                : r.status === "REJECTED"
                                  ? "red"
                                  : "orange",
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {r.requestedAt ? formatTimeAgo(r.requestedAt) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "certificate" && (
          <div style={{ ...cardStyle, textAlign: "left" }}>
            <h3>My Certificates</h3>

            {certificateEvents.length === 0 ? (
              <p>No certificates available yet</p>
            ) : (
              <table
                border="1"
                cellPadding="8"
                cellSpacing="0"
                 style={{
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    background: "white",
    borderRadius: "8px",
    overflow: "hidden"
  }}
              >
                <thead style={{
    background: "#2c3e50",
    color: "white",
    textAlign: "center"
  }}>
                  <tr>
                    <th style={{ padding: "12px" }}>Event Name</th>
<th style={{ padding: "12px" }}>Location</th>
<th style={{ padding: "12px" }}>Date</th>
<th style={{ padding: "12px" }}>Hours Attended</th>
<th style={{ padding: "12px" }}>Attendance %</th>
<th style={{ padding: "12px" }}>Certificate</th>
                  </tr>
                </thead>

                <tbody>
                  {certificateEvents.map((event) => {

                    const percentage = event.attendancePercentage || 0;

                    return (
                      <tr key={event.eventId}>
                        <td style={{ padding: "12px", textAlign: "center" }}>{event.eventName}</td>

                        <td style={{ padding: "12px", textAlign: "center" }}>{event.location}</td>

                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {new Date(event.startDateTime).toLocaleDateString()}
                        </td>

                        <td style={{ padding: "12px", textAlign: "center" }}>{event.hoursAttended} hrs</td>

                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <span
                            style={{
                              fontWeight: "bold",
                              color:
                                percentage >= 75
                                  ? "green"
                                  : percentage >= 50
                                    ? "orange"
                                    : "red"
                            }}
                          >
                            {percentage}%
                          </span>
                        </td>

                        <td>
                          <button
                            disabled={percentage < 75 || !event.certificateApproved}
                            onClick={() => downloadCertificate(event.eventId)}
                            style={{
  padding: "8px 16px",
  backgroundColor:
    percentage >= 75 && event.certificateApproved ? "#27ae60" : "#bdc3c7",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",

  cursor:
    percentage >= 75 && event.certificateApproved
      ? "pointer"
      : "not-allowed"
}}
                          >
                            {percentage < 75
                              ? "Not Eligible"
                              : !event.certificateApproved
                                ? "Waiting for Admin Approval"
                                : "Download"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

{tab === "validation" && (

<div style={{
background:"white",
padding:"25px",
borderRadius:"10px",
boxShadow:"0 2px 6px rgba(0,0,0,0.1)"
}}>

<h2>Account Verification</h2>

<p>
Upload a government ID for verification.
Admin will review and approve your account.
</p>

<br/>

{validationStatus === "APPROVED" ? (

<div style={{color:"green",fontWeight:"bold"}}>

✅ Your account is Verified

<br/><br/>


    <img
      src={`http://localhost:8080/${validationDocument}`}
      alt="Uploaded ID"
      style={{width:"150px", borderRadius:"6px"}}
    />
  

</div>

) : (

<>

<input
  type="file"
  accept="image/png, image/jpg, image/jpeg"
  onChange={(e) => {
  const file = e.target.files[0];
  setGovtIdFile(file);

  if (file) {
    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);
  }
}}
/>
<br/>
{preview && (
  <div style={{ marginTop: "15px" }}>
    <h5>Document Preview</h5>

    <img
      src={preview}
      alt="Document Preview"
      style={{
        width: "300px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        objectFit: "cover"
      }}
    />

  </div>
)}

<br/>

<button
onClick={uploadValidationDocument}
disabled={!document}
>
Upload Document
</button>

{validationStatus === "PENDING" && (

<p style={{color:"orange",marginTop:"10px"}}>
⏳ Waiting for admin approval
</p>

)}

</>

)}

</div>

)}


        {tab === "history" && (
          <div>
            <h2 style={{ marginBottom: "15px" }}>My Events</h2>

            {/* History cards */}
            <div
              style={{
                display: "grid",
                gap: "15px",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
              }}
            >
              {historyEvents.map(event => (
                <div
    key={event.eventId}
    className="history-event-card"
    onClick={() => {
      setSelectedHistoryEvent(event);
      setRating(0);
      setMessage("");
      fetchFeedback(event.eventId);
    }}
  
                  style={{
                    border: selectedHistoryEvent?.eventId === event.eventId ? "2px solid #000000" : "1px solid #ddd",
                    padding: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: selectedHistoryEvent?.eventId === event.eventId ? "#ffebce" : "white",
                    transition: "all 0.2s ease",
                    boxShadow: selectedHistoryEvent?.eventId === event.eventId ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ marginBottom: "8px" }}>{event.eventName}</h4>

                    {/* Status Badge */}
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "white",
                        background: getEventStatus(event).color
                      }}
                    >
                      {getEventStatus(event).text}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0" }}>{event.location}</p>
                  <p style={{ margin: "4px 0" }}>
                    {new Date(event.startDateTime).toLocaleString()} - {new Date(event.endDateTime).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Selected Event Details */}
            {selectedHistoryEvent && (
              <div
                style={{
                  marginTop: "20px",
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                }}
              >
                <h3>{selectedHistoryEvent.eventName}</h3><hr></hr>
                <p><b>Location:</b> {selectedHistoryEvent.location}</p>
                <p><b>Start:</b> {new Date(selectedHistoryEvent.startDateTime).toLocaleString()}</p>
                <p><b>End:</b> {new Date(selectedHistoryEvent.endDateTime).toLocaleString()}</p>
                <p><b>Assigned Task:</b> {selectedHistoryEvent.assignedWork}</p>
                <hr style={{ margin: "15px 0" }} />

                <h4>Attendance Details</h4>

                {selectedEventAttendance ? (
                  <div>
                    <p>
                      <b>Status:</b>{" "}
                      <span
                        style={{
                          color:
                            selectedEventAttendance.status === "Present"
                              ? "green"
                              : "red",
                          fontWeight: "bold"
                        }}
                      >
                        {selectedEventAttendance.status}
                      </span>
                    </p>

                    <p>
                      <b>Hours Attended:</b>{" "}
                      {selectedEventAttendance.hoursAttended} hrs
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px"
                      }}
                    >
                      {/* Text */}
                      <div style={{ minWidth: "180px" }}>
                        {attendedHours.toFixed(1)} / {totalEventHours.toFixed(1)} hrs
                        <b> ({eventAttendancePercentage}%)</b>
                      </div>

                      {/* Progress Bar */}
                      <div
                        style={{
                          flex: 1,
                          height: "10px",
                          background: "#ddd",
                          borderRadius: "6px",
                          overflow: "hidden"
                        }}
                      >
                        <div
                          style={{
                            width: `${eventAttendancePercentage}%`,
                            height: "100%",
                            background:
                              eventAttendancePercentage >= 75
                                ? "green"
                                : eventAttendancePercentage >= 50
                                  ? "orange"
                                  : "red",
                            transition: "0.3s"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "gray" }}>Attendance not marked yet</p>
                )}
<hr></hr>
                {isEventCompleted(selectedHistoryEvent.endDateTime) && (
                  <div>
                    <h4>Feedback</h4>

                    {submittedFeedback[selectedHistoryEvent.eventId] ? (

                      <div>

{/* Star Rating */}
<div style={{ display: "flex", gap: "5px", fontSize: "24px", cursor: "pointer" }}>
  {[1,2,3,4,5].map(star => (
    <FaStar
      key={star}
      onClick={() => setRating(star)}
      style={{
       color: star <= (rating || submittedFeedback[selectedHistoryEvent.eventId]?.rating) 
  ? "#f1c40f" 
  : "#ccc"
      }}
    />
  ))}
</div>

<textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  style={{
    width: "100%",
    marginTop: "10px",
    padding: "8px",
    borderRadius: "5px"
  }}
/>

<button
  style={{ marginTop: "10px",backgroundColor:"rgb(241, 183, 89)" }}
  onClick={() => submitFeedback(selectedHistoryEvent.eventId)}
>
  Update Feedback
</button>

</div>

                    ) : (

                     <div>

  {/* Star Rating */}
  <div style={{ display: "flex", gap: "5px", fontSize: "24px", cursor: "pointer" }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        onClick={() => setRating(star)}
        style={{
          color: star <= rating ? "#f1c40f" : "#ccc"
        }}
      />
    ))}
  </div>

  {/* Feedback Message */}
  <textarea
    placeholder="Write your feedback..."
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    style={{
      width: "100%",
      marginTop: "10px",
      padding: "8px",
      borderRadius: "5px"
    }}
  />

  <button
    style={{ marginTop: "10px" }}
    onClick={() => submitFeedback(selectedHistoryEvent.eventId)}
  >
    Submit Feedback
  </button>

</div>

                    )}

                  </div>
                )}
<hr></hr>
                {new Date(selectedHistoryEvent.endDateTime) < new Date() ? (

                  <button
                    disabled
                    style={{
                      marginTop: "15px",
                      padding: "8px 14px",
                      background: "#95a5a6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "not-allowed"
                    }}
                  >
                    Completed Event
                  </button>

                ) : selectedHistoryEvent.status === "CANCELLED" ? (

                  <button
                    disabled
                    style={{
                      marginTop: "15px",
                      padding: "8px 14px",
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "6px"
                    }}
                  >
                    Cancelled
                  </button>

                ) : (

                  <button
                    style={{
                      marginTop: "15px",
                      padding: "8px 14px",
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                    onClick={async () => {
                      if (!window.confirm("Cancel participation in this event?")) return;

                      try {
                        const res = await dropEvent(selectedHistoryEvent.eventId, profile.id);

                        if (res && res.status >= 200 && res.status < 300) {
                          alert("Event cancelled successfully!");
                          fetchHistory();
                          setSelectedHistoryEvent(null);
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Cancel failed");
                      }
                    }}
                  >
                    Cancel Event
                  </button>

                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default VolunteerDashboard;
