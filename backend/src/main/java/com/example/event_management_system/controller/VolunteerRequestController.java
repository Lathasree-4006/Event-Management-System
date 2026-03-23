package com.example.event_management_system.controller;

import com.example.event_management_system.dto.ApplyRequest;
import com.example.event_management_system.dto.ApprovedVolunteerDTO;
import com.example.event_management_system.dto.VolunteerRequestDTO;
import com.example.event_management_system.entity.Event;
import com.example.event_management_system.entity.VolunteerRequest;
import com.example.event_management_system.service.VolunteerRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.event_management_system.repository.EventRepository;
import com.example.event_management_system.repository.VolunteerRequestRepository;
import java.util.List;

@RestController
@RequestMapping("/api/volunteer")
@CrossOrigin
public class VolunteerRequestController {

    private final VolunteerRequestService requestService;
    public VolunteerRequestController(VolunteerRequestService requestService) {

        this.requestService = requestService;
    }

    @Autowired
    private VolunteerRequestRepository requestRepository;

    @Autowired
    private EventRepository eventRepository;
    //  Get my requests
    @GetMapping("/requests/{volunteerId}")
    public List<VolunteerRequestDTO> getMyRequests(@PathVariable Long volunteerId) {
        return requestService.getRequestsByVolunteer(volunteerId);
    }

    //  History
    @GetMapping("/history/{volunteerId}")
    public List<VolunteerRequest> history(@PathVariable Long volunteerId) {
        return requestService.getApprovedHistory(volunteerId);
    }

    @DeleteMapping("/{eventId}/drop/{volunteerId}")
    public void drop(@PathVariable Long eventId,
                     @PathVariable Long volunteerId) {
        requestService.dropEvent(eventId, volunteerId);
    }

    @PutMapping("/approve/{requestId}")
    public String approve(@PathVariable Long requestId) {
        requestService.approveRequest(requestId);
        return "Approved";
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

    @GetMapping("/approved/{eventId}")
    public List<ApprovedVolunteerDTO>
    getApprovedVolunteers(@PathVariable Long eventId) {

        return requestService
                .getApprovedVolunteers(eventId);
    }
}