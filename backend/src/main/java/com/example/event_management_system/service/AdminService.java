package com.example.event_management_system.service;

import com.example.event_management_system.dto.AdminFeedbackDTO;
import com.example.event_management_system.entity.Admin;
import com.example.event_management_system.repository.AdminRepository;
import com.example.event_management_system.repository.FeedbackRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final FeedbackRepository feedbackRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AdminService(AdminRepository adminRepository , FeedbackRepository feedbackRepository) {

        this.adminRepository = adminRepository;
        this.feedbackRepository = feedbackRepository;
    }
    public boolean validateAdmin(String email, String rawPassword) {
        return adminRepository.findByEmail(email)
                .filter(admin -> encoder.matches(rawPassword, admin.getPassword()))
                .isPresent();
    }


        public List<AdminFeedbackDTO> getAllFeedback() {
            return feedbackRepository.getAllFeedbackForAdmin();
        }


}

