package com.example.event_management_system.repository;

import com.example.event_management_system.dto.EventVolunteerDTO;
import com.example.event_management_system.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);
    List<Event> findByLocation(String location);

    List<Event> findByCategory(String category);

    List<Event> findByLocationAndCategory(String location, String category);
    @Query("SELECT e FROM Event e JOIN Assignment a ON e.id = a.eventId WHERE a.volunteerId = :volunteerId")
    List<Event> findEventsForVolunteer(@Param("volunteerId") Long volunteerId);

    @Query("""
SELECT e.id AS eventId,
       e.eventName AS eventName,
       e.category AS category,
       e.organizerName AS organizerName,
       e.endDateTime AS endDateTime,
       COUNT(CASE WHEN UPPER(a.status) = 'PRESENT' THEN a.id END) AS volunteerCount
FROM Event e
LEFT JOIN Attendance a ON e.id = a.eventId
GROUP BY e.id, e.eventName, e.category, e.organizerName, e.endDateTime
""")
    List<EventVolunteerDTO> getEventVolunteerCounts();

}
