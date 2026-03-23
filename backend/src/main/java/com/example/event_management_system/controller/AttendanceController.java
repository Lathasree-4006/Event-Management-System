package com.example.event_management_system.controller;

import com.example.event_management_system.entity.Attendance;
import com.example.event_management_system.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    // Save / Update Attendance
    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(@RequestBody Attendance attendanceData) {

        Attendance attendance = attendanceRepository
                .findByEventIdAndVolunteerId(
                        attendanceData.getEventId(),
                        attendanceData.getVolunteerId());

        if (attendance == null) {
            attendance = new Attendance();
            attendance.setEventId(attendanceData.getEventId());
            attendance.setVolunteerId(attendanceData.getVolunteerId());
        }

        attendance.setHoursAttended(attendanceData.getHoursAttended());
        attendance.setAttendancePercentage(attendanceData.getAttendancePercentage());
        attendance.setStatus(attendanceData.getStatus());

        attendanceRepository.save(attendance);

        return ResponseEntity.ok("Attendance saved successfully");
    }

    // Get by event
    @GetMapping("/event/{eventId}")
    public List<Attendance> getByEvent(@PathVariable Long eventId) {
        return attendanceRepository.findByEventId(eventId);
    }

    // Get by volunteer
    @GetMapping("/volunteer/{volunteerId}")
    public List<Attendance> getByVolunteer(@PathVariable Long volunteerId) {
        return attendanceRepository.findByVolunteerId(volunteerId);
    }
}