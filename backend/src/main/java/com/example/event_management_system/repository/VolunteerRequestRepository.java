package com.example.event_management_system.repository;

import com.example.event_management_system.dto.VolunteerRequestDTO;
import com.example.event_management_system.entity.VolunteerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VolunteerRequestRepository extends JpaRepository<VolunteerRequest, Long> {

    // Required for service methods
    List<VolunteerRequest> findByVolunteerId(Long volunteerId);

    // Optional but useful
    boolean existsByVolunteerIdAndEventId(Long volunteerId, Long eventId);

    List<VolunteerRequest> findByEventId(Long eventId);
    @Query("SELECT r FROM VolunteerRequest r WHERE r.volunteerId = :volunteerId AND r.status = 'APPROVED'")
    List<VolunteerRequest> findApprovedRequests(Long volunteerId);
    List<VolunteerRequest> findByVolunteerIdAndStatus(Long volunteerId, String status);
    Optional<VolunteerRequest> findByVolunteerIdAndEventId(Long volunteerId, Long eventId);
    List<VolunteerRequest> findByEventIdAndStatus(
            Long eventId,
            String status
    );
    List<VolunteerRequest> findByStatus(String status);
}
