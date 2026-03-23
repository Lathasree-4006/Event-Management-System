package com.example.event_management_system.controller;

import com.example.event_management_system.dto.EventHistoryDTO;
import com.example.event_management_system.entity.Event;
import com.example.event_management_system.entity.Participation;
import com.example.event_management_system.entity.Volunteer;
import com.example.event_management_system.repository.ParticipationRepository;
import com.example.event_management_system.repository.VolunteerRepository;
import com.example.event_management_system.service.VolunteerRequestService;
import jakarta.persistence.Column;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/volunteer")
@CrossOrigin(origins = "*")
public class VolunteerController {

    @Autowired
    private VolunteerRepository volunteerRepository;
    @Autowired
    private VolunteerRequestService volunteerRequestService;
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public String registerVolunteer(
            @RequestPart("volunteer") Volunteer volunteer,
            @RequestPart(value = "certification", required = false) MultipartFile certification
    ) throws IOException {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        if (certification != null && !certification.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + certification.getOriginalFilename();
            certification.transferTo(new File(uploadDir + fileName));
            volunteer.setCertification(uploadDir + fileName);
        }
        volunteer.setStatus("PENDING");
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        volunteer.setPassword(encoder.encode(volunteer.getPassword()));
        volunteerRepository.save(volunteer);

        return "Volunteer registered successfully!";
    }

    @GetMapping("id/{id}")
    public Volunteer getVolunteerById(@PathVariable Long id) {
        return volunteerRepository.findById(id)
                .orElseThrow(null);
    }

    @GetMapping("/email/{email}")
    public Volunteer getVolunteerByEmail(@PathVariable String email) {
        return volunteerRepository.findByEmail(email).orElse(null);
    }


    @PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
    public String updateVolunteer(
            @PathVariable Long id,
            @RequestPart("volunteer") Volunteer updatedVolunteer,
            @RequestPart(value = "profilePic", required = false) MultipartFile profilePic
    ) throws IOException {

        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));

        //  Update fields
        volunteer.setPhone(updatedVolunteer.getPhone());
        volunteer.setCountry(updatedVolunteer.getCountry());
        volunteer.setState(updatedVolunteer.getState());
        volunteer.setDistrict(updatedVolunteer.getDistrict());
        volunteer.setCity(updatedVolunteer.getCity());
        volunteer.setPincode(updatedVolunteer.getPincode());
        volunteer.setFullAddress(updatedVolunteer.getFullAddress());
        volunteer.setLanguagesKnown(updatedVolunteer.getLanguagesKnown());
        volunteer.setAreasOfInterest(updatedVolunteer.getAreasOfInterest());

        //  Save profile picture
        if (profilePic != null && !profilePic.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + profilePic.getOriginalFilename();
            profilePic.transferTo(new File(uploadDir + fileName));
            volunteer.setProfilePic("/uploads/" + fileName);
        }

        volunteerRepository.save(volunteer);
        return "Volunteer updated successfully";
    }

    @GetMapping("/{volunteerId}/events")
    public List<EventHistoryDTO> getVolunteerEvents(@PathVariable Long volunteerId) {
        return volunteerRequestService.getVolunteerEventsWithAssignments(volunteerId);
    }

    @PostMapping("/validation/{id}")
    public ResponseEntity<?> uploadVolunteerValidation(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Volunteer volunteer = volunteerRepository.findById(id).orElse(null);

        if(volunteer == null){
            return ResponseEntity.badRequest().body("Volunteer not found");
        }

        try {

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path uploadPath = Paths.get("uploads");

            if(!Files.exists(uploadPath)){
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            volunteer.setGovernmentIdUrl("uploads/" + fileName);
            volunteer.setValidationStatus("PENDING");

            volunteerRepository.save(volunteer);

            return ResponseEntity.ok("Document uploaded");

        } catch(Exception e){
            return ResponseEntity.badRequest().body("Upload failed");
        }
    }

    @GetMapping("/validation/{id}")
    public ResponseEntity<?> getVolunteerValidation(@PathVariable Long id){

        Volunteer volunteer = volunteerRepository.findById(id).orElse(null);

        if(volunteer == null){
            return ResponseEntity.badRequest().body("Volunteer not found");
        }

        Map<String,Object> data = new HashMap<>();

        data.put("validationStatus", volunteer.getValidationStatus());
        data.put("validationDocument", volunteer.getGovernmentIdUrl());

        return ResponseEntity.ok(data);
    }

}
