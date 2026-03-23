package com.example.event_management_system.service;

import com.example.event_management_system.dto.ApprovedVolunteerDTO;
import com.example.event_management_system.dto.EventHistoryDTO;
import com.example.event_management_system.dto.VolunteerRequestDTO;
import com.example.event_management_system.entity.*;
import com.example.event_management_system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.event_management_system.repository.ParticipationRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VolunteerRequestService {

    private final VolunteerRequestRepository requestRepository;
    private final EventRepository eventRepository;
    private final OrganizerRepository organizerRepository;
    private final VolunteerRepository volunteerRepository;
    private final ParticipationRepository participationRepository;
    private final NotificationService notificationService;
    private final AssignmentRepository assignmentRepository;
    @Autowired
    private VolunteerRequestRepository volunteerRequestRepository;
    public VolunteerRequestService(VolunteerRequestRepository requestRepository,
                                   EventRepository eventRepository,
                                   OrganizerRepository organizerRepository,
                                   VolunteerRepository volunteerRepository,
                                   NotificationService notificationService,
                                   ParticipationRepository participationRepository,
                                   AssignmentRepository assignmentRepository) {
        this.requestRepository = requestRepository;
        this.eventRepository = eventRepository;
        this.organizerRepository = organizerRepository;
        this.volunteerRepository = volunteerRepository;
        this.notificationService = notificationService;
        this.participationRepository = participationRepository;
        this.assignmentRepository = assignmentRepository;
    }

    //  Apply to event
    public VolunteerRequest applyToEvent(Long eventId, Long volunteerId) {

        if (requestRepository.existsByVolunteerIdAndEventId(volunteerId, eventId)) {
            throw new RuntimeException("Already applied to this event");
        }

        VolunteerRequest request = new VolunteerRequest();
        request.setEventId(eventId);
        request.setVolunteerId(volunteerId);
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now()); // ADD THIS

        VolunteerRequest saved = requestRepository.save(request);

        // Notify organizer
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.isRegistrationOpen()) {
            throw new RuntimeException("Registration is closed for this event");
        }

        Organizer organizer = organizerRepository.findById(event.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        notificationService.notifyVolunteer(
                organizer.getEmail(),
                "New volunteer request for event: " + event.getEventName()
        );

        return saved;
    }

    public void createRequest(Long volunteerId, Long eventId) {

        boolean exists = requestRepository.existsByVolunteerIdAndEventId(volunteerId, eventId);
        if (exists) {
            throw new RuntimeException("You already applied for this event");
        }

        VolunteerRequest request = new VolunteerRequest();
        request.setVolunteerId(volunteerId);
        request.setEventId(eventId);
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now()); //  ADD THIS

        requestRepository.save(request);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Organizer organizer = organizerRepository.findById(event.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        notificationService.notifyVolunteer(
                organizer.getEmail(),
                "New volunteer request for event: " + event.getEventName()
        );
    }

    //  Approve request + notify volunteer
    public void approveRequest(Long requestId) {

        VolunteerRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setStatus("APPROVED");
        requestRepository.save(req);

        //  Get volunteer & event info
        Volunteer volunteer = volunteerRepository.findById(req.getVolunteerId())
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));


        Event event = eventRepository.findById(req.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        Organizer organizer = organizerRepository.findById(event.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        //  Notify volunteer
        notificationService.notifyVolunteer(
                volunteer.getEmail(),
                "Your request for event '" + event.getEventName() + "' was APPROVED."
        );
        event.setVolunteersRequired(event.getVolunteersRequired() - 1);
        event.setVolunteersApproved(event.getVolunteersApproved() + 1);
        eventRepository.save(event);
        Participation p = new Participation();
        p.setEventId(event.getId());
        p.setVolunteerId(volunteer.getId());
        p.setVolunteerName(volunteer.getName());
        p.setOrganizerName(organizer.getName());
        p.setEventName(event.getEventName());
        p.setEventDate(event.getStartDateTime().toLocalDate());
        p.setStatus("ASSIGNED");

        participationRepository.save(p);
    }

    // Approved history
    public List<VolunteerRequest> getApprovedHistory(Long volunteerId) {
        return requestRepository.findByVolunteerId(volunteerId)
                .stream()
                .filter(r -> "APPROVED".equals(r.getStatus()))
                .toList();
    }

    //  Drop event
    public void dropEvent(Long eventId, Long volunteerId) {
        requestRepository.findByVolunteerId(volunteerId)
                .stream()
                .filter(r -> r.getEventId().equals(eventId))
                .findFirst()
                .ifPresent(requestRepository::delete);
    }
    @Transactional
    public void updateRequestStatus(Long requestId, String status) {

        VolunteerRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(status);

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Volunteer volunteer = volunteerRepository.findById(request.getVolunteerId())
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));

        if ("APPROVED".equalsIgnoreCase(status)) {

            if (event.getVolunteersRequired() <= 0) {
                throw new RuntimeException("No more volunteers required");
            }

            event.setVolunteersRequired(event.getVolunteersRequired() - 1);
            event.setVolunteersApproved(event.getVolunteersApproved() + 1);
            eventRepository.save(event);

            //  Notify volunteer
            notificationService.notifyVolunteer(
                    volunteer.getEmail(),
                    " Your request for '" + event.getEventName() + "' was APPROVED."
            );

        } else if ("REJECTED".equalsIgnoreCase(status)) {

            //  Notify volunteer
            notificationService.notifyVolunteer(
                    volunteer.getEmail(),
                    " Your request for '" + event.getEventName() + "' was REJECTED."
            );
        }

        requestRepository.save(request);
    }

    public String getRequestStatus(Long volunteerId, Long eventId) {
        return requestRepository
                .findByVolunteerIdAndEventId(volunteerId, eventId)
                .map(VolunteerRequest::getStatus)
                .orElse("NOT_REQUESTED");
    }


    public List<VolunteerRequestDTO> getRequestsByVolunteer(Long volunteerId) {

        List<VolunteerRequest> requests =
                requestRepository.findByVolunteerId(volunteerId);

        return requests.stream().map(req -> {

            // Fetch Event
            Event event = eventRepository.findById(req.getEventId())
                    .orElse(null);

            if (event == null) return null;

            //  Fetch Organizer
            Organizer organizer = organizerRepository
                    .findById(event.getOrganizerId())
                    .orElse(null);

            String organizerName = organizer != null
                    ? organizer.getName()
                    : "Unknown";

            return new VolunteerRequestDTO(
                    req.getId(),
                    event.getEventName(),      // from Event table
                    event.getLocation(),       // from Event table
                    event.getStartDateTime(),  // from Event table
                    organizerName,             // from Organizer table
                    req.getStatus(),
                    req.getRequestedAt()
            );

        }).filter(Objects::nonNull).toList();
    }

    public List<ApprovedVolunteerDTO>
    getApprovedVolunteers(Long eventId) {

        List<VolunteerRequest> approved =
                requestRepository.findByEventIdAndStatus(
                        eventId,
                        "APPROVED"
                );

        return approved.stream().map(req -> {

            Volunteer v =
                    volunteerRepository
                            .findById(req.getVolunteerId())
                            .orElse(null);

            if (v == null) return null;

            return new ApprovedVolunteerDTO(
                    v.getId(),
                    v.getName(),
                    v.getEmail()
            );

        }).filter(Objects::nonNull).toList();
    }

    // Drop event + notify organizer
    @Transactional
    public void cancelEvent(Long eventId, Long volunteerId) {

        VolunteerRequest request = requestRepository
                .findByVolunteerIdAndEventId(volunteerId, eventId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));

        Organizer organizer = organizerRepository.findById(event.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        if (event.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot cancel. Event already started.");
        }

        //  Update status instead of delete
        request.setStatus("CANCELLED");
        requestRepository.save(request);

        //  Update event slots safely
        event.setVolunteersRequired(event.getVolunteersRequired() + 1);
        event.setVolunteersApproved(event.getVolunteersApproved() - 1);
        eventRepository.save(event);

        //  Notify organizer
        notificationService.notifyVolunteer(
                organizer.getEmail(),
                "Volunteer '" + volunteer.getName() +
                        "' has cancelled participation in event '" +
                        event.getEventName() + "'."
        );

        //  Notify volunteer
        notificationService.notifyVolunteer(
                volunteer.getEmail(),
                "You have successfully cancelled participation in event '" +
                        event.getEventName() + "'."
        );
    }

    public List<Event> getEventsForVolunteer(Long volunteerId) {
        // Fetch all VolunteerRequest entries for this volunteer
        List<VolunteerRequest> requests = requestRepository.findByVolunteerId(volunteerId);

        // Map to Event objects, skip if event not found
        return requests.stream()
                .map(req -> eventRepository.findById(req.getEventId()))
                .filter(Optional::isPresent)   // skip missing events
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    public List<EventHistoryDTO> getVolunteerEventsWithAssignments(Long volunteerId) {
        List<Event> events = eventRepository.findEventsForVolunteer(volunteerId);
        List<EventHistoryDTO> dtos = new ArrayList<>();

        for (Event event : events) {
            EventHistoryDTO dto = new EventHistoryDTO();
            dto.setEventId(event.getId());
            dto.setEventName(event.getEventName());
            dto.setLocation(event.getLocation());
            dto.setStartDateTime(event.getStartDateTime());
            dto.setEndDateTime(event.getEndDateTime());

            Assignment assignment = assignmentRepository.findByEventIdAndVolunteerId(event.getId(), volunteerId);
            if (assignment != null) {
                dto.setAssignedWork(assignment.getAssignedWork());
            }
            VolunteerRequest request =
                    requestRepository.findByVolunteerIdAndEventId(volunteerId, event.getId())
                            .orElse(null);

            if (request != null) {
                dto.setStatus(request.getStatus());
            }

            dtos.add(dto);
        }

        return dtos;
    }



}