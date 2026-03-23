package com.example.event_management_system.repository;
import com.example.event_management_system.entity.Organizer;
import com.example.event_management_system.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByEmail(String email);
    List<Volunteer> findByStatus(String status);
    Optional<Volunteer> findByResetToken(String resetToken);
    List<Volunteer> findByValidationStatus(String validationStatus);
    List<Volunteer> findByGovernmentIdUrlIsNotNull();
}
