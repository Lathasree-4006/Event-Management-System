import { useEffect, useState } from "react";
import api from "../services/api";
import { FaUser, FaCalendarAlt, FaUsers, FaSignOutAlt, FaBell, FaTrash, FaEdit, FaMedal,FaTrophy,FaShieldAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import axios from "axios";
import html2canvas from "html2canvas";
function OrganizerDashboard({ userData, setPage }) {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editableEvent, setEditableEvent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [approvedVolunteers, setApprovedVolunteers] = useState([]);
  const [assignedVolunteers, setAssignedVolunteers] = useState([]);
  const [statusInputs, setStatusInputs] = useState({});
  const [savedRows, setSavedRows] = useState({});
  const [workInputs, setWorkInputs] = useState({});
  const [volunteerFeedbacks, setVolunteerFeedbacks] = useState([]);
  const [hoursInputs, setHoursInputs] = useState({});
  const [shareReward, setShareReward] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
const [rewards,setRewards] = useState([]);
const [govtIdFile, setGovtIdFile] = useState(null);
const [validationStatus, setValidationStatus] = useState("");
const [validationDocument, setValidationDocument] = useState("");
const [preview, setPreview] = useState(null);
useEffect(() => {

  if (profile && profile.id) {
    fetchValidationStatus();
  }

}, [profile]);
const fetchValidationStatus = async () => {

  try {

    const res = await api.get(`/organizer/validation/${profile.id}`);

    setValidationStatus(res.data.validationStatus);
    setValidationDocument(res.data.validationDocument);

  } catch (error) {

    console.error("Validation status error", error);

  }

};
useEffect(() => {
  if (selectedEvent) {
    fetchAttendance();
  }
}, [selectedEvent]);

const fetchAttendance = async () => {
  try {
    const res = await axios.get(
      `http://localhost:8080/api/attendance/event/${selectedEvent.id}`
    );

    setAttendanceData(res.data);

    // Pre-fill inputs
    const hoursMap = {};
    const statusMap = {};
    const savedMap = {};

    res.data.forEach(a => {
      hoursMap[a.volunteerId] = a.hoursAttended;
      statusMap[a.volunteerId] = a.status;
      savedMap[a.volunteerId] = true; // already saved
    });

    setHoursInputs(hoursMap);
    setStatusInputs(statusMap);
    setSavedRows(savedMap);

  } catch (err) {
    console.error("Error fetching attendance", err);
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
      `/organizer/validation/${profile.id}`,
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
const fetchRewards = async () => {

  const res = await api.get(`/organizer/rewards/${userData.name}`);

  setRewards(res.data);

};
const fetchDashboardStats = async (organizerId) => {
  try {

    const eventsRes = await api.get(`/events/organizer/${organizerId}`);
    const events = eventsRes.data;

    console.log("Events:", events);

    let totalRequests = 0;
    let totalVolunteers = 0;
    let ratings = [];
    let totalReviews = 0;

    for (const event of events) {

      try {

        const reqRes = await api.get(`/events/${event.id}/requests`);
        const requests = reqRes.data;

        console.log("Requests for event", event.id, requests);

        totalRequests += requests.length;
        totalVolunteers += requests.filter(
          r => r.status?.toUpperCase() === "APPROVED"
        ).length;

      } catch (err) {
        console.log("Request API failed for event", event.id);
      }

      try {

        const fbRes = await api.get(`/feedback/event/${event.id}`);
        const feedback = fbRes.data;

        console.log("Feedback for event", event.id, feedback);

        totalReviews += feedback.length;

        feedback.forEach(f => {
          if (f.rating) ratings.push(Number(f.rating));
        });

      } catch (err) {
        console.log("Feedback API failed for event", event.id);
      }

    }

    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 0;

    console.log("Final Stats", {
      events: events.length,
      totalVolunteers,
      totalRequests,
      avgRating,
      totalReviews
    });

    setDashboardStats({
      totalEvents: events.length,
      totalVolunteers,
      totalRequests,
      avgRating,
      totalReviews
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
  }
};

useEffect(() => {
  if (profile?.id) {
    fetchDashboardStats(profile.id);
  }
}, [profile?.id]);

const [dashboardStats, setDashboardStats] = useState({
  totalEvents: 0,
  totalVolunteers: 0,
  totalRequests: 0,
  avgRating: 0,
  totalReviews: 0
});


useEffect(()=>{
  if(tab==="rewards"){
    fetchRewards();
  }
},[tab]);
  useEffect(() => {
    if (tab === "notifications") markAllAsRead();
  }, [tab]);
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    startDateTime: "",
    endDateTime: "",
    volunteersRequired: ""
  });
  useEffect(() => {
    if (userData?.email) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [userData]);

  useEffect(() => {
  document.title = "Organizer-Volunteer Management System"
}, []);

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

  const handleStatusChange = (volunteerId, value) => {
    setStatusInputs({
      ...statusInputs,
      [volunteerId]: value
    });
  };

  const averageRating =
    volunteerFeedbacks.length > 0
      ? (
        volunteerFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) /
        volunteerFeedbacks.length
      ).toFixed(1)
      : 0;

  useEffect(() => {
    if (selectedEvent) {
      fetchApprovedVolunteers(selectedEvent.id);
      fetchAssignments(selectedEvent.id);
    }
  }, [selectedEvent]);

  const isAssigned = (volunteerId) =>
    assignedVolunteers.some(
      a => a.volunteerId === volunteerId
    );

  // --- Fetch organizer profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const email = userData?.email || localStorage.getItem("organizerEmail");
        if (!email) {
          setError("Email not found. Please login again.");
          setLoading(false);
          return;
        }

        const response = await api.get(`/organizer/email/${encodeURIComponent(email)}`);
        if (!response.data) {
          setError("Organizer not found in database");
        } else {
          setProfile(response.data);
        }
      } catch (err) {
        console.error("Error fetching organizer profile:", err);
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userData]);

  // --- Fetch events for My Events tab ---
  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!profile?.id) return; // must use numeric organizer ID
      try {
        const res = await api.get(`/events/organizer/${profile.id}`);
        setMyEvents(res.data);
      } catch (err) {
        console.error("Error fetching events", err.response?.data || err.message);
      }
    };

    if (tab === "myEvents") fetchMyEvents();
  }, [tab, profile]);

  // --- Handlers ---
  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/${userData.email}`);
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/${userData.email}/mark-read`);
      fetchNotifications(); // refresh
    } catch (err) {
      console.error("Error marking notifications read", err);
    }
  };

  const fetchApprovedVolunteers = async (eventId) => {
    try {

      const res = await axios.get(
        `http://localhost:8080/api/volunteer/approved/${eventId}`
      );

      setApprovedVolunteers(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  const handleWorkChange = (volunteerId, value) => {
    setWorkInputs(prev => ({
      ...prev,
      [volunteerId]: value
    }));
  };

  const handleHoursChange = (volunteerId, value) => {
    setHoursInputs(prev => ({
      ...prev,
      [volunteerId]: parseFloat(value)
    }));
  };

  const shareBadge = async (reward) => {

  setShareReward(reward);

  setTimeout(async () => {

    const card = document.getElementById("badge-share-card");

    if (!card) {
      alert("Badge not ready yet");
      return;
    }

    const canvas = await html2canvas(card, {
      scale: 2
    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `${reward.badgeType}_organizer_badge_${reward.year}.png`;
    link.click();

  }, 300);

};
  const assignWork = async (volunteerId) => {

    const work = workInputs[volunteerId];

    if (!work) {
      alert("Enter work");
      return;
    }

    await axios.post(
      "http://localhost:8080/api/assignment/assign",
      {
        eventId: selectedEvent.id,
        volunteerId,
        assignedWork: work,
        status: "ASSIGNED"
      }
    );

    alert("Assigned Successfully");


    fetchAssignments(selectedEvent.id);
  };

  const fetchAssignments = async (eventId) => {
    const res = await axios.get(
      `http://localhost:8080/api/assignment/event/${eventId}`
    );

    setAssignedVolunteers(res.data);
  };

  const fetchVolunteerFeedbacks = async (eventId) => {
    try {
      const res = await api.get(`/feedback/event/${eventId}`);
      setVolunteerFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching volunteer feedbacks", err);
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      fetchVolunteerFeedbacks(selectedEvent.id);
    }
  }, [selectedEvent]);

  const handleSave = async () => {
    try {
      await api.put(`/organizer/update/${profile.id}`, profile);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/organizer/uploadProfilePic/${profile.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Update failed!");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Error deleting notification", err);
    }
  };

  const thStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left"
  };

  const tdStyle = {
    border: "1px solid #ddd",
    padding: "8px"
  };

  const approveBtn = {
    background: "#2ecc71",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    cursor: "pointer",
    borderRadius: "4px"
  };

  const rejectBtn = {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
    borderRadius: "4px"
  };

  const approvedBtn = {
    background: "#27ae60",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px"
  };

  const rejectedBtn = {
    background: "#c0392b",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px"
  };

  const disabledBtn = {
    background: "#bdc3c7",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    borderRadius: "4px",
    cursor: "not-allowed"
  };

  const handleEventChange = (e) => {
    setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  };
  const handleCreateEvent = async () => {
    try {
      if (!profile?.id) {
        alert("Organizer ID not found!");
        return;
      }
      const payload = {
        eventName: eventForm.name,
        description: eventForm.description,
        category: eventForm.category,
        location: eventForm.location,
        startDateTime: eventForm.startDateTime,
        endDateTime: eventForm.endDateTime,
        volunteersRequired: eventForm.volunteersRequired,
        organizerId: profile.id

      };

      const res = await api.post("/events", payload);
      console.log("Event Created:", res.data);
      alert("Event Created Successfully!");

      if (tab === "myEvents") {
        const updatedEvents = await api.get(`/events/organizer/${profile.id}`);
        setMyEvents(updatedEvents.data);
      }
    } catch (err) {
      console.error("Error creating event:", err.response?.data || err.message);
      alert("Failed to create event!");
    }
  };

  const fetchRequests = async (eventId) => {
    try {
      const res = await api.get(`/events/${eventId}/requests`);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests", err);
    }
  };

  const handleRequestAction = async (requestId, action, eventId) => {
    if (!eventId) return;

    try {
      if (action === "APPROVED") {
        await api.put(`/events/requests/${requestId}/approve`);
      } else {
        await api.put(`/events/requests/${requestId}/reject`);
      }

      // Refresh requests
      await fetchRequests(eventId);

      // Refresh events list
      const res = await api.get(`/events/organizer/${profile.id}`);
      setMyEvents(res.data);

      const updatedEvent = res.data.find(e => e.id === eventId);
      setSelectedEvent(updatedEvent);

      // AUTO CLOSE REGISTRATION IF FULL
      if (updatedEvent.volunteersRequired === 0 && updatedEvent.registrationOpen) {
        await api.put(`/events/${eventId}/close-registration`);

        // refresh again after closing
        const refreshed = await api.get(`/events/organizer/${profile.id}`);
        setMyEvents(refreshed.data);

        const closedEvent = refreshed.data.find(e => e.id === eventId);
        setSelectedEvent(closedEvent);
      }

    } catch (err) {
      console.error("Failed to update request", err);
    }
  };

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

  //  Update Event
  const handleUpdateEvent = async () => {
    try {
      await api.put(`/events/${selectedEvent.id}`, selectedEvent);
      alert("Event updated successfully!");

      // refresh list
      const res = await api.get(`/events/organizer/${profile.id}`);
      setMyEvents(res.data);
    } catch (err) {
      console.error("Error updating event", err);
    }
  };

  const refreshEvents = async () => {
    const res = await api.get(`/events/organizer/${profile.id}`);
    setMyEvents(res.data);
  };

  const closeRegistration = async (eventId) => {
    await api.put(`/events/${eventId}/close-registration`);
    const res = await api.get(`/events/organizer/${profile.id}`);
    setMyEvents(res.data);

    const updated = res.data.find(e => e.id === eventId);
    setSelectedEvent(updated);
  };

  const openRegistration = async (eventId) => {
    await api.put(`/events/${eventId}/open-registration`);
    const res = await api.get(`/events/organizer/${profile.id}`);
    setMyEvents(res.data);

    const updated = res.data.find(e => e.id === eventId);
    setSelectedEvent(updated);
  };
  //  Delete Event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${eventId}`);
      alert("Event deleted successfully!");

      // refresh list
      const res = await api.get(`/events/organizer/${profile.id}`);
      setMyEvents(res.data);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error deleting event", err);
    }
  };

  const openEventDetails = async (event) => {

    setSelectedEvent(event);
    setEditableEvent(event);
    setIsEditingEvent(false);

    const res = await api.get(`/events/${event.id}/requests`);
    setRequests(res.data);

    await fetchApprovedVolunteers(event.id);
    await fetchAssignments(event.id);
    await fetchVolunteerFeedbacks(event.id);
  };

  const handleLogout = () => {
    localStorage.clear();
    setPage("login");
  };

  // --- Utility ---
  const getAvatarColor = (name) => {
    const colors = ["#1abc9c", "#3498db", "#9b59b6", "#e67e22", "#e74c3c", "#2ecc71", "#f39c12", "#16a085"];
    if (!name) return "#95a5a6";
    return colors[name.charCodeAt(0) % colors.length];
  };

  // --- Styles ---
  const cardStyle = { background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", textAlign: "center" };
  const menuStyle = (active) => ({ padding: "10px", cursor: "pointer", background: active ? "rgb(235, 156, 10)" : "transparent", borderRadius: "5px", marginBottom: "5px" });
  const sectionStyle = { background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" };

  if (loading) return <p>Loading organizer profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const totalEventHours = selectedEvent
    ? Number(
      (
        (new Date(selectedEvent.endDateTime) -
          new Date(selectedEvent.startDateTime)) /
        (1000 * 60 * 60)
      ).toFixed(1)
    )
    : 0;

  const getEventStatus = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime) return "UPCOMING";
    if (now >= startTime && now <= endTime) return "ONGOING";
    if (now > endTime) return "COMPLETED";

    return "";
  };

  const eventStatus = selectedEvent
    ? getEventStatus(selectedEvent.startDateTime, selectedEvent.endDateTime)
    : "";

  return (

    <div className="dashboard-shell" style={{ height: "100vh", overflow: "hidden", fontFamily: "Arial" }}>

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
          Organizer Dashboard
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
            overflow: "hidden",
            zIndex: 999
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ padding: "10px 0", cursor: "pointer", marginBottom: "3%" }} className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
              <FaUser style={{ marginRight: "10px" }} />
              Profile
            </li>
            <li
