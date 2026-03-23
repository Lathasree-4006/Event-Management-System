package com.example.event_management_system.service;

import com.example.event_management_system.entity.*;
import com.example.event_management_system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final VolunteerRequestRepository requestRepository;
    private final FeedbackRepository feedbackRepository;
    private final OrganizerRepository organizerRepository;
    private final VolunteerRepository volunteerRepository;
    private final NotificationService notificationService;
    private final AssignmentRepository assignmentRepository;
    @Autowired
    public EventService(EventRepository eventRepository,
                        VolunteerRequestRepository requestRepository,
                        FeedbackRepository feedbackRepository,
                        OrganizerRepository organizerRepository,
                        VolunteerRepository volunteerRepository,
                        NotificationService notificationService,
                        AssignmentRepository assignmentRepository) {
        this.eventRepository = eventRepository;
        this.requestRepository = requestRepository;
        this.feedbackRepository = feedbackRepository;
        this.organizerRepository = organizerRepository;
        this.volunteerRepository = volunteerRepository;
        this.notificationService = notificationService;
        this.assignmentRepository = assignmentRepository;
    }

    //  CREATE EVENT → notify all volunteers
    public Event createEvent(Event event) {
        Event savedEvent = eventRepository.save(event);

        //  Notify all volunteers about new event
        List<Volunteer> volunteers = volunteerRepository.findAll();
        for (Volunteer v : volunteers) {
            notificationService.notifyVolunteer(
                    v.getEmail(),
                    "New event created: " + savedEvent.getEventName()
            );
        }

        return savedEvent;
    }

    //  GET ALL EVENTS
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    //  GET EVENTS BY ORGANIZER
    public List<Event> getEventsByOrganizer(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }

    // GET EVENT BY ID
    public Optional<Event> getEventById(Long eventId) {
        return eventRepository.findById(eventId);
    }

    //  UPDATE EVENT → notify volunteers who applied
    public Event updateEvent(Long id, Event updatedEvent) {
        return eventRepository.findById(id).map(event -> {
            event.setEventName(updatedEvent.getEventName());
            event.setDescription(updatedEvent.getDescription());
            event.setCategory(updatedEvent.getCategory());
            event.setLocation(updatedEvent.getLocation());
            event.setStartDateTime(updatedEvent.getStartDateTime());
            event.setEndDateTime(updatedEvent.getEndDateTime());
            event.setVolunteersRequired(updatedEvent.getVolunteersRequired());

            Event saved = eventRepository.save(event);

            //  Notify volunteers who applied
            List<VolunteerRequest> requests = requestRepository.findByEventId(id);
            for (VolunteerRequest req : requests) {
                Volunteer v = volunteerRepository.findById(req.getVolunteerId()).orElse(null);
                if (v != null) {
                    notificationService.notifyVolunteer(
                            v.getEmail(),
                            "Event updated: " + saved.getEventName()
                    );
                }
            }

            return saved;
        }).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    //  DELETE EVENT → notify applied volunteers
    public void deleteEvent(Long eventId) {
        List<VolunteerRequest> requests = requestRepository.findByEventId(eventId);

        for (VolunteerRequest req : requests) {
            Volunteer v = volunteerRepository.findById(req.getVolunteerId()).orElse(null);
            if (v != null) {
                notificationService.notifyVolunteer(
                        v.getEmail(),
                        "An event you applied for was cancelled."
                );
            }
        }

        eventRepository.deleteById(eventId);
    }

    //  VOLUNTEER APPLIES → notify organizer
    public VolunteerRequest applyToEvent(Long eventId, VolunteerRequest request) {
        request.setEventId(eventId);
        request.setStatus("PENDING");
        VolunteerRequest savedRequest = requestRepository.save(request);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Organizer organizer = organizerRepository.findById(event.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        //  Notify organizer
        notificationService.notifyVolunteer(
                organizer.getEmail(),
                "New volunteer request for event: " + event.getEventName()
        );

        return savedRequest;
    }

    // GET REQUESTS FOR EVENT
    public List<VolunteerRequest> getRequestsByEvent(Long eventId) {
        return requestRepository.findByEventId(eventId);
    }

    //  APPROVE REQUEST → notify volunteer
    public void approveRequest(Long requestId) {
        VolunteerRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus("APPROVED");
        requestRepository.save(request);

        Volunteer volunteer = volunteerRepository.findById(request.getVolunteerId())
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));

        notificationService.notifyVolunteer(
                volunteer.getEmail(),
                "Your request has been APPROVED."
        );
    }

    //  REJECT REQUEST → notify volunteer
    public void rejectRequest(Long requestId) {
        VolunteerRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus("REJECTED");
        requestRepository.save(request);

        Volunteer volunteer = volunteerRepository.findById(request.getVolunteerId())
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));

        notificationService.notifyVolunteer(
                volunteer.getEmail(),
                "Your request has been REJECTED."
        );
    }

    //  GET FEEDBACK
    public List<Feedback> getFeedbackByEvent(Long eventId) {
        return feedbackRepository.findByEventId(eventId);
    }

    // FILTER EVENTS
    public List<Event> filterEvents(String location, String category) {

        if (location != null && !location.isEmpty() &&
                category != null && !category.isEmpty()) {
            return eventRepository.findByLocationAndCategory(location, category);
        }

        if (location != null && !location.isEmpty()) {
            return eventRepository.findByLocation(location);
        }

        if (category != null && !category.isEmpty()) {
            return eventRepository.findByCategory(category);
        }

        return eventRepository.findAll();
    }

    public List<Map<String, Object>> getEventRequests(Long eventId) {

        List<VolunteerRequest> requests = requestRepository.findByEventId(eventId);

        return requests.stream().map(req -> {

            Volunteer volunteer = volunteerRepository
                    .findById(req.getVolunteerId())
                    .orElse(null);

            Map<String, Object> data = new HashMap<>();
            data.put("id", req.getId());
            data.put("status", req.getStatus());

            if (volunteer != null) {
                data.put("name", volunteer.getName());
                data.put("fullAddress", volunteer.getFullAddress());
                data.put("phone",volunteer.getPhone());
            } else {
                data.put("name", "N/A");
                data.put("fullAddress", "N/A");
                data.put("phone","N/A");
            }

            return data;

        }).toList();
    }
    public boolean cancelVolunteerParticipation(Long eventId, Long volunteerId) {
        Assignment assignment = assignmentRepository.findByEventIdAndVolunteerId(eventId, volunteerId);
        if (assignment != null) {
            assignmentRepository.delete(assignment);
            return true;
        }
        return false;
    }

}