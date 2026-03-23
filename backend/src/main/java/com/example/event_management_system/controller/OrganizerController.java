package com.example.event_management_system.controller;

import com.example.event_management_system.entity.Organizer;
import com.example.event_management_system.entity.OrganizerReward;
import com.example.event_management_system.entity.Participation;
import com.example.event_management_system.entity.Volunteer;
import com.example.event_management_system.repository.OrganizerRepository;
import com.example.event_management_system.repository.OrganizerRewardRepository;
import com.example.event_management_system.repository.ParticipationRepository;
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
import java.util.*;

@RestController
@RequestMapping("/api/organizer")

@CrossOrigin(origins = "*")
public class OrganizerController {

    @Autowired
    private OrganizerRepository organizerRepository;
    private ParticipationRepository participationRepository;
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";
    @Autowired
    private OrganizerRewardRepository rewardRepository;

    @PostMapping(value = "/register", consumes = "multipart/form-data")

    public String registerOrganizer(
            @RequestPart("organizer") Organizer organizer,
            @RequestPart("logo") MultipartFile logo,
            @RequestPart("certificate") MultipartFile certificate
    ) throws IOException {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }


        String logoName = UUID.randomUUID() + "_" + logo.getOriginalFilename();
        String certificateName = UUID.randomUUID() + "_" + certificate.getOriginalFilename();


        logo.transferTo(new File(uploadDir + logoName));
        certificate.transferTo(new File(uploadDir + certificateName));


        organizer.setLogo(uploadDir + logoName);
        organizer.setCertificate(uploadDir + certificateName);

        organizer.setStatus("PENDING");


        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        organizer.setPassword(encoder.encode(organizer.getPassword()));

        organizerRepository.save(organizer);

        return "Organizer registration submitted successfully!";
    }
    @PostMapping("/login")
    public String loginOrganizer(@RequestParam String email,
                                 @RequestParam String password) {

        Optional<Organizer> optionalOrganizer = organizerRepository.findByEmail(email);

        if (optionalOrganizer.isEmpty()) {
            return "Organizer not found";
        }

        Organizer organizer = optionalOrganizer.get();

        if (!organizer.getStatus().equals("APPROVED")) {
            return "Account not approved yet";
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        if (!encoder.matches(password, organizer.getPassword())) {
            return "Invalid credentials";
        }

        return "Login successful";
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> getOrganizerById(@PathVariable Long id) {
        Optional<Organizer> organizer = organizerRepository.findById(id);
        return organizer.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @GetMapping("/email/{email}")
    public ResponseEntity<?> getOrganizerByEmail(@PathVariable String email) {
        Optional<Organizer> organizer = organizerRepository.findByEmail(email);

        if (organizer.isPresent()) {
            return ResponseEntity.ok(organizer.get());
        } else {
            return ResponseEntity.status(404).body("Organizer not found");
        }
    }


    @PutMapping("/update/{id}")
    public Organizer updateOrganizer(@PathVariable Long id,
                                     @RequestBody Organizer updated) {

        Organizer org = organizerRepository.findById(id).orElseThrow();

        org.setName(updated.getName());
        org.setPhone(updated.getPhone());
        org.setFullAddress(updated.getFullAddress());
        org.setOrganizationName(updated.getOrganizationName());
        org.setOrganizationType(updated.getOrganizationType());
        org.setRegistrationNumber(updated.getRegistrationNumber());
        org.setPosition(updated.getPosition());
        org.setExperience(updated.getExperience());
        org.setFacebook(updated.getFacebook());
        org.setInstagram(updated.getInstagram());
        org.setLinkedin(updated.getLinkedin());
        org.setVolunteersManaged(updated.getVolunteersManaged());
        org.setWebsite(updated.getWebsite());
        return organizerRepository.save(org);
    }


    @PostMapping("/uploadProfilePic/{id}")
    public String uploadProfilePic(@PathVariable Long id,
                                   @RequestParam("file") MultipartFile file) throws IOException {

        Organizer org = organizerRepository.findById(id).orElseThrow();

        File directory = new File(uploadDir);
        if (!directory.exists()) directory.mkdirs();

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        file.transferTo(new File(uploadDir + fileName));

        org.setLogo(uploadDir + fileName);
        organizerRepository.save(org);

        return "Profile picture updated";
    }

    @PutMapping("/participation/{id}/assign")
    public Participation assignWork(
            @PathVariable Long id,
            @RequestParam String work) {

        Participation p = participationRepository.findById(id)
                .orElseThrow();

        p.setAssignedWork(work);
        return participationRepository.save(p);
    }

    @PutMapping("/participation/{id}/status")
    public Participation updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Participation p = participationRepository.findById(id)
                .orElseThrow();

        p.setStatus(status); // DONE or NOT_DONE
        return participationRepository.save(p);
    }

    @GetMapping("/rewards/{organizerName}")
    public List<OrganizerReward> getOrganizerRewards(@PathVariable String organizerName){
        return rewardRepository.findByOrganizerName(organizerName);
    }

    @PostMapping("/validation/{id}")
    public ResponseEntity<?> uploadValidation(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {

        Organizer organizer = organizerRepository.findById(id).orElse(null);

        if(organizer == null){
            return ResponseEntity.badRequest().body("Organizer not found");
        }

        try{

            String fileName = file.getOriginalFilename();

            Path uploadPath = Paths.get("uploads");

            if(!Files.exists(uploadPath)){
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            organizer.setGovernmentIdUrl(filePath.toString());
            organizer.setValidationStatus("PENDING");

            organizerRepository.save(organizer);

            return ResponseEntity.ok("Document uploaded");

        }catch(Exception e){
            return ResponseEntity.badRequest().body("Upload failed");
        }
    }

    @GetMapping("/validation/{id}")
    public ResponseEntity<?> getValidationStatus(@PathVariable Long id){

        Organizer organizer = organizerRepository.findById(id).orElse(null);

        if(organizer == null){
            return ResponseEntity.badRequest().body("Organizer not found");
        }

        Map<String,Object> data = new HashMap<>();

        data.put("validationStatus", organizer.getValidationStatus());
        data.put("validationDocument", organizer.getGovernmentIdUrl());

        return ResponseEntity.ok(data);
    }
}
