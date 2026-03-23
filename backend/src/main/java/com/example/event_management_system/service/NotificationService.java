package com.example.event_management_system.service;

import com.example.event_management_system.entity.Notification;
import com.example.event_management_system.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    public NotificationService(NotificationRepository notificationRepository,
                               JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    //  Save notification
    public void notifyVolunteer(String email, String message) {
        System.out.println(" Saving notification for: " + email);

        Notification notification = new Notification();
        notification.setEmail(email);
        notification.setMessage(message);
        notification.setisRead(false);

        notificationRepository.save(notification);
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(email);
            mail.setSubject("🎉 Event Reminder - Don't Miss It!");

            String emailContent =
                    "🎉 Hello Volunteer!\n\n" +
                            "This is a friendly reminder about your upcoming event.\n\n" +
                            "Event Details:\n" +
                            message + "\n\n" +
                            "Get ready to make an impact and contribute to something meaningful!\n\n" +
                            "Please make sure to arrive 15 minutes early.\n\n" +
                            "See you there!\n" +
                            "Team Campus Event Management System 🚀";

            mail.setText(emailContent);
            mailSender.send(mail);

        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
        }
    }

    public long getUnreadCount(String email) {
        return notificationRepository.countByEmailAndIsReadFalse(email);
    }

    public void markAllAsRead(String email) {
        notificationRepository.findByEmailOrderByCreatedAtDesc(email)
                .forEach(n -> {
                    n.setisRead(true);
                    notificationRepository.save(n);
                });
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    public java.util.List<Notification> getVolunteerNotifications(String email) {
        return notificationRepository.findByEmailOrderByCreatedAtDesc(email);
    }
}