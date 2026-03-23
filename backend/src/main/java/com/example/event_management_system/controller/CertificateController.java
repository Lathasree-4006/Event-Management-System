package com.example.event_management_system.controller;

import com.example.event_management_system.entity.Attendance;
import com.example.event_management_system.entity.Event;
import com.example.event_management_system.entity.Organizer;
import com.example.event_management_system.entity.Volunteer;
import com.example.event_management_system.repository.*;
import com.itextpdf.kernel.pdf.canvas.draw.DottedLine;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;

import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificate")
public class CertificateController {

    @Autowired
    private ParticipationRepository participationRepository;
    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<?> getVolunteerCertificates(@PathVariable Long volunteerId) {

        List<Map<String,Object>> result =
                attendanceRepository.getCertificateEligibleEvents(volunteerId);

        return ResponseEntity.ok(result);
    }

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private OrganizerRepository organizerRepository;


    @GetMapping("/{volunteerId}/{eventId}")
    public ResponseEntity<byte[]> generateCertificate(
            @PathVariable Long volunteerId,
            @PathVariable Long eventId) throws Exception {

        Volunteer volunteer = volunteerRepository.findById(volunteerId).orElseThrow();
        Event event = eventRepository.findById(eventId).orElseThrow();

        Attendance attendance =
                attendanceRepository.findByEventIdAndVolunteerId(eventId, volunteerId);

        if (attendance == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        if (!attendance.isCertificateApproved()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        double percentage = attendance.getAttendancePercentage();

        if (percentage < 75) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(80, 60, 80, 60);

        Rectangle pageSize = pdf.getDefaultPageSize();
        PdfPage page = pdf.addNewPage();
        PdfCanvas canvas = new PdfCanvas(page);

        DeviceRgb gold = new DeviceRgb(212,175,55);

        // OUTER BORDER
        canvas.setStrokeColor(gold)
                .setLineWidth(5)
                .rectangle(30,30,
                        pageSize.getWidth()-60,
                        pageSize.getHeight()-60)
                .stroke();

        // INNER BORDER
        canvas.setStrokeColor(gold)
                .setLineWidth(2)
                .rectangle(40,40,
                        pageSize.getWidth()-80,
                        pageSize.getHeight()-80)
                .stroke();


        /* -------------------- HEADER SECTION -------------------- */

        Image leftLogo =
                new Image(ImageDataFactory.create("src/main/resources/static/logo.png"))
                        .scaleToFit(90,90);
        Organizer organizer = organizerRepository
                .findById(event.getOrganizerId())
                .orElseThrow();
        String logoPath = organizer.getLogo();

        Image rightLogo = new Image(
                ImageDataFactory.create(logoPath)
        ).scaleToFit(90,90);

        Table headerTable = new Table(new float[]{1,2,1}).useAllAvailableWidth();

        Paragraph certTitle =
                new Paragraph("Certificate of Participation")
                        .setFontSize(22)
                        .setBold()
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(new DeviceRgb(212,175,55));

        headerTable.addCell(new Cell()
                .add(leftLogo)
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.LEFT));

        headerTable.addCell(new Cell()
                .add(certTitle)
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(com.itextpdf.layout.properties.VerticalAlignment.MIDDLE));

        headerTable.addCell(new Cell()
                .add(rightLogo)
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT));

        document.add(headerTable);

        document.add(new Paragraph("\n"));





        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd-MM-yyyy  hh:mm a");

        String startDate =
                event.getStartDateTime().format(formatter);

        String endDate =
                event.getEndDateTime().format(formatter);


        /* -------------------- CONTENT TEXT -------------------- */

        Paragraph line1 =
                new Paragraph("This certificate is proudly presented to")
                        .setFontSize(14)
                        .setTextAlignment(TextAlignment.CENTER);

        Paragraph name =
                new Paragraph(volunteer.getName())
                        .setFontSize(20)
                        .setBold()
                        .setTextAlignment(TextAlignment.CENTER);

        Paragraph line2 =
                new Paragraph("for active participation in the community service event")
                        .setFontSize(14)
                        .setTextAlignment(TextAlignment.CENTER);

        Paragraph line3 =
                new Paragraph(event.getEventName())
                        .setFontSize(18)
                        .setBold()
                        .setTextAlignment(TextAlignment.CENTER);

        Paragraph line4 =
                new Paragraph("held from " + startDate + " to " + endDate + " at " + event.getLocation())
                        .setFontSize(14)
                        .setTextAlignment(TextAlignment.CENTER);

        Paragraph line5 =
                new Paragraph("in recognition of their valuable contribution, dedication, and commitment towards the successful completion of the event.Your willingness to volunteer your time and effort" +
                        "has significantly contributed to making this event a great success.We sincerely appreciate your enthusiasm, teamwork, and community spirit.")
                        .setFontSize(14)
                        .setTextAlignment(TextAlignment.JUSTIFIED);


        document.add(line1);
        document.add(new Paragraph("\n"));

        document.add(name);
        document.add(new Paragraph("\n"));

        document.add(line2);
        document.add(new Paragraph("\n"));

        document.add(line3);
        document.add(new Paragraph("\n"));

        document.add(line4);

        document.add(new Paragraph("\n"));

        document.add(line5);

        Table signTable = new Table(1).useAllAvailableWidth();

        Cell signCell = new Cell()

                .add(new Paragraph("\n\n"))
                .add(new LineSeparator(new SolidLine())
                        .setWidth(150)
                        .setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER))
                .add(new Paragraph("\n"))
                .add(new Paragraph("Conducted By")
                        .setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph(event.getOrganizerName())
                        .setTextAlignment(TextAlignment.CENTER))

                .add(new Paragraph(event.getOrganizationName())
                        .setFontSize(11).setTextAlignment(TextAlignment.CENTER))

                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(Border.NO_BORDER);

        signTable.addCell(signCell);

        document.add(signTable);

        document.close();


        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=certificate.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(out.toByteArray());
    }
}