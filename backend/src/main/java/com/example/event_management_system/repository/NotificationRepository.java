package com.example.event_management_system.repository;

import com.example.event_management_system.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByEmailOrderByCreatedAtDesc(String email);

    long countByEmailAndIsReadFalse(String email);

}