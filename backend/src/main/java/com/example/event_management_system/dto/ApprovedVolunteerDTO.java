package com.example.event_management_system.dto;

public class ApprovedVolunteerDTO {

    private Long volunteerId;
    private String volunteerName;
    private String email;

    public ApprovedVolunteerDTO(
            Long volunteerId,
            String volunteerName,
            String email) {

        this.volunteerId = volunteerId;
        this.volunteerName = volunteerName;
        this.email = email;
    }

    public Long getVolunteerId() {
        return volunteerId;
    }

    public String getVolunteerName() {
        return volunteerName;
    }

    public String getEmail() {
        return email;
    }
}