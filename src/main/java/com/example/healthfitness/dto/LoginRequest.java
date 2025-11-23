package com.example.healthfitness.dto;

public class LoginRequest {
    // Changed from username to email
    private String email;
    private String password;

    // Getters and Setters for email
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Getters and Setters for password remain the same
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}