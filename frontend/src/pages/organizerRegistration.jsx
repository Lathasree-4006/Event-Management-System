import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

function OrganizerRegistration( {userData , setPage}) {
  if (!userData) return <div>Loading...</div>;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organizationName: "",
    organizationType: "",
    website: "",
    country: "",
    state: "",
    city: "",
    fullAddress: "",
    pincode: "",
    position: "",
    experience: "",
    description: "",
    areasOfFocus: [],
    volunteersManaged: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    logo: null,
    certificate: null,
    password: "",
    confirmPassword: "",
  });

  // Autofill name & email
  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        name: userData.fullName || userData.name || "",
        email: userData.email || "",
      }));
    }
  }, [userData]);

  // Handle input change (FIXED)
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // Checkbox handler
  const handleCheckboxChange = (area) => {
    const updatedAreas = formData.areasOfFocus.includes(area)
      ? formData.areasOfFocus.filter((a) => a !== area)
      : [...formData.areasOfFocus, area];

    setFormData((prev) => ({ ...prev, areasOfFocus: updatedAreas }));
  };

  // Submit handler (FIXED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const data = new FormData();

    const organizerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      organizationName: formData.organizationName,
      organizationType: formData.organizationType,
      website: formData.website,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      fullAddress: formData.fullAddress,
      pincode: formData.pincode,
      position: formData.position,
      experience: formData.experience,
      description: formData.description,
      areasOfFocus: formData.areasOfFocus.join(", "),
      volunteersManaged: formData.volunteersManaged,
      facebook: formData.facebook,
      instagram: formData.instagram,
      linkedin: formData.linkedin,
      password: formData.password,
      registrationNumber: formData.registrationNumber
    };

    data.append(
      "organizer",
      new Blob([JSON.stringify(organizerData)], {
        type: "application/json",
      })
    );

    if (formData.logo) data.append("logo", formData.logo);
    if (formData.certificate) data.append("certificate", formData.certificate);

    try {
      const res = await fetch("http://localhost:8080/api/organizer/register", {
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

  const areasList = [
    "Education",
    "Health",
    "Environment",
    "Social Service",
    "Disaster Relief",
    "Animal Welfare",
    "Others",
  ];
  return (
    <div>
   <div className="heading-container">
         <img src={logo} alt="Volunteer Logo" className="logo" />
         <div className="header-left">
           <h2>Organizer Registration</h2>
         </div>
             
         <div className="nav-buttons">
          <button onClick={() => setPage("landing")}>Home</button>
           <button onClick={() => setPage("login")}>Login</button>
         </div>
       </div>
    <div className="organizer-container" style={{ marginTop: "120px" }}>
      <div className="organizer-card">
        <h1 style={{ textAlign: "center" }}>
          Registration Form of Organizer
        </h1><br></br>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <h3>Basic Information</h3><br></br>
          <div className="form-row">
            <input type="text" name="name" value={formData.name} disabled />
            <input type="email" name="email" value={formData.email} disabled />
            <input
              type="text"
              placeholder="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Organization Info */}
          <h3>Organization Information</h3><br></br>
          <div className="form-row">
            <input
              type="text"
              placeholder="Organization Name"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />

            <select
              name="organizationType"
              value={formData.organizationType}
              onChange={handleChange}
              required
            >
              <option value="">Select Organization Type</option>
              <option value="NGO">NGO</option>
              <option value="Private Company">Private Company</option>
              <option value="Government">Government</option>
              <option value="Educational Institution">Educational Institution</option>
              <option value="Others">Others</option>
            </select>

            <input
              type="text"
              placeholder="Website (Optional)"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <h3>Address Details</h3><br></br>
          <div className="form-row">
            <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
            <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
            <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
            <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <input name="fullAddress" placeholder="Full Address" value={formData.fullAddress} onChange={handleChange} required />
          </div>

          {/* Role Info */}
          <h3>Organizer Role Information</h3><br></br>
          <div className="form-row">
            <input name="position" placeholder="Position" value={formData.position} onChange={handleChange} required />
            <input type="number" name="experience" placeholder="Years of Experience" value={formData.experience} onChange={handleChange} required />
            <textarea name="description" placeholder="About Organization" value={formData.description} onChange={handleChange} required />
          </div>

          {/* Areas */}
          <h3>Areas of Focus</h3><br></br>
          <div className="form-row">
            {areasList.map((area) => (
              <label key={area} style={{ marginRight: "25px" }}>
                <input
                  type="checkbox"
                  checked={formData.areasOfFocus.includes(area)}
                  onChange={() => handleCheckboxChange(area)}
                />
                {area}
              </label>
            ))}
          </div>

          {/* Optional */}
          <h3>Optional Details</h3><br></br>
          <div className="form-row">
            <input type="number" name="volunteersManaged" placeholder="Volunteers Managed by you" value={formData.volunteersManaged} onChange={handleChange} />
            <div>
            <label>Upload Organization Logo  : </label>
            <input type="file" name="logo" onChange={handleChange} style={{marginLeft:"20px"}}/></div>
            <div>
              <label>Upload related Certificate :  </label>
              <input type="file" name="certificate" onChange={handleChange} style={{marginLeft:"20px"}}/>
            </div>
          </div>

          <div className="form-row">
            <input name="facebook" placeholder="Facebook Link" value={formData.facebook} onChange={handleChange} />
            <input name="instagram" placeholder="Instagram Link" value={formData.instagram} onChange={handleChange} />
            <input name="linkedin" placeholder="LinkedIn Link" value={formData.linkedin} onChange={handleChange} />
          </div>

          {/* Password */}
          <br />
          <div className="form-row">
            <input type="text" name="registrationNumber"placeholder="Registration Number" value={formData.registrationNumber} />
            <input type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <div style={{ textAlign: "center" }}>
            <button type="submit" className="submit-btn">
              Submit Registration
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}

export default OrganizerRegistration;
