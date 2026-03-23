package com.example.event_management_system.service;

import com.example.event_management_system.entity.Assignment;
import com.example.event_management_system.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository repository;


    public Assignment assignWork(
            Long eventId,
            Long volunteerId,
            String work,
            String status) {

        Assignment a = new Assignment();

        a.setEventId(eventId);
        a.setVolunteerId(volunteerId);
        a.setAssignedWork(work);
        a.setStatus(status);

        return repository.save(a);
    }

    public List<Assignment> getAssignmentsByEvent(Long eventId) {
        return repository.findByEventId(eventId);
    }
}