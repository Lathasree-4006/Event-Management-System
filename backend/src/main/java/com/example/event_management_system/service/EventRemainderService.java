package com.example.event_management_system.service;

import com.example.event_management_system.entity.*;
import com.example.event_management_system.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventRemainderService {

    private final VolunteerRequestRepository requestRepository;
    private final EventRepository eventRepository;
    private final VolunteerRepository volunteerRepository;
    private final NotificationService notificationService;

    public EventRemainderService(
            VolunteerRequestRepository requestRepository,
            EventRepository eventRepository,
            VolunteerRepository volunteerRepository,
            NotificationService notificationService) {

        this.requestRepository = requestRepository;
        this.eventRepository = eventRepository;
        this.volunteerRepository = volunteerRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 */5 * * * *")
    public void sendReminders() {

        System.out.println("Reminder scheduler running...");

        LocalDateTime now = LocalDateTime.now();

        List<VolunteerRequest> approvedRequests =
                requestRepository.findByStatus("APPROVED");

        for (VolunteerRequest request : approvedRequests) {

            Event event = eventRepository
                    .findById(request.getEventId())
                    .orElse(null);

            if (event == null) continue; // event deleted

            if (!"APPROVED".equals(request.getStatus())) continue; // cancelled

            // skip past events
            if (event.getStartDateTime().isBefore(now)) continue;

            Volunteer volunteer =
                    volunteerRepository
                            .findById(request.getVolunteerId())
                            .orElse(null);

            if (volunteer == null) continue;

            Duration duration =
                    Duration.between(now, event.getStartDateTime());

            long totalMinutes = duration.toMinutes();
            long totalDays = duration.toDays();

            String message = null;

            // 1 Month (between 29–30 days)
            if (totalDays <= 30 && totalDays >= 29
                    && !request.isMonthReminderSent()) {

                message = " \uD83C\uDF89 Just 1 MONTH left for '"
                        + event.getEventName()
                        + "'! Get ready to make impact!";

                request.setMonthReminderSent(true);
            }

            // 1 Week (between 6–7 days)
            else if (totalDays <= 7 && totalDays >= 6
                    && !request.isWeekReminderSent()) {

                message = "\uD83D\uDD25 Only 1 WEEK to go for '"
                        + event.getEventName()
                        + "'! Your contribution matters!";

                request.setWeekReminderSent(true);
            }

            // 1 Day (between 23–24 hours)
            else if (totalMinutes <= 1440 && totalMinutes > 1380
                    && !request.isDayReminderSent()) {

                message = " ⏳ Tomorrow is the big day! '"
                        + event.getEventName()
                        + "' is almost here!";

                request.setDayReminderSent(true);
            }

            //  1 Hour (within 60 minutes)
            else if (totalMinutes <= 60 && totalMinutes > 0
                    && !request.isHourReminderSent()) {

                message = " \uD83D\uDE80 Starting within 1 HOUR! '"
                        + event.getEventName()
                        + "' is about to begin!";

                request.setHourReminderSent(true);
            }

            if (message != null) {

                System.out.println("Sending reminder to: "
                        + volunteer.getEmail());

                notificationService.notifyVolunteer(
                        volunteer.getEmail(),
                        message
                );

                requestRepository.save(request);
            }
        }
    }
}