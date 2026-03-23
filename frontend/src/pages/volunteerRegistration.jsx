import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

function VolunteerRegistration({ userData ,setPage}) {
  if (!userData) return <div>Loading...</div>;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "India",
    state: "",
    district: "",
    city: "",
    pincode: "",
    fullAddress: "",
    language1: "",
    language2: "",
    language3: "",
    areasOfInterest: [],
    password: "",
    confirmPassword: "",
    certification: null,
  });

  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        name: userData.fullName || userData.name || "",
        email: userData.email || "",
      }));
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleCheckboxChange = (area) => {
    const updatedAreas = formData.areasOfInterest.includes(area)
      ? formData.areasOfInterest.filter((a) => a !== area)
      : [...formData.areasOfInterest, area];

    setFormData((prev) => ({ ...prev, areasOfInterest: updatedAreas }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const volunteerPayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      state: formData.state,
      district: formData.district,
      city: formData.city,
      pincode: formData.pincode,
      fullAddress: formData.fullAddress,
      languagesKnown: [formData.language1, formData.language2, formData.language3]
        .filter(Boolean)
        .join(", "),
      areasOfInterest: formData.areasOfInterest.join(", "),
      password: formData.password,
      status: "PENDING",
    };

    const data = new FormData();

    // Send JSON as "volunteer"
    data.append(
      "volunteer",
      new Blob([JSON.stringify(volunteerPayload)], {
        type: "application/json",
      })
    );

    //  Send file
    if (formData.certification) {
      data.append("certification", formData.certification);
    }

    try {
      const res = await fetch("http://localhost:8080/api/volunteer/register", {
        method: "POST",
        body: data,
      });

      const text = await res.text();
      alert(text);
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  const languagesList = [
    "English","Hindi","Bengali","Telugu","Marathi","Tamil","Urdu","Gujarati",
    "Kannada","Odia","Punjabi","Assamese","Maithili","Santali","Kashmiri",
    "Nepali","Konkani","Dogri","Manipuri","Bodo","Santhali"
  ];

  const areasList = [
    "Education","Health","Disaster Relief","Social Service",
    "Environment","Animal Welfare","Others"
  ];

  return (
    <div>
           <div className="heading-container">
              <img src={logo} alt="Volunteer Logo" className="logo" />
              <div className="header-left">
                <h1>Volunteer Registration</h1>
              </div>
              <div className="nav-buttons">
          <button onClick={() => setPage("landing")}>Home</button>
          <button onClick={() => setPage("login")}>Login</button>
        </div>
              </div>
    <div className="volunteer-container" style={{ marginTop: "120px" }}>
      <div className="volunteer-card">
        <h1 style={{ textAlign: "center" }}>Volunteer Registration Form</h1>
        <form onSubmit={handleSubmit}>
          <h3>Personal Information</h3>
          <div className="form-row">
            <input type="text" name="name" value={formData.name} disabled />
            <input type="email" name="email" value={formData.email} disabled />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <h3>Address Details</h3>
          <div className="form-row">
            <input type="text" name="country" value={formData.country} onChange={handleChange} required />
            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
            <input type="text" name="district" placeholder="District" value={formData.district} onChange={handleChange} required />
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
            <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="fullAddress"
              placeholder="Full Address"
              value={formData.fullAddress}
              onChange={handleChange}
              required
            />
          </div>

          <h3>Languages Known</h3>
          <div className="form-row">
            {[1,2,3].map((num) => (
              <select
                key={num}
                name={`language${num}`}
                value={formData[`language${num}`]}
                onChange={handleChange}
                required={num === 1}
              >
                <option value="">Select Language {num}</option>
                {languagesList.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            ))}
          </div>

          <h3>Areas of Interest</h3>
          <div className="form-row">
            {areasList.map((area) => (
              <label key={area} style={{ marginRight: "20px" }}>
                <input
                  type="checkbox"
                  checked={formData.areasOfInterest.includes(area)}
                  onChange={() => handleCheckboxChange(area)}
                />
                {area}
              </label>
            ))}
          </div>

          <h3>Certification (Optional)</h3>
          <input type="file" name="certification" onChange={handleChange}/>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" style={{ marginTop: "20px" }}>
            Submit Registration
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}

export default VolunteerRegistration;
