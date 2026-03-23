package com.example.event_management_system.repository;

import com.example.event_management_system.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository
        extends JpaRepository<Assignment, Long> {

    List<Assignment> findByEventId(Long eventId);
    boolean existsByEventIdAndVolunteerId(
            Long eventId,
            Long volunteerId
    );

        List<Assignment> findByVolunteerId(Long volunteerId);
    Assignment findByEventIdAndVolunteerId(Long eventId, Long volunteerId);

}
