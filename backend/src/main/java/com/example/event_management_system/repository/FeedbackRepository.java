package com.example.event_management_system.repository;

import com.example.event_management_system.dto.AdminFeedbackDTO;
import com.example.event_management_system.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByEventId(Long eventId);

    @Query(value = """
    SELECT 
    v.name as volunteerName,
    e.event_name as eventName,
    f.rating as rating,
    f.message as message
    FROM feedback f
    JOIN volunteer v ON f.volunteer_id = v.id
    JOIN event e ON f.event_id = e.id
    """, nativeQuery = true)

    List<Map<String,Object>> getAllFeedback();

    Feedback findByEventIdAndVolunteerId(Long eventId, Long volunteerId);

    @Query("""
SELECT new com.example.event_management_system.dto.AdminFeedbackDTO(
    f.eventId,
    e.eventName,
    e.organizerName,
    f.volunteerId,
    f.volunteerName,
    f.email,
    f.rating,
    f.message,
    f.createdAt
)
FROM Feedback f
JOIN Event e ON f.eventId = e.id
""")
    List<AdminFeedbackDTO> getAllFeedbackForAdmin();
}