style={{ padding: "10px 0", cursor: "pointer", marginBottom: "3%" }}
className={tab === "validation" ? "active" : ""}
onClick={()=>setTab("validation")}
>
<FaShieldAlt /> Validation
</li>
            <li style={{ padding: "10px 0", cursor: "pointer", marginBottom: "3%" }} className={tab === "createEvent" ? "active" : ""} onClick={() => setTab("createEvent")}>
              <FaCalendarAlt /> Create Event
            </li>

            <li style={{ padding: "10px 0", cursor: "pointer", marginBottom: "3%" }} className={tab === "myEvents" ? "active" : ""} onClick={() => setTab("myEvents")} >
              <FaUsers /> My Events
            </li>

            <li style={{ padding: "10px 0", cursor: "pointer", marginBottom: "3%" }} className={tab === "notifications" ? "active" : ""} onClick={() => { setTab("notifications"); markAllAsRead() }}>
              <FaBell /> Notifications
            </li>
            <li style={{ padding: "10px 0", cursor: "pointer", marginBottom: "3%" }} className={tab === "rewards" ? "active" : ""} onClick={()=>setTab("rewards")}>
<FaTrophy /> Rewards
</li>
            <li style={{ padding: "10px 0", cursor: "pointer" }} onClick={handleLogout}>
              <FaSignOutAlt style={{ marginRight: "10px" }} />
              Logout
            </li>
          </ul>
        </div>
      )}


      <div className="dashboard-content"
        style={{
          position: "absolute",
          top: "60px",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px",
          overflowY: "auto",
          marginLeft: sidebarOpen ? "220px" : "0",
          transition: "margin-left 0.3s ease"
        }}
      >

        <h2 style={{ marginBottom: "20px" }}>Welcome, {profile?.name}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}
        >
          <div className="organizer-stat-card stat-events" style={cardStyle}>
            <div style={{textAilgn:"center",alignItems : "center",marginTop:"10px"}}>
            <h4>📅 Events</h4>
            <h1>{dashboardStats.totalEvents}</h1></div>
          </div>

          <div className="organizer-stat-card stat-volunteers" style={cardStyle}>
             <div style={{textAilgn:"center",alignItems : "center",marginTop:"10px"}}>
            <h4>👥 Volunteers</h4>
            <h1>{dashboardStats.totalVolunteers}</h1></div>
          </div>

          <div className="organizer-stat-card stat-requests" style={cardStyle}>
             <div style={{textAilgn:"center",alignItems : "center",marginTop:"10px"}}>
            <h4>📝 Requests</h4>
            <h1>{dashboardStats.totalRequests}</h1></div>
          </div>
          <div className="organizer-stat-card stat-rating" style={cardStyle}>
             <div style={{textAilgn:"center",alignItems : "center",marginTop:"10px"}}>
          <h4>⭐ Rating</h4>
