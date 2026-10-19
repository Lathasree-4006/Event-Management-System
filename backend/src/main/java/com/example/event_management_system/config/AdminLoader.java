package com.example.event_management_system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.example.event_management_system.entity.Admin;
import com.example.event_management_system.repository.AdminRepository;

@Component
public class AdminLoader implements CommandLineRunner {

    private final AdminRepository adminRepository;

    public AdminLoader(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = System.getenv("ADMIN_EMAIL");
        if (adminRepository.findByEmail(adminEmail).isEmpty()) {
            String rawPassword = System.getenv("ADMIN_PASSWORD");
            String hashedPassword = new BCryptPasswordEncoder().encode(rawPassword);
            Admin admin = new Admin();
            admin.setEmail(adminEmail);
            admin.setPassword(hashedPassword);
            adminRepository.save(admin);
            System.out.println("Admin created with hashed password!");
        }
    }
}

