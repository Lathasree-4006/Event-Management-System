package com.example.event_management_system.controller;

import com.example.event_management_system.dto.AdminFeedbackDTO;
import com.example.event_management_system.dto.EventVolunteerDTO;
import com.example.event_management_system.entity.*;
import com.example.event_management_system.repository.*;
import com.example.event_management_system.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private OrganizerRepository organizerRepository;

    @Autowired
    private AttendanceRepository  attendanceRepository;

    @Autowired
    private EventRepository  eventRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AdminService adminService;

    @Autowired
    private OrganizerRewardRepository rewardRepository;

    // Get all volunteers
    @GetMapping("/volunteers/all")
    public List<Volunteer> getAllVolunteers() {
        return volunteerRepository.findAll();
    }

    // Get all organizers
    @GetMapping("/organizers/all")
    public List<Organizer> getAllOrganizers() {
        return organizerRepository.findAll();
    }

    // Approve volunteer
    @PostMapping("/volunteer/approve/{id}")
    public String approveVolunteer(@PathVariable Long id) {
        Volunteer v = volunteerRepository.findById(id).orElse(null);
        if (v == null) return "Volunteer not found";
        v.setStatus("approved");
        volunteerRepository.save(v);
        return "Volunteer approved";
    }

    // Reject volunteer
    @PostMapping("/volunteer/reject/{id}")
    public String rejectVolunteer(@PathVariable Long id) {
        Volunteer v = volunteerRepository.findById(id).orElse(null);
        if (v == null) return "Volunteer not found";
        v.setStatus("rejected");
        volunteerRepository.save(v);
        return "Volunteer rejected";
    }

    // Approve organizer
    @PostMapping("/organizer/approve/{id}")
    public String approveOrganizer(@PathVariable Long id) {
        Organizer o = organizerRepository.findById(id).orElse(null);
        if (o == null) return "Organizer not found";
        o.setStatus("approved");
        organizerRepository.save(o);
        return "Organizer approved";
    }

    // Reject organizer
    @PostMapping("/organizer/reject/{id}")
    public String rejectOrganizer(@PathVariable Long id) {
        Organizer o = organizerRepository.findById(id).orElse(null);
        if (o == null) return "Organizer not found";
        o.setStatus("rejected");
        organizerRepository.save(o);
        return "Organizer rejected";
    }

    @GetMapping("/certificate/pending")
    public ResponseEntity<?> getCertificates() {
        return ResponseEntity.ok(attendanceRepository.getAllCertificates());
    }

    @PostMapping("/certificate/approve/{eventId}/{volunteerId}")
    public ResponseEntity<?> approveCertificate(
            @PathVariable Long eventId,
            @PathVariable Long volunteerId) {

        Attendance attendance = attendanceRepository
                .findByEventIdAndVolunteerId(eventId, volunteerId);

        if (attendance == null) {
            return ResponseEntity.badRequest().body("Attendance not found");
        }

        Event event = eventRepository.findById(eventId).orElse(null);

        if (event == null) {
            return ResponseEntity.badRequest().body("Event not found");
        }

        // check if event is finished
        if (event.getEndDateTime().isAfter(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body("Certificate can only be approved after the event ends");
        }

        attendance.setCertificateApproved(true);
        attendanceRepository.save(attendance);

        return ResponseEntity.ok("Certificate approved successfully");
    }

    @GetMapping("/event-volunteers")
    public List<EventVolunteerDTO> getEventVolunteerCounts() {
        return eventRepository.getEventVolunteerCounts();
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<AdminFeedbackDTO>> getAllFeedback() {

        List<AdminFeedbackDTO> feedback =
                adminService.getAllFeedback();

        return ResponseEntity.ok(feedback);
    }

    @PostMapping("/rewards/issue")
    public ResponseEntity<?> issueReward(@RequestBody OrganizerReward reward){

        reward.setYear(LocalDate.now().getYear());

        boolean exists = rewardRepository
                .existsByOrganizerNameAndYear(
                        reward.getOrganizerName(),
                        reward.getYear()
                );

        if(exists){
            return ResponseEntity
                    .badRequest()
                    .body("Badge already issued");
        }

        rewardRepository.save(reward);

        return ResponseEntity.ok("Badge issued successfully");

    }

    @GetMapping("/validations/pending")
    public ResponseEntity<?> getPendingValidations(){

        List<Volunteer> volunteers =
                volunteerRepository.findByValidationStatus("PENDING");

        List<Organizer> organizers =
                organizerRepository.findByValidationStatus("PENDING");

        Map<String,Object> data = new HashMap<>();

        data.put("volunteers", volunteers);
        data.put("organizers", organizers);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/validations/approved")
    public ResponseEntity<?> getApprovedValidations() {

        List<Volunteer> volunteers =
                volunteerRepository.findByValidationStatus("APPROVED");

        List<Organizer> organizers =
                organizerRepository.findByValidationStatus("APPROVED");

        Map<String,Object> data = new HashMap<>();

        data.put("volunteers", volunteers);
        data.put("organizers", organizers);

        return ResponseEntity.ok(data);
    }

    @PostMapping("/validation/approve/volunteer/{id}")
    public ResponseEntity<?> approveVolunteerValidation(@PathVariable Long id){

        Volunteer v = volunteerRepository.findById(id).orElse(null);

        if(v == null) return ResponseEntity.badRequest().body("Volunteer not found");

        v.setValidationStatus("APPROVED");

        volunteerRepository.save(v);

        return ResponseEntity.ok("Volunteer Verified");
    }

    @PostMapping("/validation/approve/organizer/{id}")
    public ResponseEntity<?> approveOrganizerValidation(@PathVariable Long id){

        Organizer o = organizerRepository.findById(id).orElse(null);

        if(o == null) return ResponseEntity.badRequest().body("Organizer not found");

        o.setValidationStatus("APPROVED");

        organizerRepository.save(o);

        return ResponseEntity.ok("Organizer Verified");
    }

    @GetMapping("/validations/all")
    public ResponseEntity<?> getAllValidations(){

        List<Volunteer> volunteers =
                volunteerRepository.findByGovernmentIdUrlIsNotNull();

        List<Organizer> organizers =
                organizerRepository.findByGovernmentIdUrlIsNotNull();

        Map<String,Object> data = new HashMap<>();

        data.put("volunteers", volunteers);
        data.put("organizers", organizers);

        return ResponseEntity.ok(data);
    }

}
