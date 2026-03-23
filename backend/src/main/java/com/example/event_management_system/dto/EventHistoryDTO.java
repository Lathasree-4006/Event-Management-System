package com.example.event_management_system.dto;

import java.time.LocalDateTime;

public class EventHistoryDTO {

    private Long eventId;
    private Long volunteerId;
    private LocalDateTime assignedDate;

    private String status;   //  ONLY ONE status

    // --- New fields ---
    private String eventName;
    private String location;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String assignedWork;

    // Getters and Setters

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public LocalDateTime getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDateTime assignedDate) { this.assignedDate = assignedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }

    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }

    public String getAssignedWork() { return assignedWork; }
    public void setAssignedWork(String assignedWork) { this.assignedWork = assignedWork; }
}