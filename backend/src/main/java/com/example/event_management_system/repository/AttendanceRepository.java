package com.example.event_management_system.repository;
import com.example.event_management_system.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEventId(Long eventId);

    List<Attendance> findByVolunteerId(Long volunteerId);

    Attendance findByEventIdAndVolunteerId(Long eventId, Long volunteerId);


    @Query("""
SELECT new map(
e.id as eventId,
e.eventName as eventName,
e.location as location,
e.startDateTime as startDateTime,
e.endDateTime as endDateTime,
a.hoursAttended as hoursAttended,
a.attendancePercentage as attendancePercentage,
a.certificateApproved as certificateApproved
)
FROM Attendance a
JOIN Event e ON a.eventId = e.id
WHERE a.volunteerId = :volunteerId
""")
    List<Map<String,Object>> getCertificateEligibleEvents(Long volunteerId);
    @Query(value = """
SELECT 
a.event_id as eventId,
a.volunteer_id as volunteerId,
v.name as volunteerName,
e.event_name as eventName,
a.hours_attended as hoursAttended,
a.attendance_percentage as attendancePercentage,
a.certificate_approved as certificateApproved
FROM attendance a
JOIN volunteer v ON a.volunteer_id = v.id
JOIN event e ON a.event_id = e.id
WHERE a.status = 'Present'
""", nativeQuery = true)
    List<Map<String,Object>> getAllCertificates();
}
