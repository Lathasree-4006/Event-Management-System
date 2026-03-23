package com.example.event_management_system.dto;

import java.time.LocalDateTime;

public interface EventVolunteerDTO {

    Long getEventId();

    String getEventName();

    String getCategory();

    String getOrganizerName();

    Long getVolunteerCount();

    LocalDateTime getEndDateTime();

}
