package com.example.event_management_system.controller;

import com.example.event_management_system.entity.Assignment;
import com.example.event_management_system.repository.AssignmentRepository;
import com.example.event_management_system.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignment")
@CrossOrigin
public class AssignmentController {

    @Autowired
    private AssignmentRepository repository;
    @Autowired
    private AssignmentService assignmentService;
    @GetMapping("/event/{eventId}")
    public List<Assignment> getAssignments(
            @PathVariable Long eventId) {

        return repository.findByEventId(eventId);
    }

    @PostMapping("/assign")
    public Assignment assignWork(@RequestBody Assignment request) {

        return assignmentService.assignWork(
                request.getEventId(),
                request.getVolunteerId(),
                request.getAssignedWork(),
                request.getStatus()
        );
    }


}
