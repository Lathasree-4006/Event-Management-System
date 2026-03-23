package com.example.event_management_system.controller;

import com.example.event_management_system.dto.LoginRequest;
import com.example.event_management_system.dto.RegisterRequest;
import com.example.event_management_system.entity.Admin;
import com.example.event_management_system.entity.OtpVerification;
import com.example.event_management_system.repository.OtpRepository;
import com.example.event_management_system.utils.EmailUtil;
import com.example.event_management_system.utils.OtpGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.event_management_system.entity.Organizer;
import com.example.event_management_system.repository.OrganizerRepository;
import com.example.event_management_system.repository.AdminRepository;
import org.springframework.web.multipart.MultipartFile;
import com.example.event_management_system.repository.UserRepository;
import com.example.event_management_system.repository.VolunteerRepository;
import com.example.event_management_system.entity.Volunteer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private EmailUtil emailUtil;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private OtpGenerator otpGenerator;

    @Autowired
    private OrganizerRepository organizerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private AdminRepository adminRepository;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    // STEP 1: Register & send OTP
    @PostMapping("/register")
    @Transactional
    public String register(@RequestBody RegisterRequest request) {
        String email = request.getEmail();
        boolean existsInUsers = userRepository.findByEmail(email).isPresent();
        if (existsInUsers) {
            return "Provided Email is already existed";
        }

        String otp = otpGenerator.generateOtp();

        // Delete old OTP directly
        otpRepository.deleteByEmail(request.getEmail());

        OtpVerification otpEntity = new OtpVerification();
        otpEntity.setEmail(request.getEmail());
        otpEntity.setOtp(otp);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpEntity.setAttempts(0);

        otpRepository.save(otpEntity);

        emailUtil.sendOtpEmail(request.getEmail(), otp);

        return "OTP sent successfully to " + request.getEmail();
    }

    // STEP 2: Verify OTP
    @PostMapping("/verify-otp")
    @Transactional
    public String verifyOtp(@RequestBody RegisterRequest request) {
        String email = request.getEmail();
        String otp = request.getOtp();
        String name = request.getName();
        String role = request.getRole();
        OtpVerification savedOtp = otpRepository
                .findByEmail(email)
                .orElse(null);

        if (savedOtp == null)
            return "OTP not found";

        // Check expiry
        if (LocalDateTime.now().isAfter(savedOtp.getExpiryTime())) {
            otpRepository.delete(savedOtp);
            return "OTP expired";
        }

        // Check incorrect OTP
        if (!savedOtp.getOtp().equals(otp)) {

            savedOtp.setAttempts(savedOtp.getAttempts() + 1);
            otpRepository.save(savedOtp);

            if (savedOtp.getAttempts() >= 3) {
                otpRepository.delete(savedOtp);
                return "Too many attempts. OTP deleted.";
            }

            return "Invalid OTP";
        }

        // If correct OTP
        otpRepository.delete(savedOtp);
        if (userRepository.findByEmail(email).isPresent()) {
            return "User already registered";
        }
        com.example.event_management_system.entity.User newUser = new com.example.event_management_system.entity.User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setRole(role);
        userRepository.save(newUser);
        return "OTP verified successfully";
    }
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";
    public String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        return fileName;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        String email = request.getEmail();
        String password = request.getPassword();

        // 1. Check if admin
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (encoder.matches(password, admin.getPassword())) {
                return ResponseEntity.ok(Map.of("role", "admin", "name", "Admin"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }
        }

        // 2. Check if organizer
        Optional<Organizer> organizerOpt = organizerRepository.findByEmail(email);
        if (organizerOpt.isPresent()) {
            Organizer organizer = organizerOpt.get();

            if (!"approved".equalsIgnoreCase(organizer.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your organizer account is not approved yet.");
            }

            if (encoder.matches(password, organizer.getPassword())) {
                return ResponseEntity.ok(
                        Map.of(
                                "role", "organizer",
                                "name", organizer.getName(),
                                "status", organizer.getStatus()
                        ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }
        }

        // 3. Check if volunteer
        Optional<Volunteer> volunteerOpt = volunteerRepository.findByEmail(email);
        if (volunteerOpt.isPresent()) {
            Volunteer volunteer = volunteerOpt.get();

            if (!"approved".equalsIgnoreCase(volunteer.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your account is not approved by admin yet.");
            }

            if (encoder.matches(password, volunteer.getPassword())) {
                return ResponseEntity.ok(
                        Map.of(
                                "role", "volunteer",
                                "name", volunteer.getName(),
                                "status", volunteer.getStatus()
                        ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
    private ResponseEntity<?> sendResetLink(String email, String role) {
        String token = UUID.randomUUID().toString();
        String resetLink = "http://localhost:5173/ResetPassword/" + token;

        switch (role) {
            case "admin":
                Admin admin = adminRepository.findByEmail(email).get();
                admin.setResetToken(token);
                adminRepository.save(admin);
                break;
            case "organizer":
                Organizer org = organizerRepository.findByEmail(email).get();
                org.setResetToken(token);
                organizerRepository.save(org);
                break;
            case "volunteer":
                Volunteer vol = volunteerRepository.findByEmail(email).get();
                vol.setResetToken(token);
                volunteerRepository.save(vol);
                break;
        }

        emailUtil.sendEmail(email, "Reset Password", "Click here to reset: " + resetLink);

        return ResponseEntity.ok("Reset link sent to email");
    }

    @GetMapping("/test")
    public String test() {
        return "React connected to Spring Boot successfully!";
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // Check Admin
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            return sendResetLink(email, "admin");
        }

        // Check Organizer
        Optional<Organizer> orgOpt = organizerRepository.findByEmail(email);
        if (orgOpt.isPresent()) {
            return sendResetLink(email, "organizer");
        }

        // Check Volunteer
        Optional<Volunteer> volOpt = volunteerRepository.findByEmail(email);
        if (volOpt.isPresent()) {
            return sendResetLink(email, "volunteer");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found");
    }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req) {
        String token = req.get("token");
        String newPassword = req.get("password");

        // Admin
        Optional<Admin> adminOpt = adminRepository.findByResetToken(token);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            admin.setPassword(encoder.encode(newPassword));
            admin.setResetToken(null);
            adminRepository.save(admin);
            return ResponseEntity.ok("Password updated successfully");
        }

        // Organizer
        Optional<Organizer> orgOpt = organizerRepository.findByResetToken(token);
        if (orgOpt.isPresent()) {
            Organizer org = orgOpt.get();
            org.setPassword(encoder.encode(newPassword));
            org.setResetToken(null);
            organizerRepository.save(org);
            return ResponseEntity.ok("Password updated successfully");
        }

        // Volunteer
        Optional<Volunteer> volOpt = volunteerRepository.findByResetToken(token);
        if (volOpt.isPresent()) {
            Volunteer vol = volOpt.get();
            vol.setPassword(encoder.encode(newPassword));
            vol.setResetToken(null);
            volunteerRepository.save(vol);
            return ResponseEntity.ok("Password updated successfully");
        }

        return ResponseEntity.badRequest().body("Invalid or expired token");
    }

}
