package com.example.event_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.event_management_system.entity.Organizer;
import java.util.Optional;
import java.util.List;
public interface OrganizerRepository extends JpaRepository<Organizer, Long> {
    List<Organizer> findByValidationStatus(String validationStatus);
    Optional<Organizer> findByEmail(String email);
    List<Organizer> findByStatus(String status);
    Optional<Organizer> findByResetToken(String resetToken);
    List<Organizer> findByGovernmentIdUrlIsNotNull();

}
