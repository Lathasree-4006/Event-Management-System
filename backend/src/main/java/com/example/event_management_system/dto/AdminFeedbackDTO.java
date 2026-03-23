package com.example.event_management_system.dto;

import java.time.LocalDateTime;

public class AdminFeedbackDTO {

    private Long eventId;
    private String eventName;
    private String organizerName;
    private Long volunteerId;
    private String volunteerName;
    private String email;
    private int rating;
    private String message;
    private LocalDateTime createdAt;

    public AdminFeedbackDTO(Long eventId, String eventName, String organizerName,
                            Long volunteerId, String volunteerName, String email,
                            int rating, String message, LocalDateTime createdAt) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.organizerName = organizerName;
        this.volunteerId = volunteerId;
        this.volunteerName = volunteerName;
        this.email = email;
        this.rating = rating;
        this.message = message;
        this.createdAt = createdAt;
    }

    // GETTERS (VERY IMPORTANT)

    public Long getEventId() { return eventId; }

    public String getEventName() { return eventName; }

    public String getOrganizerName() { return organizerName; }

    public Long getVolunteerId() { return volunteerId; }

    public String getVolunteerName() { return volunteerName; }

    public String getEmail() { return email; }

    public int getRating() { return rating; }

    public String getMessage() { return message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}