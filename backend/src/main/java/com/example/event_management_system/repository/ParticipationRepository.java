package com.example.event_management_system.repository;

import com.example.event_management_system.entity.Participation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    List<Participation> findByVolunteerId(Long volunteerId);
    List<Participation> findByEventIdAndStatus(
            Long eventId,
            String status
    );
    List<Participation> findByEventId(Long eventId);
}