package com.example.event_management_system.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String organizerName;
    private String organizationName;
    private String eventName;
    private String description;
    private String category;
    private String location;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private int volunteersRequired;
    private Long organizerId;
    private int volunteersApproved;
    private boolean registrationOpen = true; // default open
    public boolean isRegistrationOpen() {
        return registrationOpen;
    }
    public void setRegistrationOpen(boolean registrationOpen) {
        this.registrationOpen = registrationOpen;
    }

    public int getVolunteersApproved() {
        return volunteersApproved;
    }
    public void setVolunteersApproved(int volunteersApproved) {
        this.volunteersApproved = volunteersApproved;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventName() {

        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    public int getVolunteersRequired() {
        return volunteersRequired;
    }

    public void setVolunteersRequired(int volunteersRequired) {
        this.volunteersRequired = volunteersRequired;
    }

    public Long getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(Long organizerId) {

        this.organizerId = organizerId;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

}