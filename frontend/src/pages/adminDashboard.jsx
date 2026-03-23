import { useEffect, useState } from "react";
import api from "../services/api";
import { FaUser, FaCalendarAlt, FaCommentDots, FaUsers, FaHourglassHalf, FaSignOutAlt, FaGraduationCap, FaChartPie } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
function AdminDashboard({ userData, setPage }) {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [topOrganizers, setTopOrganizers] = useState([]);
  const [selectedOrganizerName, setSelectedOrganizerName] = useState("");
  const [eventVolunteerData, setEventVolunteerData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    document.title = "Admin-Volunteer Management System"
  }, []);

  useEffect(() => {
    if (tab === "Pending Certificates") {
      fetchPendingCertificates();
    }
  }, [tab]);

  const [validationData, setValidationData] = useState({
    volunteers: [],
    organizers: []
  });
  useEffect(() => {
    if (tab === "validation") {
      fetchValidations();
    }
  }, [tab]);

  const fetchValidations = async () => {
    try {
      const res = await api.get("/admin/validations/all");
      setValidationData(res.data);
    } catch (err) {
      console.error("Error fetching validations", err);
    }
  };

  const fetchAllData = async () => {
    try {

      const res = await api.get("/events/event-volunteers");
      setEventVolunteerData(res.data);   // contains volunteerCount

      const eventRes = await api.get("/events");
      setEvents(eventRes.data);          // normal events

      const volunteerRes = await api.get("/admin/volunteers/all");
      const organizerRes = await api.get("/admin/organizers/all");

      setVolunteers(volunteerRes.data);
      setOrganizers(organizerRes.data);

      setLoading(false);

    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthlyEvents = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0
  };

  events.forEach(event => {

    const dateValue =
      event.endDateTime ||
      event.end_date_time ||
      event.eventDate ||
      event.event_date;

    if (!dateValue) return;

    const date = new Date(dateValue);

    if (date.getFullYear() !== selectedYear) return;

    const month = date.toLocaleString("default", { month: "short" });

    monthlyEvents[month] += 1;

  });
  const monthlyEventData = Object.keys(monthlyEvents).map(month => ({
    month,
    events: monthlyEvents[month]
  }));
  const fetchPendingCertificates = async () => {
    try {
      const res = await api.get("/admin/certificate/pending");
      setCertificates(res.data);
    } catch (err) {
      console.error("Error fetching certificates", err);
    }
  };

  const years = [
    ...new Set(
      events
        .map((e) => {

          const dateValue =
            e.endDateTime ||
            e.end_date_time ||
            e.eventDate ||
            e.event_date;

          if (!dateValue) return null;

          const date = new Date(dateValue);

          return date.getFullYear();
        })
        .filter(Boolean)
    )
  ].sort();

  const filteredEventsForGraph = eventVolunteerData.filter(event => {

    if (!event.endDateTime) return false;

    const date = new Date(event.endDateTime);

    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "short" });

    return (
      (!selectedYear || year === Number(selectedYear)) &&
      (!selectedMonth || month === selectedMonth) &&
      (!selectedCategory || event.category === selectedCategory) &&
      (!selectedOrganizerName || event.organizerName === selectedOrganizerName)
    );
  });

  const organizerEventData = filteredEventsForGraph.map(event => ({
    eventLabel: `EVENT-${event.eventId}`,
    eventName: event.eventName,
    volunteerCount: event.volunteerCount
  }));
  const fetchFeedbacks = async () => {
    try {
      const res = await api.get("/admin/feedback");
      setFeedbacks(res.data);

      calculateTopOrganizers(res.data);

    } catch (err) {
      console.error("Error fetching feedback", err);
    }
  };

  const calculateTopOrganizers = (feedbackData) => {

    const organizerMap = {};

    feedbackData.forEach(f => {

      if (!organizerMap[f.organizerName]) {
        organizerMap[f.organizerName] = {
          totalRating: 0,
          count: 0,
          eventName: f.eventName
        };
      }

      organizerMap[f.organizerName].totalRating += f.rating;
      organizerMap[f.organizerName].count += 1;
    });

    const organizers = Object.keys(organizerMap).map(name => ({
      name,
      eventName: organizerMap[name].eventName,
      avgRating:
        organizerMap[name].totalRating /
        organizerMap[name].count,
      badgeIssued: false
    }));

    organizers.sort((a, b) => b.avgRating - a.avgRating);

    setTopOrganizers(organizers.slice(0, 3));
  };

  useEffect(() => {
    if (tab === "feedback") {
      fetchFeedbacks();
    }
  }, [tab]);
  const filteredEvents = events.filter((event) => {

    const dateValue =
      event.endDateTime ||
      event.end_date_time ||
      event.eventDate ||
      event.event_date;

    const year = dateValue ? new Date(dateValue).getFullYear() : null;



    return (
      (!selectedYear || year === Number(selectedYear)) &&
      (!selectedCategory || event.category === selectedCategory) &&
      (!selectedOrganizerName || event.organizerName === selectedOrganizerName)
    );
  });

  const organizerNames = [
    ...new Set(eventVolunteerData.map(e => e.organizerName))
  ];

  const categories = [
    "Disaster Relief",
    "Health",
    "Environment",
    "Education",
    "Social Service",
    "Animal Welfare",
    "Celebrations"
  ];

  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [events]);

  const approveCertificate = async (eventId, volunteerId) => {
    try {
      await api.post(`/admin/certificate/approve/${eventId}/${volunteerId}`);
      alert("Certificate Approved");
      fetchPendingCertificates();
    } catch (err) {
      console.error("Error approving certificate", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setPage("login");
  };

  const handleAction = async (type, id, action) => {
    try {
      const backendAction = action.toLowerCase();
      await api.post(`/admin/${type}/${backendAction}/${id}`);
      const newStatus = backendAction === "approve" ? "APPROVED" : "REJECTED";

      if (type === "volunteer") {
        setVolunteers(prev =>
          prev.map(v => (v.id === id ? { ...v, status: newStatus } : v))
        );
      } else {
        setOrganizers(prev =>
          prev.map(o => (o.id === id ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const approveVolunteerValidation = async (id) => {
    try {
      await api.post(`/admin/validation/approve/volunteer/${id}`);
      alert("Volunteer Verified");
      fetchPendingValidations();
    } catch (err) {
      console.error(err);
    }
  };

  const approveOrganizerValidation = async (id) => {
    try {
      await api.post(`/admin/validation/approve/organizer/${id}`);
      alert("Organizer Verified");
      fetchPendingValidations();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingVolunteers = volunteers.filter(v => v.status === "PENDING");
  const pendingOrganizers = organizers.filter(o => o.status === "PENDING");

  if (loading) return <p>Loading admin dashboard...</p>;

  const getStatusBadge = status => {
    const s = status?.toUpperCase();
    const base = {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      display: "inline-block",
      minWidth: "90px",
      textAlign: "center"
    };

    if (s === "APPROVED")
      return <span style={{ ...base, background: "#d4edda", color: "#155724" }}>APPROVED</span>;
    if (s === "REJECTED")
      return <span style={{ ...base, background: "#f8d7da", color: "#721c24" }}>REJECTED</span>;
    return <span style={{ ...base, background: "#fff3cd", color: "#856404" }}>PENDING</span>;
  };
  console.log("Events:", events);
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
    background: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "30px"
  };

  const thTdStyle = {
    padding: "12px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    whiteSpace: "nowrap"
  };

  const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center"
  };



  const userRoleData = [
    { name: "Volunteers", value: volunteers.length },
    { name: "Organizers", value: organizers.length }
  ];
  const approvedVolunteers = volunteers.filter(
    v => v.status?.toUpperCase() === "APPROVED"
  ).length;

  const rejectedVolunteers = volunteers.filter(
    v => v.status?.toUpperCase() === "REJECTED"
  ).length;

  const approvedOrganizers = organizers.filter(
    o => o.status?.toUpperCase() === "APPROVED"
  ).length;

  const rejectedOrganizers = organizers.filter(
    o => o.status?.toUpperCase() === "REJECTED"
  ).length;

  const pendingVolunteersCount = pendingVolunteers.length;
  const pendingOrganizersCount = pendingOrganizers.length;
  const statusData = [
    {
      name: "Approved",
      value: approvedVolunteers + approvedOrganizers
    },
    {
      name: "Pending",
      value: pendingVolunteersCount + pendingOrganizersCount
    },
    {
      name: "Rejected",
      value: rejectedVolunteers + rejectedOrganizers
    }
  ];
  const STATUS_COLORS = ["#27ae60", "#f39c12", "#e74c3c"];
  const certificateData = [
    {
      name: "Approved",
      value: certificates.filter(c => c.certificateApproved).length
    },
    {
      name: "Pending",
      value: certificates.filter(c => !c.certificateApproved).length
    }
  ];

  const issueBadge = async (organizerName, rank) => {

    const badges = ["GOLD", "SILVER", "BRONZE"];

    try {

      const res = await api.post("/admin/rewards/issue", {
        organizerName,
        badgeType: badges[rank - 1],
        rankPosition: rank
      });

      alert(res.data);

      // disable button
      setTopOrganizers(prev =>
        prev.map(o =>
          o.name === organizerName
            ? { ...o, badgeIssued: true }
            : o
        )
      );

    } catch (err) {

      if (err.response) {

        alert(err.response.data);

        // ALSO disable if badge already issued
        if (err.response.data === "Badge already issued") {
          setTopOrganizers(prev =>
            prev.map(o =>
              o.name === organizerName
                ? { ...o, badgeIssued: true }
                : o
            )
          );
        }

      } else {
        alert("Something went wrong");
      }

      console.error(err);
    }

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
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 15px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          zIndex: 1000
        }}
      >
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <h3>Admin Dashboard</h3>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "orange",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold"
          }}
        >
          A
        </div>
      </header>
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
            padding: "20px"
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li
              style={{ padding: "10px 0", cursor: "pointer", marginBottom: "10px", backgroundColor: tab === "dashboard" ? "rgb(245, 188, 82)" : " " }}
              onClick={() => setTab("dashboard")}
            >
              <FaChartPie /> Dashboard
            </li>
            <li style={{ padding: "10px 0", cursor: "pointer", marginBottom: "10px", backgroundColor: tab === "all" ? "rgb(245, 188, 82)" : " " }} onClick={() => setTab("all")}>
              <FaUsers ></FaUsers> All Users
            </li>
            <li style={{ padding: "10px 0", cursor: "pointer", marginBottom: "10px", backgroundColor: tab === "pending" ? "rgb(245, 188, 82)" : " " }} onClick={() => setTab("pending")}>
              <FaHourglassHalf></FaHourglassHalf>Pending Requests
            </li>
            <li style={{ padding: "10px 0", cursor: "pointer", marginBottom: "10px", backgroundColor: tab === "Pending Certificates" ? "rgb(245, 188, 82)" : " " }} onClick={() => setTab("Pending Certificates")}>
              <FaGraduationCap></FaGraduationCap> Certification Approval
            </li>
            <li
              style={{ padding: "10px 0", cursor: "pointer", marginBottom: "10px", backgroundColor: tab === "validation" ? "rgb(245, 188, 82)" : " " }}
              onClick={() => setTab("validation")}
            >
              <FaUser /> Approve Validation
            </li>
            <li
              style={{ padding: "10px 0", cursor: "pointer", marginBottom: "10px", backgroundColor: tab === "feedback" ? "rgb(245, 188, 82)" : " " }}
              onClick={() => setTab("feedback")}
            >
              <FaCommentDots></FaCommentDots>Feedback
            </li>
            <li style={{ padding: "10px 0", cursor: "pointer" }} onClick={handleLogout}>
              <FaSignOutAlt></FaSignOutAlt>Logout
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
          background: "linear-gradient(135deg, #4ee4d5, #5bc1bc)"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}
        >
          <div style={cardStyle}><h4>Total Volunteers</h4><p>{volunteers.length}</p></div>
          <div style={cardStyle}><h4>Total Organizers</h4><p>{organizers.length}</p></div>
          <div style={cardStyle}><h4>Pending Volunteers</h4><p>{pendingVolunteers.length}</p></div>
          <div style={cardStyle}><h4>Pending Organizers</h4><p>{pendingOrganizers.length}</p></div>
        </div>

        {tab === "all" && (
          <>
            <h3>All Volunteers</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead style={{ background: "#f4f6f8" }}>
                  <tr>
                    <th style={thTdStyle}>Name</th>
                    <th style={thTdStyle}>Email</th>
                    <th style={thTdStyle}>Phone</th>
                    <th style={thTdStyle}>Address</th>
                    <th style={thTdStyle}>Languages</th>
                    <th style={thTdStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(v => (
                    <tr key={v.id}>
                      <td style={thTdStyle}>{v.name}</td>
                      <td style={thTdStyle}>{v.email}</td>
                      <td style={thTdStyle}>{v.phone}</td>
                      <td style={thTdStyle}>{v.fullAddress}</td>
                      <td style={thTdStyle}>{v.languagesKnown}</td>
                      <td style={thTdStyle}>{getStatusBadge(v.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>All Organizers</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead style={{ background: "#f4f6f8" }}>
                  <tr>
                    <th style={thTdStyle}>Name</th>
                    <th style={thTdStyle}>Email</th>
                    <th style={thTdStyle}>Phone</th>
                    <th style={thTdStyle}>Address</th>
                    <th style={thTdStyle}>Org Name</th>
                    <th style={thTdStyle}>Type</th>
                    <th style={thTdStyle}>Position</th>
                    <th style={thTdStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {organizers.map(o => (
                    <tr key={o.id}>
                      <td style={thTdStyle}>{o.name}</td>
                      <td style={thTdStyle}>{o.email}</td>
                      <td style={thTdStyle}>{o.phone}</td>
                      <td style={thTdStyle}>{o.fullAddress}</td>
                      <td style={thTdStyle}>{o.organizationName}</td>
                      <td style={thTdStyle}>{o.organizationType}</td>
                      <td style={thTdStyle}>{o.position}</td>
                      <td style={thTdStyle}>{getStatusBadge(o.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pending certificates*/}
        {tab === "Pending Certificates" && (
          <>
            <h3 style={{ marginBottom: "15px" }}>
              <FaGraduationCap style={{ marginRight: "8px" }} />
              Certificate Approvals
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>

                <thead style={{ background: "#f4f6f8" }}>
                  <tr>
                    <th style={thTdStyle}>Volunteer Name</th>
                    <th style={thTdStyle}>Event</th>
                    <th style={thTdStyle}>Hours Attended</th>
                    <th style={thTdStyle}>Attendance %</th>
                    <th style={thTdStyle}>Status</th>
                    <th style={thTdStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {certificates.length === 0 ? (

                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                        No certificates found
                      </td>
                    </tr>

                  ) : (

                    certificates.map((c, index) => (

                      <tr key={index}>

                        <td style={thTdStyle}>{c.volunteerName}</td>

                        <td style={thTdStyle}>{c.eventName}</td>

                        <td style={thTdStyle}>{c.hoursAttended} hrs</td>

                        <td style={thTdStyle}>
                          {c.attendancePercentage ? `${c.attendancePercentage}%` : "0%"}
                        </td>
                        {/* STATUS */}
                        <td style={thTdStyle}>
                          {c.certificateApproved ? (
                            <span style={{ color: "green", fontWeight: "bold" }}>
                              Approved
                            </span>
                          ) : (
                            <span style={{ color: "orange", fontWeight: "bold" }}>
                              Pending
                            </span>
                          )}
                        </td>

                        {/* ACTION BUTTON */}
                        <td style={thTdStyle}>

                          {c.certificateApproved ? (

                            <button
                              disabled
                              style={{
                                background: "#95a5a6",
                                color: "white",
                                padding: "6px 14px",
                                border: "none",
                                borderRadius: "5px"
                              }}
                            >
                              Approved
                            </button>

                          ) : (

                            <button
                              style={{
                                background: "#28a745",
                                color: "white",
                                padding: "6px 14px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "bold"
                              }}
                              onClick={() => approveCertificate(c.eventId, c.volunteerId)}
                            >
                              Approve
                            </button>

                          )}

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>
            </div>
          </>
        )}

        {tab === "dashboard" && (
          <>
            <h2 style={{ marginBottom: "20px" }}>Analytics</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >

              {/* USER DISTRIBUTION */}
              <div style={cardStyle}>
                <h4>User Distribution</h4>

                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={40}
                      label
                    >
                      <Cell fill="#3498db" />
                      <Cell fill="#2ecc71" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

              </div>

              {/* USER STATUS */}
              {/* USER STATUS */}
              <div style={cardStyle}>
                <h4>User Status</h4>

                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>

                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={40}
                      label
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />

                  </PieChart>
                </ResponsiveContainer>

              </div>

              {/* CERTIFICATE STATUS */}
              <div style={cardStyle}>
                <h4>Certificate Approval Status</h4>

                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={certificateData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={40}
                      label
                    >
                      <Cell fill="#27ae60" />
                      <Cell fill="#e67e22" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

              </div>

            </div>
            <div style={{ marginTop: "5%" }}>
              <div style={cardStyle}>

                <h4>Monthly Events Conducted</h4>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ marginRight: "10px", fontWeight: "bold" }}>
                    Select Year:
                  </label>

                  <select
                    value={selectedYear}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc"
                    }}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {years.length === 0 ? (
                      <option>No events</option>
                    ) : (
                      years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyEventData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Bar dataKey="events" fill="#3498db" />

                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
            <div style={{
              background: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              marginTop: "20px"
            }}>
              <h4>Organizer Events Analysis</h4><br></br>
              <div style={{
                display: "flex",
                gap: "15px",
                marginBottom: "20px",
                flexWrap: "wrap"
              }}>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  {months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select
                  value={selectedOrganizerName}
                  onChange={(e) => setSelectedOrganizerName(e.target.value)}
                >
                  <option value="">All Organizers</option>
                  {organizerNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

              </div>



              <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: organizerEventData.length * 180 }}>

                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={organizerEventData}
                      margin={{ top: 40, right: 30, left: 20, bottom: 120 }}
                    >

                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="eventLabel"
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                        height={120}
                      />

                      <YAxis domain={[0, 'dataMax + 4']} allowDecimals={false} />

                      <Tooltip
                        formatter={(value) => [`${value}`, "Volunteers"]}
                        labelFormatter={(label, payload) =>
                          payload?.[0]?.payload?.eventName || label
                        }
                      />

                      <Legend verticalAlign="top" />

                      <Bar
                        dataKey="volunteerCount"
                        fill="#e67e22"
                        name="Volunteers"
                        barSize={60}
                      />

                    </BarChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          </>

        )}

        {tab === "validation" && (
          <>


            <h2>Volunteer Validation Documents</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>

                <thead>
                  <tr>
                    <th style={thTdStyle}>Name</th>
                    <th style={thTdStyle}>Email</th>
                    <th style={thTdStyle}>Document</th>
                    <th style={thTdStyle}>Status</th>
                    <th style={thTdStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {validationData.volunteers.map(v => (

                    <tr key={v.id}>

                      <td style={thTdStyle}>{v.name}</td>

                      <td style={thTdStyle}>{v.email}</td>

                      <td style={thTdStyle}>
                        <a
                          href={`http://localhost:8080/${v.governmentIdUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Full
                        </a>
                      </td>
                      <td style={thTdStyle}>
                        {getStatusBadge(v.validationStatus)}
                      </td>
                      <td style={thTdStyle}>
                        {v.validationStatus === "APPROVED" ? (
                          <button disabled style={{ background: "#95a5a6", color: "white", padding: "6px 14px", border: "none", borderRadius: "6px" }}>
                            Approved
                          </button>
                        ) : (
                          <button
                            onClick={() => approveVolunteerValidation(v.id)}
                            style={{
                              background: "#28a745",
                              color: "white",
                              border: "none",
                              padding: "6px 14px",
                              borderRadius: "6px"
                            }}
                          >
                            Approve
                          </button>
                        )}
                      </td>


                    </tr>

                  ))}

                </tbody>

              </table>
            </div>


            <h2 style={{ marginTop: "30px" }}>Organizer Validation Documents</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>

                <thead>
                  <tr>
                    <th style={thTdStyle}>Name</th>
                    <th style={thTdStyle}>Email</th>
                    <th style={thTdStyle}>Document</th>
                    <th style={thTdStyle}>Status</th>
                    <th style={thTdStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {validationData.organizers.map(o => (

                    <tr key={o.id}>

                      <td style={thTdStyle}>{o.name}</td>

                      <td style={thTdStyle}>{o.email}</td>

                      <td style={thTdStyle}>
                        <a
                          href={`http://localhost:8080/${o.governmentIdUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Full
                        </a>
                      </td>

                      <td style={thTdStyle}>
                        {getStatusBadge(o.validationStatus)}
                      </td>

                      <td style={thTdStyle}>
                        {o.validationStatus === "APPROVED" ? (
                          <button disabled style={{ background: "#95a5a6", color: "white", padding: "6px 14px", border: "none", borderRadius: "6px" }}>
                            Approved
                          </button>
                        ) : (
                          <button
                            onClick={() => approveOrganizerValidation(o.id)}
                            style={{
                              background: "#28a745",
                              color: "white",
                              border: "none",
                              padding: "6px 14px",
                              borderRadius: "6px"
                            }}
                          >
                            Approve
                          </button>
                        )}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>
            </div>

          </>
        )}

        {tab === "feedback" && (
          <>
            <h2>Volunteer Feedback</h2>

            {/* TOP ORGANIZERS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                gap: "20px",
                marginBottom: "30px"
              }}
            >

              {topOrganizers.map((org, index) => (
                <div key={index} style={cardStyle}>
                  <h3>Rank {index + 1}</h3>
                  <p><b>{org.name}</b></p>
                  <p>Event: {org.eventName}</p>
                  <p>Avg Rating ⭐ {org.avgRating.toFixed(2)}</p>
                  <button
                    disabled={org.badgeIssued}
                    onClick={() => issueBadge(org.name, index + 1)}
                    style={{
                      marginTop: "10px",
                      padding: "8px",
                      background: "#34db60",
                      color: "white",
                      border: "none",
                      borderRadius: "6px"
                    }}
                  >
                    Issue Badge
                  </button>
                </div>
              ))}

            </div>


            {/* FEEDBACK TABLE */}

            <div style={{ overflowX: "auto" }}>

              <table style={tableStyle}>

                <thead>
                  <tr>
                    <th style={thTdStyle}>Event</th>
                    <th style={thTdStyle}>Organizer</th>
                    <th style={thTdStyle}>Volunteer</th>
                    <th style={thTdStyle}>Email</th>
                    <th style={thTdStyle}>Rating</th>
                    <th style={thTdStyle}>Message</th>
                    <th style={thTdStyle}>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {feedbacks.map((f, index) => (

                    <tr key={index}>

                      <td style={thTdStyle}>{f.eventName}</td>

                      <td style={thTdStyle}>{f.organizerName}</td>

                      <td style={thTdStyle}>{f.volunteerName}</td>

                      <td style={thTdStyle}>{f.email}</td>

                      <td style={thTdStyle}>⭐ {f.rating}</td>

                      <td style={thTdStyle}>{f.message}</td>

                      <td style={thTdStyle}>{f.createdAt}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </>
        )}

        {/* PENDING TAB */}
        {tab === "pending" && (
          <>
            <h3>Pending Volunteers</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thTdStyle}>Name</th>
                    <th style={thTdStyle}>Email</th>
                    <th style={thTdStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVolunteers.map(v => (
                    <tr key={v.id}>
                      <td style={thTdStyle}>{v.name}</td>
                      <td style={thTdStyle}>{v.email}</td>
                      <td style={thTdStyle}>
                        <button onClick={() => handleAction("volunteer", v.id, "approve")}>Approve</button>
                        <button onClick={() => handleAction("volunteer", v.id, "reject")} style={{ marginLeft: "10px" }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>Pending Organizers</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thTdStyle}>Name</th>
                    <th style={thTdStyle}>Email</th>
                    <th style={thTdStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrganizers.map(o => (
                    <tr key={o.id}>
                      <td style={thTdStyle}>{o.name}</td>
                      <td style={thTdStyle}>{o.email}</td>
                      <td style={thTdStyle}>
                        <button onClick={() => handleAction("organizer", o.id, "approve")}>Approve</button>
                        <button onClick={() => handleAction("organizer", o.id, "reject")} style={{ marginLeft: "10px" }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
