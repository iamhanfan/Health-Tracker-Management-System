package com.example.healthfitness.dto;

import com.example.healthfitness.model.CycleMetric;
import com.example.healthfitness.model.SleepLog;
import com.example.healthfitness.model.User;

public class DashboardSummaryDTO {
    // User Profile Information
    public String username;
    public Integer age;
    public String description;
    public String profileImageUrl;
    public String profileTag1; // For "Weight Loss Workouts"
    public String profileTag2; // For "5 times/week"

    // Aggregated Workout & Activity Data
    public int totalCaloriesBurnt;
    public double totalDistanceCovered;
    public int totalSwimmingDistance;
    public int totalWeightliftingMinutes;
    public int totalRunningMinutes;
    public int todaySteps;

    // Latest Log Data
    public int todayWaterIntake;
    public SleepLog latestSleepLog;
    public CycleMetric latestCycleMetric;

    public DashboardSummaryDTO() {}

    public DashboardSummaryDTO(User user) {
        this.username = user.getUsername();
        this.age = user.getAge();
        this.description = user.getDescription();
        this.profileImageUrl = user.getProfileImageUrl();
    }
}