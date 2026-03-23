package com.example.event_management_system.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.example.event_management_system.dto.EventVolunteerDTO;
import com.example.event_management_system.dto.VolunteerRequestDTO;
import com.example.event_management_system.entity.VolunteerRequest;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.event_management_system.service.VolunteerRequestService;
import com.example.event_management_system.entity.Event;
import com.example.event_management_system.service.EventService;
import com.example.event_management_system.repository.VolunteerRequestRepository;
import com.example.event_management_system.repository.EventRepository;
import com.example.event_management_system.entity.Organizer;
import com.example.event_management_system.repository.OrganizerRepository;
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*") // allow frontend access
public class EventController {
    @Autowired
    private OrganizerRepository organizerRepository;

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VolunteerRequestRepository requestRepository;

    private final VolunteerRequestService requestService;

    public EventController(VolunteerRequestService requestService) {
        this.requestService = requestService;
    }

    //  Create Event
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Organizer organizer = organizerRepository
                .findById(event.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        event.setOrganizerName(organizer.getName());
        event.setOrganizationName(organizer.getOrganizationName());
        Event savedEvent = eventService.createEvent(event);
        return ResponseEntity.ok(savedEvent);
    }

    @PostMapping("/{eventId}/apply")
    public ResponseEntity<?> applyForEvent(
            @PathVariable Long eventId,
            @RequestBody Map<String, Long> body
    ) {
        Long volunteerId = body.get("volunteerId");

        if (volunteerId == null) {
            return ResponseEntity.badRequest().body("Volunteer ID is required");
        }

        try {
            requestService.applyToEvent(eventId, volunteerId);
            return ResponseEntity.ok("Applied successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    //  Get All Events
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    //  Get Event by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        Optional<Event> event = eventService.getEventById(id);
        return event.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get Events by Organizer
    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<Event>> getEventsByOrganizer(@PathVariable Long organizerId) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(organizerId));
    }

    //  Update Event
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id,
                                             @RequestBody Event updatedEvent) {
        Event event = eventService.updateEvent(id, updatedEvent);
        return ResponseEntity.ok(event);
    }

    //  Delete Event
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok("Event deleted successfully");
    }

    //  Get Volunteer Requests for an Event
    @GetMapping("/{eventId}/requests")
    public List<Map<String, Object>> getRequests(@PathVariable Long eventId) {
        return eventService.getEventRequests(eventId);
    }

    //  Approve volunteer request
    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        requestService.updateRequestStatus(id, "APPROVED");
        return ResponseEntity.ok("Request approved");
    }

    //  Reject volunteer request
    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<String> rejectRequest(@PathVariable Long requestId) {
        requestService.updateRequestStatus(requestId, "REJECTED");
        return ResponseEntity.ok("Request rejected & volunteer notified");
    }

    //  Filter Events by location & category
    @GetMapping("/filter")
    public ResponseEntity<List<Event>> filterEvents(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category
    ) {
        List<Event> events = eventService.filterEvents(location, category);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{eventId}/status/{volunteerId}")
    public ResponseEntity<String> getStatus(
            @PathVariable Long eventId,
            @PathVariable Long volunteerId) {

        String status = requestService.getRequestStatus(volunteerId, eventId);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/volunteer/requests/{volunteerId}")
    public List<VolunteerRequestDTO> getVolunteerRequests(@PathVariable Long volunteerId) {
        return requestService.getRequestsByVolunteer(volunteerId);
    }

    @PutMapping("/{eventId}/close-registration")
    public String closeRegistration(@PathVariable Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setRegistrationOpen(false);
        eventRepository.save(event);

        return "Registration closed";
    }

    @PutMapping("/{eventId}/open-registration")
    public String openRegistration(@PathVariable Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setRegistrationOpen(true);
        eventRepository.save(event);

        return "Registration opened";
    }



    @DeleteMapping("/{eventId}/cancel/{volunteerId}")
    public ResponseEntity<?> cancelEvent(@PathVariable Long eventId, @PathVariable Long volunteerId) {
        try {
            requestService.cancelEvent(eventId, volunteerId);
            return ResponseEntity.ok().body("Event cancelled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/event-volunteers")
    public List<EventVolunteerDTO> getEventVolunteerCounts() {
        return eventRepository.getEventVolunteerCounts();
    }

}