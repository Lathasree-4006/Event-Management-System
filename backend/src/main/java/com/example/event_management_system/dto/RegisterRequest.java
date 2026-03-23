package com.example.event_management_system.dto;

public class RegisterRequest {

    private String name;
    private String email;
    private String role;   // Add this
    private String otp;    // Add this

    // Default constructor
    public RegisterRequest() {}

    // Constructor with all fields (optional)
    public RegisterRequest(String name, String email, String role, String otp) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.otp = otp;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }

    public String getOtp() {
        return otp;
    }
    public void setOtp(String otp) {
        this.otp = otp;
    }
}
