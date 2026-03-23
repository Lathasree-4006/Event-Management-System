package com.example.event_management_system.entity;
import jakarta.persistence.*;

@Entity
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long eventId;
    private Long volunteerId;

    // hours attended
    private double hoursAttended;

    // PRESENT or ABSENT
    private String status;
    private Double attendancePercentage;
    private boolean certificateApproved = false;

    public boolean isCertificateApproved() {
        return certificateApproved;
    }

    public void setCertificateApproved(boolean certificateApproved) {
        this.certificateApproved = certificateApproved;
    }

    // getters and setters
    public Long getId() { return id; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public double getHoursAttended() { return hoursAttended; }
    public void setHoursAttended(double hoursAttended) { this.hoursAttended = hoursAttended; }

    public String getStatus() { return status; }
    public double getAttendancePercentage() { return attendancePercentage; }
    public void setStatus(String status) { this.status = status; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage ;}
}
