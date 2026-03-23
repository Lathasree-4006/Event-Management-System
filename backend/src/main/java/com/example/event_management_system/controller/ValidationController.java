package com.example.event_management_system.controller;


import com.example.event_management_system.entity.Organizer;
import com.example.event_management_system.entity.Volunteer;
import com.example.event_management_system.repository.OrganizerRepository;
import com.example.event_management_system.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/validation")
@CrossOrigin(origins = "*")
public class ValidationController {

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private OrganizerRepository organizerRepository;

    @PostMapping("/volunteer/upload/{id}")
    public ResponseEntity<?> uploadVolunteerId(
            @PathVariable Long id,
            @RequestParam String fileUrl) {

        Volunteer v = volunteerRepository.findById(id).orElse(null);

        if(v == null) return ResponseEntity.badRequest().body("Volunteer not found");

        v.setGovernmentIdUrl(fileUrl);
        v.setValidationStatus("PENDING");

        volunteerRepository.save(v);

        return ResponseEntity.ok("ID Uploaded Successfully");
    }


    @PostMapping("/organizer/upload/{id}")
    public ResponseEntity<?> uploadOrganizerId(
            @PathVariable Long id,
            @RequestParam String fileUrl) {

        Organizer o = organizerRepository.findById(id).orElse(null);

        if(o == null) return ResponseEntity.badRequest().body("Organizer not found");

        o.setGovernmentIdUrl(fileUrl);
        o.setValidationStatus("PENDING");

        organizerRepository.save(o);

        return ResponseEntity.ok("ID Uploaded Successfully");
    }
}

