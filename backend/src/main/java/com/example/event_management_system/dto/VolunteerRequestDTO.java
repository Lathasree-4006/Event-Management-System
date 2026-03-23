package com.example.event_management_system.dto;

import java.time.LocalDateTime;

public class VolunteerRequestDTO {

    private Long requestId;
    private String eventName;
    private String location;
    private LocalDateTime startDateTime;
    private String organizerName;
    private String status;
    private LocalDateTime requestedAt;

    public VolunteerRequestDTO(Long requestId, String eventName, String location,
                               LocalDateTime startDateTime, String organizerName,
                               String status, LocalDateTime requestedAt) {
        this.requestId = requestId;
        this.eventName = eventName;
        this.location = location;
        this.startDateTime = startDateTime;
        this.organizerName = organizerName;
        this.status = status;
        this.requestedAt = requestedAt;
    }

    // Getters

    public Long getRequestId() { return requestId; }
    public String getEventName() { return eventName; }
    public String getLocation() { return location; }
    public LocalDateTime getStartDateTime() { return startDateTime; }
    public String getOrganizerName() { return organizerName; }
    public String getStatus() { return status; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
}