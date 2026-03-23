package com.example.event_management_system.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class VolunteerRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "volunteer_id")
    private Long volunteerId;

    private String status; // PENDING, APPROVED, REJECTED
    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();
    private boolean monthReminderSent = false;
    private boolean weekReminderSent = false;
    private boolean dayReminderSent = false;
    private boolean hourReminderSent = false;
    // Default constructor
    public VolunteerRequest() {}

    // Getters & Setters
    public boolean isMonthReminderSent() { return monthReminderSent; }
    public void setMonthReminderSent(boolean monthReminderSent) { this.monthReminderSent = monthReminderSent; }

    public boolean isWeekReminderSent() { return weekReminderSent; }
    public void setWeekReminderSent(boolean weekReminderSent) { this.weekReminderSent = weekReminderSent; }

    public boolean isDayReminderSent() { return dayReminderSent; }
    public void setDayReminderSent(boolean dayReminderSent) { this.dayReminderSent = dayReminderSent; }

    public boolean isHourReminderSent() { return hourReminderSent; }
    public void setHourReminderSent(boolean hourReminderSent) { this.hourReminderSent = hourReminderSent; }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getVolunteerId() {
        return volunteerId;
    }

    public void setVolunteerId(Long volunteerId) {
        this.volunteerId = volunteerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }
}