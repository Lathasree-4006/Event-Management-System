# Event Management and Engagement System

## Project Overview

The **Event Management and Engagement System** is a full-stack web application designed to simplify the process of organizing, managing, and participating in events.

It allows **admins, organizers, and volunteers** to interact efficiently through a centralized platform with features like event creation, participation tracking, notifications, and feedback.

## Tech Stack

### Frontend

* React (Vite)
* JavaScript
* CSS

### Backend

* Spring Boot
* Spring Security
* Spring Data JPA

### Database

* MySQL

##  Features

### User Roles

* Admin
* Organizer
* Volunteer

### Event Management

* Create and manage events
* Assign volunteers to events
* Track participation

### Authentication & Security

* Login & Registration
* OTP Verification
* Role-based access control

###  Notifications

* Email notifications using SMTP
* Event reminders

### Additional Features

* Feedback system
* Attendance tracking
* Certificate generation
* Dashboard analytics

##  Project Structure

```
Event-Management-System/
 ├── frontend/   # React (Vite) application
 ├── backend/    # Spring Boot application
```

---

## How to Run the Project

### Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

OR (Windows PowerShell):

```bash
.\mvnw spring-boot:run
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables Required

Set the following environment variables in your system:

```
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_app_password
```

## Local Application Ports

* Frontend → http://localhost:5173
* Backend → http://localhost:8080


## Website Link

https://event-management-system-1-pitx.onrender.com


## ⚠️ Important Notes

* Ensure MySQL is running and database `volunteer_db` exists
* Do not commit sensitive data like passwords or API keys
* `node_modules` and `target` folders are ignored using `.gitignore`

---

##  Future Enhancements

* Deployment to cloud platforms
* Real-time notifications
* Mobile responsiveness improvements
* Advanced analytics dashboard

---

##  Author

**D.Lathasree**

## Acknowledgment

This project was developed as part of an internship to demonstrate full-stack development skills using modern technologies.

