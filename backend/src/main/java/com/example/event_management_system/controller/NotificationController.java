package com.example.event_management_system.controller;

import com.example.event_management_system.entity.Notification;
import com.example.event_management_system.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    //  Get notifications for ANY user (organizer or volunteer)
    @GetMapping("/{email}")
    public List<Notification> getNotifications(@PathVariable String email) {
        return service.getVolunteerNotifications(email);
    }

    //  Unread count
    @GetMapping("/{email}/unread-count")
    public long getUnreadCount(@PathVariable String email) {
        return service.getUnreadCount(email);
    }

    //  Mark all as read
    @PutMapping("/{email}/mark-read")
    public void markAllRead(@PathVariable String email) {
        service.markAllAsRead(email);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        service.deleteNotification(id);
    }

}