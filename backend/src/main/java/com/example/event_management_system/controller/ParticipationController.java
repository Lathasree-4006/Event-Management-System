package com.example.event_management_system.controller;

import com.example.event_management_system.entity.Participation;
import com.example.event_management_system.repository.ParticipationRepository;
import com.example.event_management_system.service.ParticipationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participation")
@CrossOrigin
public class ParticipationController {

    @Autowired
    private ParticipationRepository participationRepository;
    private ParticipationService participationService;

    //  Volunteer → participation history
    @GetMapping("/volunteer/{volunteerId}")
    public List<Participation> getByVolunteer(
            @PathVariable Long volunteerId) {

        return participationRepository
                .findByVolunteerId(volunteerId);
    }

    @PutMapping("/approve/{id}")
    public Participation approveVolunteer(@PathVariable Long id){

        Participation p =
                participationRepository.findById(id).orElseThrow();

        p.setStatus("APPROVED");

        return participationRepository.save(p);
    }

    @GetMapping("/event/{eventId}")
    public List<Participation> getApprovedParticipants(
            @PathVariable Long eventId){

        return participationRepository
                .findByEventIdAndStatus(eventId,"APPROVED");
    }
}