package com.example.event_management_system.service;

import com.example.event_management_system.entity.Participation;
import com.example.event_management_system.repository.ParticipationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipationService {

    private final ParticipationRepository participationRepository;

    public ParticipationService(ParticipationRepository participationRepository) {
        this.participationRepository = participationRepository;
    }

    // Get participation by volunteer
    public List<Participation> getByVolunteer(Long volunteerId) {
        return participationRepository.findByVolunteerId(volunteerId);
    }

    public Participation assignTask(Long participationId, String work) {

        Participation participation =
                participationRepository.findById(participationId)
                        .orElseThrow(() -> new RuntimeException("Participation not found"));

        participation.setAssignedWork(work);
        participation.setStatus("ASSIGNED");

        return participationRepository.save(participation);
    }
}