<h1>
  {dashboardStats.avgRating} / 5 
</h1>
<small>{dashboardStats.totalReviews} reviews</small>
</div></div>
        </div>
        {tab === "profile" && (
          <div className="organizer-form-card profile-card-Organization">
            <div className="organizer-identity-header">
              <div className="organizer-avatar-large">
                {profile.organizationName?.charAt(0).toUpperCase() || profile.name?.charAt(0).toUpperCase() || "O"}
              </div>
              <div className="organizer-identity-copy">
                <span className="eyebrow">Organizer account</span>
                <h2>{profile.organizationName || "Your Organization"}</h2>
                <p>{profile.name} · {profile.email}</p>
                <div className="organizer-identity-badges">
                  <span>{profile.organizationType || "Community organization"}</span>
                  {validationStatus === "APPROVED" && <span className="organizer-verified"><MdVerified /> Verified organization</span>}
                </div>
              </div>
              <div className="organizer-identity-stat"><strong>{profile.volunteersManaged || 0}</strong><span>volunteers managed</span></div>
            </div>
            <div className="form-heading-row">
              <div>
                <span className="eyebrow">Organization profile</span>
                <h3>Profile Details</h3>
                <p className="form-helper">Keep your organization and contact information ready for volunteers.</p>
              </div>
              <span className="profile-status">{validationStatus || "ACTIVE"}</span>
            </div>
            <div className="organizer-profile-section-label">Organization & contact details</div>
            <div className="profile-form-Organization">
              <div className="form-row-Organization">
                <label>Email:</label>
                <span>{profile.email}</span>
              </div>

              <div className="form-row-Organization">
                <label>Phone:</label>
                {editMode ? (
                  <input
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.phone}</span>
                )}
              </div>

              <div className="form-row-Organization">
                <label>Full Address:</label>
                {editMode ? (
                  <input
                    name="fullAddress"
                    value={profile.fullAddress || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.fullAddress}</span>
                )}
              </div>

              <div className="form-row-Organization">
                <label>Organization Type:</label>
                <span>{profile.organizationType}</span>
              </div>

              <div className="form-row-Organization">
                <label>Registration Number:</label>
                {editMode ? (
                  <input
                    name="registrationNumber"
                    value={profile.registrationNumber || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.registrationNumber || "N/A"}</span>
                )}
              </div>

              <div className="form-row-Organization">
                <label>Position:</label>
                <span>{profile.position}</span>
              </div>

              <div className="form-row-Organization">
                <label>Experience:</label>
                {editMode ? (
                  <input
                    name="experience"
                    value={profile.experience || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.experience}</span>
                )}
              </div>

              <div className="form-row-Organization">
                <label>Facebook:</label>
                {editMode ? (
                  <input
                    name="facebook"
                    value={profile.facebook || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.facebook}</span>
                )}
              </div>

              <div className="form-row-Organization">
                <label>Instagram:</label>
                {editMode ? (
                  <input
                    name="instagram"
                    value={profile.instagram || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.instagram}</span>
                )}
              </div>

              <div className="form-row-Organization">
                <label>LinkedIn:</label>
                {editMode ? (
                  <input
                    name="linkedin"
                    value={profile.linkedin || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.linkedin}</span>
                )}
              </div>

              <div className="form-row-Organization">
                <label>Volunteers Managed:</label>
                {editMode ? (
                  <input
                    name="volunteersManaged"
                    value={profile.volunteersManaged || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.volunteersManaged}</span>
                )}
              </div>

              <div className="form-row-Organization">
                <label>Website:</label>
                {editMode ? (
                  <input
                    name="website"
                    value={profile.website || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.website}</span>
                )}
              </div>
            </div>
            <div className="actions-Organization">
              {!editMode ? (
                <button onClick={() => setEditMode(true)} style={{ backgroundColor: "rgb(235, 156, 10)" }}>Edit Profile</button>
              ) : (
                <button onClick={handleSave} style={{ backgroundColor: "rgb(235, 156, 10)" }}>Save Changes</button>
              )}
            </div>
          </div>
        )}
        {tab === "createEvent" && (
          <div className="organizer-form-card profile-card-Organization">
            <div className="form-heading-row">
              <div>
                <span className="eyebrow">Bring people together</span>
                <h3>Create an Event</h3>
                <p className="form-helper">Add the details volunteers need to decide whether this opportunity is right for them.</p>
              </div>
            </div>
            <div className="profile-form-Organization">

              {/* Event Name */}
              <div className="form-row-Organization">
                <label>Event Name:</label>
                <input
                  name="name"
                  value={eventForm.name}
                  onChange={handleEventChange}
                  placeholder="Enter event name"
                />
              </div>

              {/* Description */}
              <div className="form-row-Organization">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventChange}
                  placeholder="Describe the event"
                />
              </div>

              {/* Category */}
              <div className="form-row-Organization">
                <label>Category:</label>
                <select
                  name="category"
                  value={eventForm.category}
                  onChange={handleEventChange}
                >
                  <option value="">Select Category</option>
                  <option>Disaster Relief</option>
                  <option>Health</option>
                  <option>Environment</option>
                  <option>Education</option>
                  <option>Social Service</option>
                  <option>Animal Welfare</option>
                  <option>Celebrations</option>
                </select>
              </div>

              {/* Location */}
              <div className="form-row-Organization">
                <label>Location:</label>
                <input
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventChange}
                  placeholder="Enter location"
                />
              </div>

              {/* Volunteers Required */}
              <div className="form-row-Organization">
                <label>No. of Volunteers:</label>
                <input
                  type="number"
                  name="volunteersRequired"
                  value={eventForm.volunteersRequired}
                  onChange={handleEventChange}
                  placeholder="Enter number"
                />
              </div>

              {/* Start Date */}
              <div className="form-row-Organization">
                <label>Start Date & Time:</label>
                <input
                  type="datetime-local"
                  name="startDateTime"
                  value={eventForm.startDateTime}
                  onChange={handleEventChange}
                />
              </div>

              {/* End Date */}
              <div className="form-row-Organization">
                <label>End Date & Time:</label>
                <input
                  type="datetime-local"
                  name="endDateTime"
                  value={eventForm.endDateTime}
                  onChange={handleEventChange}
                />
              </div>

            </div>

            {/* Action Button */}
            <div className="actions-Organization">
              <button
                onClick={handleCreateEvent}
                style={{ backgroundColor: "rgb(235, 156, 10)" }}
              >
                Create Event
              </button>
            </div>
          </div>
        )}
        {tab === "myEvents" && (
          <div>
            <h2 style={{ marginBottom: "15px" }}>My Events</h2>
            <div
              style={{
                display: "grid",
                gap: "15px",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
              }}
            >
              {myEvents.map(event => {
                const status = getEventStatus(
                  event.startDateTime,
                  event.endDateTime
                );

                return (
                  <div
                    key={event.id}
                    className={`organizer-event-card ${selectedEvent?.id === event.id ? "is-selected" : ""}`}
                    onClick={() => openEventDetails(event)}
                    style={{
                      position: "relative",
                      border:
                        selectedEvent?.id === event.id
                          ? "2px solid #000"
                          : "1px solid #ddd",
                      padding: "15px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background:
                        selectedEvent?.id === event.id
                          ? "#f7e6c4"
                          : "#ffffff",
                      transition: "all 0.2s ease",
                      boxShadow:
                        selectedEvent?.id === event.id
                          ? "0 4px 12px rgba(0,0,0,0.1)"
                          : "none",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.transform = "translateY(-3px)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    
                  {status && (
                      <span
                        style={{
                          position:"absolute",
                          top: "10px",
                          right: "10px",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color:
                            status === "UPCOMING"
                              ? "white"
                              : status === "ONGOING"
                                ? "black"
                                : "white",
                          background:
                            status === "UPCOMING"
                              ? "linear-gradient(135deg,#2ecc71,#27ae60)"
                              : status === "ONGOING"
                                ? "rgb(255, 177, 9)"
                                : "linear-gradient(135deg,#7f8c8d,#95a5a6)",
                          boxShadow: "0 3px 6px rgba(0,0,0,0.2)"
                        }}
                      >
                        {status}
                      </span>
                    )}
                    <br></br>
                    <h4 style={{ marginBottom: "8px" }}>
                      {event.eventName}
                    </h4>
                   
                    <p>{event.location}</p>
                    <p>
                      Volunteers Needed: {event.volunteersRequired}
                    </p>
                  </div>
                  
                );
              })}
            </div>

            {/* Selected Event Details */}
            {selectedEvent && (
              <div className="selected-event-panel"
                style={{
                  marginTop: "20px",
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                }}
              >

                <div className="selected-event-heading"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px"
                  }}
                >
                  <div className="selected-event-title-wrap"><span className="eyebrow">Event workspace</span><h3 style={{ margin: 0 }}>
                    {isEditingEvent ? (
                      <input
                        value={editableEvent.eventName}
                        onChange={(e) =>
                          setEditableEvent({
                            ...editableEvent,
                            eventName: e.target.value
                          })
                        }
                      />
                    ) : (
                      selectedEvent.eventName
                    )}
                  </h3></div>

                  {/* ICON BUTTONS */}
                  <div style={{ display: "flex", gap: "12px" }}>
                    {!isEditingEvent && (
                      <>
                        {/* Edit Icon */}
                        <FaEdit
                          title={
                            eventStatus !== "UPCOMING"
                              ? "Cannot edit ongoing/completed event"
                              : "Edit Event"
                          }
                          style={{
                            cursor: eventStatus !== "UPCOMING" ? "not-allowed" : "pointer",
                            color: eventStatus !== "UPCOMING" ? "#aaa" : "#000000",
                            opacity: eventStatus !== "UPCOMING" ? 0.5 : 1
                          }}
                          onClick={() => {
                            if (eventStatus === "UPCOMING") {
                              setIsEditingEvent(true);
                            }
                          }}
                        />

                        {/* Delete Icon */}
                        <FaTrash
                          title={
                            eventStatus !== "UPCOMING"
                              ? "Cannot delete ongoing/completed event"
                              : "Delete Event"
                          }
                          style={{
                            cursor: eventStatus !== "UPCOMING" ? "not-allowed" : "pointer",
                            color: eventStatus !== "UPCOMING" ? "#aaa" : "#000000",
                            opacity: eventStatus !== "UPCOMING" ? 0.5 : 1
                          }}
                          onClick={() => {
                            if (eventStatus === "UPCOMING") {
                              handleDeleteEvent(selectedEvent.id);
                            }
                          }}
                        />
                      </>
                    )}
                  </div>

                </div>

                <div className="selected-event-meta-grid">
                  <div><span>Location</span><strong>{selectedEvent.location || "Not specified"}</strong></div>
                  <div><span>Starts</span><strong>{new Date(selectedEvent.startDateTime).toLocaleString()}</strong></div>
                  <div><span>Ends</span><strong>{new Date(selectedEvent.endDateTime).toLocaleString()}</strong></div>
                  <div><span>Volunteer capacity</span><strong>{selectedEvent.volunteersRequired} places</strong></div>
                </div>

                {/* Location */}
                <p className="selected-event-description-row">
                  <b>Location:</b>{" "}
                  {isEditingEvent ? (
                    <input
                      value={editableEvent.location}
                      onChange={(e) =>
                        setEditableEvent({ ...editableEvent, location: e.target.value })
                      }
                    />
                  ) : (
                    selectedEvent.location
                  )}
                </p>

                <p className="selected-event-legacy-row"><b>Start:</b> {selectedEvent.startDateTime}</p>
                <p className="selected-event-legacy-row"><b>End:</b> {selectedEvent.endDateTime}</p>

                {/* Description */}
                <p className="selected-event-description-row">
                  <b>Description:</b>{" "}
                  {isEditingEvent ? (
                    <textarea
                      value={editableEvent.description}
                      onChange={(e) =>
                        setEditableEvent({ ...editableEvent, description: e.target.value })
                      }
                    />
                  ) : (
                    selectedEvent.description
                  )}
                </p>

                {/* Volunteers */}
                <p className="selected-event-legacy-row">
                  <b>Volunteers Needed:</b>{" "}
                  {isEditingEvent ? (
                    <input
                      type="number"
                      value={editableEvent.volunteersRequired}
                      onChange={(e) =>
                        setEditableEvent({
                          ...editableEvent,
                          volunteersRequired: e.target.value,
                        })
                      }
                    />
                  ) : (
                    selectedEvent.volunteersRequired
                  )}
                </p>

                {/* Volunteer Requests */}
                <div className="event-section-heading"><span className="event-section-number">01</span><div><h4>Volunteer Requests</h4><p>Review applications for this event.</p></div><strong>{requests.length}</strong></div>

                {requests.length === 0 ? (
                  <p>No requests yet</p>
                ) : (
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "10px"
                  }}>
                    <thead>
                      <tr style={{ background: "#f5f5f5" }}>
                        <th style={thStyle}>Volunteer Name</th>
                        <th style={thStyle}>Address</th>
                        <th style={thStyle}>Phone</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(req => (
                        <tr key={req.id}>
                          <td style={tdStyle}>{req.name}</td>
                          <td style={tdStyle}>{req.fullAddress}</td>
                          <td style={tdStyle}>{req.phone}</td>
                          <td style={tdStyle}>{req.status}</td>
                          <td style={tdStyle}>
                            {/* APPROVED */}
                            {req.status === "APPROVED" && (
                              <button style={approvedBtn}>Approved</button>
                            )}

                            {/* REJECTED */}
                            {req.status === "REJECTED" && (
                              <>
                                <button style={rejectedBtn}>Rejected</button>
                              </>
                            )}

                            {/* PENDING */}
                            {req.status === "PENDING" && (
                              <>
                                {selectedEvent?.volunteersRequired === 0 ? (
                                  <button style={disabledBtn}>Full</button>) :
                                  (<button style={approveBtn}
                                    onClick={() => handleRequestAction(req.id, "APPROVED", selectedEvent.id)} >
                                    Approve

                                  </button>)}

                                <button
                                  style={rejectBtn}
                                  onClick={() =>
                                    handleRequestAction(req.id, "REJECTED", selectedEvent.id)
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}


                {/* Buttons */}
                <div style={{ marginTop: "15px" }}>
                  {!isEditingEvent ? (
                    <>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/events/${editableEvent.id}`, editableEvent);
                            alert("Event updated!");

                            setSelectedEvent(editableEvent);
                            setIsEditingEvent(false);

                            const res = await api.get(`/events/organizer/${profile.id}`);
                            setMyEvents(res.data);
                          } catch (err) {
                            console.error("Update failed", err);
                          }
                        }}
                        style={{
                          marginRight: "10px",
                          background: "#2ecc71",
                          color: "white",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer"
                        }}
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setIsEditingEvent(false);
                          setEditableEvent(selectedEvent);
                        }}
                        style={{
                          background: "#95a5a6",
                          color: "white",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                </div>
                <div className="event-section-heading"><span className="event-section-number">02</span><div><h4>Assign Work To Volunteers</h4><p>Give approved volunteers a clear responsibility.</p></div><strong>{approvedVolunteers.length}</strong></div>

                <table className="table">
                  <thead>
                    <tr>
                      <th>Volunteer Name</th>
                      <th>Email Id</th>
                      <th>Assigned Work</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {approvedVolunteers.map((v) => {
                      const assigned = assignedVolunteers.find(a => a.volunteerId === v.volunteerId);

                      return (
                        <tr key={v.volunteerId}>
                          <td>{v.volunteerName}</td>
                          <td>{v.email}</td>

                          <td>
                            <input
                              type="text"
                              value={assigned?.assignedWork || workInputs[v.volunteerId] || ""}
                              onChange={(e) => handleWorkChange(v.volunteerId, e.target.value)}
                              disabled={assigned?.status === "ASSIGNED"}
                              style={{
                                width: "100%",
                                backgroundColor: assigned?.status === "ASSIGNED" ? "#f0f0f0" : "white",
                                color: "#000"
                              }}
                            />
                          </td>

                          <td>
                            {assigned?.status === "ASSIGNED" ? (
                              <button disabled style={{ backgroundColor: "rgb(243, 216, 168)", color: "black" }}>
                                Assigned
                              </button>
                            ) : (
                              <button onClick={() => assignWork(v.volunteerId)}>Assign</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Attendance Section */}

                {eventStatus !== "UPCOMING" && (
                  <div>

                    <div className="event-section-heading"><span className="event-section-number">03</span><div><h4>Mark Attendance</h4><p>Record hours and participation status.</p></div></div>

                    {eventStatus === "COMPLETED" && (
                      <p style={{ color: "green", fontWeight: "bold" }}>
                        Attendance is finalized. Editing is disabled.
                      </p>
                    )}

                    <table className="table">
                      <thead>
                        <tr>
                          <th>Volunteer Name</th>
                          <th>Email</th>
                          <th>Hours Attended</th>
                          <th>Attendance %</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {approvedVolunteers.map((v) => {
                          const attendance = attendanceData.find(
  a => a.volunteerId === v.volunteerId
);

const hours =
  hoursInputs[v.volunteerId] ??
  attendance?.hoursAttended ??
  0;

const status =
  statusInputs[v.volunteerId] ??
  attendance?.status ??
  "";
                          const percentage = totalEventHours
                            ? ((hours / totalEventHours) * 100).toFixed(1)
                            : 0;

                          const isSaved = savedRows[v.volunteerId];


                          return (
                            <tr key={v.volunteerId}>

                              <td>{v.volunteerName}</td>
                              <td>{v.email}</td>

                              {/* Hours */}
                              <td>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={totalEventHours}
                                  value={hoursInputs[v.volunteerId] ?? attendance?.hoursAttended ?? ""}
                                  onChange={(e) =>
                                    handleHoursChange(v.volunteerId, e.target.value)
                                  }
                                  style={{ width: "70px" }}
                                  disabled={eventStatus === "COMPLETED" || savedRows[v.volunteerId]}
                                />
                                / {totalEventHours.toFixed(1)} hrs
                              </td>
                              <td>
                                {percentage} %
                              </td>

                              {/* Status */}
                              <td>
                                <select
                                  value={statusInputs[v.volunteerId] ?? attendance?.status ?? ""}
                                  onChange={(e) =>
                                    handleStatusChange(v.volunteerId, e.target.value)
                                  }
                                  disabled={eventStatus === "COMPLETED" || savedRows[v.volunteerId]}
                                >
                                  <option value="">Select</option>
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                </select>
                              </td>

                              {/* Action */}
                              <td>
                                {savedRows[v.volunteerId] ? (

                                  <button
                                    disabled={eventStatus === "COMPLETED"}
                                    onClick={() =>
                                      setSavedRows(prev => ({
                                        ...prev,
                                        [v.volunteerId]: false
                                      }))
                                    }
                                  >
                                    Edit
                                  </button>

                                ) : (

                                  <button
                                    disabled={eventStatus === "COMPLETED"}
                                    onClick={async () => {
                                      try {

                                        const hours = hoursInputs[v.volunteerId];
                                        const status = statusInputs[v.volunteerId];

                                        if (!hours || !status) {
                                          alert("Please enter hours and status");
                                          return;
                                        }
                                        const percentage = totalEventHours
                                          ? ((hours / totalEventHours) * 100).toFixed(1)
                                          : 0;

                                        await axios.post(
                                          "http://localhost:8080/api/attendance/mark",
                                          {
                                            eventId: selectedEvent.id,
                                            volunteerId: v.volunteerId,
                                            hoursAttended: parseFloat(hours),
                                            attendancePercentage: parseFloat(percentage),
                                            status: status
                                          }
                                        );
                                        alert("Attendance saved successfully");

                                        setSavedRows(prev => ({
                                          ...prev,
                                          [v.volunteerId]: true
                                        }));

                                      } catch (err) {
                                        console.error("Attendance error:", err);
                                        alert("Error saving attendance");
                                      }
                                    }}
                                  >
                                    Save
                                  </button>

                                )}
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                  </div>
                )}
                {/* Volunteer Feedback Section */}
                {volunteerFeedbacks.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <div className="event-section-heading"><span className="event-section-number">04</span><div><h4>Volunteer Feedback</h4><p>See what participants thought about the event.</p></div><strong>{volunteerFeedbacks.length}</strong></div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f5f5f5" }}>
                          <th style={thStyle}>Volunteer Name</th>
                          <th style={thStyle}>Email</th>
                          <th style={thStyle}>Rating</th>
                          <th style={thStyle}>Comments</th>
                          <th style={thStyle}>Submitted At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volunteerFeedbacks.map((fb) => (
                          <tr key={fb.id}>
                            <td style={tdStyle}>{fb.volunteerName}</td>
                            <td style={tdStyle}>{fb.email}</td>
                            <td style={tdStyle}>{fb.rating}</td>
                            <td style={tdStyle}>{fb.message}</td>
                            <td style={tdStyle}>
                              {new Date(fb.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {volunteerFeedbacks.length === 0 && eventStatus === "COMPLETED" && (
                  <p style={{ marginTop: "10px", color: "#555" }}>
                    No feedback submitted by volunteers yet.
                  </p>
                )}

                {/* Message when event is UPCOMING */}

                {eventStatus === "UPCOMING" && (
                  <p style={{ color: "gray", marginTop: "20px" }}>
                    Attendance can be marked only after the event starts.
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "12px"
                  }}
                >
                  {/* CLOSE REGISTRATION */}
                  <button
                    disabled={!selectedEvent?.registrationOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeRegistration(selectedEvent.id);
                    }}
                    style={{
                      background: selectedEvent?.registrationOpen
                        ? "linear-gradient(135deg,#ff6b6b,#e74c3c)"
                        : "#ccc",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      cursor: selectedEvent?.registrationOpen ? "pointer" : "not-allowed",
                      fontWeight: "bold",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
                      transition: "0.2s"
                    }}
                  >
                    Close Registration
                  </button>

                  {/* OPEN REGISTRATION */}
                  <button
                    disabled={selectedEvent?.registrationOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      openRegistration(selectedEvent.id);
                    }}
                    style={{
                      background: !selectedEvent?.registrationOpen
                        ? "linear-gradient(135deg,#2ecc71,#27ae60)"
                        : "#ccc",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      cursor: !selectedEvent?.registrationOpen ? "pointer" : "not-allowed",
                      fontWeight: "bold",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
                      transition: "0.2s"
                    }}
                  >
                    Open Registration
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "rewards" && (
          <div className="rewards-page">
            <div className="rewards-page-heading">
              <div>
                <span className="eyebrow">Recognition & impact</span>
                <h2><FaTrophy aria-hidden="true" /> My Rewards</h2>
                <p>Celebrate the milestones you have earned while building stronger communities.</p>
              </div>
              <span className="rewards-count">{rewards.length} {rewards.length === 1 ? "badge" : "badges"}</span>
            </div>

    {rewards.length === 0 ? (
              <div className="rewards-empty-state">
                <FaTrophy aria-hidden="true" />
                <strong>Your reward shelf is waiting</strong>
                <span>Keep creating meaningful events and your recognition badges will appear here.</span>
              </div>
    ) : (
              <div className="organizer-rewards-grid">
        {rewards.map((r, index) => {

          const color =
            r.badgeType === "GOLD"
              ? "#FFD700"
              : r.badgeType === "SILVER"
              ? "#C0C0C0"
              : "#CD7F32";

          return (
            <div className={`organizer-reward-card reward-${r.badgeType?.toLowerCase() || "bronze"}`}
              key={index}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}
            >
              <FaMedal size={60} color={color} />

              <span className="reward-tier-label">{r.badgeType} TIER</span>
              <h3>{r.badgeType} ORGANIZER BADGE</h3>

              <p>Rank {r.rankPosition}</p>
              <p>Year: {r.year}</p>
              <p className="reward-recipient">{r.organizerName}</p>

              <button
                className="reward-download-action"
                onClick={() => shareBadge(r)}
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Download Badge
              </button>
            </div>
          );
        })}
      </div>
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

        {tab === "notifications" && (
          <div className="notifications-panel" style={{ ...cardStyle, textAlign: "left" }}>
            <div className="notifications-heading">
              <div>
                <span className="eyebrow">Keep your community moving</span>
                <h3>Notifications</h3>
                <p>Requests, volunteer updates, and event activity in one place.</p>
              </div>
              <span className="notification-count">{unreadCount} unread</span>
            </div>
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <FaBell size={24} />
                <strong>You are all caught up</strong>
                <span>New updates will appear here.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notification-item ${n.read ? "is-read" : "is-unread"}`}>
                  <span className="notification-dot" aria-hidden="true" />
                  <div className="notification-copy">
                    <p>{n.message}</p>
                    <small>{formatTimeAgo(n.createdAt)}</small>
                  </div>
                  {n.read && (
                    <button
                      className="delete-btn"
                      onClick={() => deleteNotification(n.id)}
                    >
                      <FaTrash aria-hidden="true" />
                      <span className="sr-only">Delete notification</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {shareReward && (

            <div className={`organizer-reward-card reward-${r.badgeType?.toLowerCase() || "bronze"}`}
    id="badge-share-card"
    style={{
     position: "fixed",
left: "-9999px",
top: "0",
      width: "350px",
      background: "white",
      padding: "25px",
      textAlign: "center",
      boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
      
    }}
  >

    <FaMedal
      size={80}
      color={
        shareReward.badgeType === "GOLD"
          ? "#fce80f"
          : shareReward.badgeType === "SILVER"
          ? "#C0C0C0"
          : "#CD7F32"
      }
    />

    <h2>{shareReward.badgeType} Organizer Badge {shareReward.year}</h2>
    <p style={{ fontWeight: "bold", fontSize: "18px" }}>
      {shareReward.organizerName}
    </p>

    <p>Rank - 0{shareReward.rankPosition}</p>

    <p>Year {shareReward.year}</p>

    <p style={{ marginTop: "10px", color: "#555" }}>
      Awarded for outstanding community event leadership and volunteer management.
    </p>

  </div>

)}
    </div>
  );

}

export default OrganizerDashboard;
