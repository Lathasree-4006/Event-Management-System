package com.example.event_management_system.controller;
import com.example.event_management_system.entity.Event;
import com.example.event_management_system.entity.Feedback;
import com.example.event_management_system.entity.Volunteer;
import com.example.event_management_system.repository.EventRepository;
import com.example.event_management_system.repository.FeedbackRepository;
import com.example.event_management_system.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(@RequestBody Feedback feedback){

        Event event = eventRepository.findById(feedback.getEventId()).orElse(null);

        if(event == null){
            return ResponseEntity.badRequest().body("Event not found");
        }

        if(event.getEndDateTime().isAfter(java.time.LocalDateTime.now())){
            return ResponseEntity.badRequest()
                    .body("Feedback allowed only after event ends");
        }

        // check if feedback already exists
        Feedback existing = feedbackRepository
                .findByEventIdAndVolunteerId(feedback.getEventId(), feedback.getVolunteerId());

        if(existing != null){

            // UPDATE feedback
            existing.setRating(feedback.getRating());
            existing.setMessage(feedback.getMessage());

            feedbackRepository.save(existing);

            return ResponseEntity.ok("Feedback updated successfully");
        }

        // fetch volunteer info
        Volunteer volunteer = volunteerRepository
                .findById(feedback.getVolunteerId())
                .orElse(null);

        if(volunteer != null){
            feedback.setVolunteerName(volunteer.getName());
            feedback.setEmail(volunteer.getEmail());
        }

        // SAVE new feedback
        feedbackRepository.save(feedback);

        return ResponseEntity.ok("Feedback submitted successfully");
    }

    @GetMapping("/organizer")
    public List<Map<String,Object>> getFeedback(){
        return feedbackRepository.getAllFeedback();
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Feedback>> getFeedbackByEvent(@PathVariable Long eventId) {
        List<Feedback> feedbacks = feedbackRepository.findByEventId(eventId);
        if(feedbacks.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/event/{eventId}/volunteer/{volunteerId}")
    public ResponseEntity<Feedback> getVolunteerFeedback(
            @PathVariable Long eventId,
            @PathVariable Long volunteerId) {

        Feedback feedback =
                feedbackRepository.findByEventIdAndVolunteerId(eventId, volunteerId);

        if (feedback == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(feedback);
    }

}