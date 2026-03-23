import logo from "../assets/logo.png";
import pic1 from "../assets/pic1.png";
import skillicon from "../assets/skillicon.png";
import careericon from "../assets/careericon.png";
import networkicon from "../assets/networkicon.png";
import socialicon from "../assets/socialicon.png";
import certificateicon from "../assets/certificateicon.png";
import volunteer from "../assets/volunteer.png";

function Landing({ setPage }) {
  return (
    <div className = "MainPage">
    <div className="heading-container">
      <img src={logo} alt="Volunteer Logo" className="logo" />
      <div className="header-left">
        <h1>Volunteer Management System</h1>
        <p>Join hands to serve the community </p>
      </div>
            <br></br><b></b><b></b><b><b></b></b><br></br><b></b><b></b><b><b></b></b>
      <div className="nav-buttons">
        <button onClick={() => setPage("register")}>Register</button>
        <button onClick={() => setPage("login")}>Login</button>
      </div>
    </div>
    <div className="card-picture">
       <img src={pic1} alt="Community Services" className="pic1" align="left"/>
       <hr className="vertical-hr"></hr>
       <p className="descr">Serving the community means coming together to support, uplift, and empower people in need. Through volunteering, individuals can contribute their time, skills, and compassion to create positive social change. Community service strengthens bonds, promotes equality, and helps build a more caring and inclusive society.</p>
    </div>
    <div className="card-picture1">
      <p className="descr1">The system focuses on simplifying volunteer onboarding, improving coordination, and increasing participation in social and community-driven initiatives.</p>
      <hr className="vertical-hr"></hr> 
      <img src={volunteer} alt="Community Services" className="pic1" align="right"/>
    </div>

    <p className="keyfeature">Key Features</p><b></b>
    <div className="diff-features">
      <div className="feature-card">
          <p className="keyfeature1">Skill Development</p>
          <img src={skillicon} alt="Skill Development Icon" className="skillicon"></img>
          <p className="key-descr-feature">Improve communication, teamwork, leadership skills.</p>
      </div>
      <div className="feature-card">
          <p className="keyfeature1">Career Growth</p>
          <img src={careericon} alt="Career Growth Icon" className="skillicon"></img>
          <p className="key-descr-feature">Gain valuable experience that strengthens your resume and career profile.</p>
      </div>
       <div className="feature-card">
          <p className="keyfeature1">Networking</p>
          <img src={networkicon} alt="Networking Icon" className="skillicon"></img>
          <p className="key-descr-feature">Connect with like-minded people, NGOs, and community leaders.</p>
      </div>
      <div className="feature-card">
          <p className="keyfeature1">Social Responsibility</p>
          <img src={socialicon} alt="Social responsibility Icon" className="skillicon"></img>
          <p className="key-descr-feature"> Contribute to society and help build a stronger, caring community.</p>
      </div>
      <div className="feature-card">
          <p className="keyfeature1">Certification</p>
          <img src={certificateicon} alt="Certification icon" className="skillicon"></img>
          <p className="key-descr-feature">For your service the Organizers of the event will provide you a valid certification.</p>
      </div>
    </div>
    
    <div className="afterkey">
         <p className="endline">Are you thrilled to do the Community Service as an Organizer or as a volunteer. <br></br>Then Register now!..</p>
         <br></br><div className="endbutton">
          <button onClick={() => setPage("register")}> Register Now</button>
         </div>
        
    </div>
    <footer className="footer">
      <p className="footerp1">© 2026 Volunteer Management System. All rights reserved.</p>
      <p className="footerp2"><i>Serving communities • Building impact • Community Connect</i> </p>
    </footer>
     </div> 
  );
}

export default Landing;
