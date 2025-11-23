package com.example.healthfitness.controller;

import com.example.healthfitness.dto.DashboardSummaryDTO;
import com.example.healthfitness.model.User;
import com.example.healthfitness.model.Workout;
import com.example.healthfitness.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; // Import this
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private UserRepository userRepository;
    @Autowired private WorkoutRepository workoutRepository;
    @Autowired private SleepLogRepository sleepLogRepository;
    @Autowired private WaterLogRepository waterLogRepository;
    @Autowired private CycleMetricRepository cycleMetricRepository;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(
        // Accept a date as a request parameter. It's optional.
        @RequestParam(value = "date", required = false) String dateStr) {
        
        User currentUser = getCurrentUser();
        DashboardSummaryDTO summary = new DashboardSummaryDTO(currentUser);

        // Determine the date to use: the one provided, or today if none is provided.
        LocalDate selectedDate = (dateStr != null && !dateStr.isEmpty())
            ? LocalDate.parse(dateStr)
            : LocalDate.now();

        // --- Fetch data FOR THE SELECTED DATE ---
        List<Workout> dailyWorkouts = workoutRepository.findByUserIdAndDate(currentUser.getId(), selectedDate);
        
        // --- Calculate Aggregated Stats FOR THE SELECTED DATE ---
        summary.totalCaloriesBurnt = dailyWorkouts.stream().mapToInt(w -> w.getCaloriesBurned() != null ? w.getCaloriesBurned() : 0).sum();
        summary.totalDistanceCovered = dailyWorkouts.stream().mapToDouble(w -> w.getDistanceKm() != null ? w.getDistanceKm() : 0.0).sum();
        summary.totalSwimmingDistance = dailyWorkouts.stream().mapToInt(w -> w.getSwimmingDistanceYards() != null ? w.getSwimmingDistanceYards() : 0).sum();
        summary.totalRunningMinutes = dailyWorkouts.stream().filter(w -> "Running".equalsIgnoreCase(w.getType())).mapToInt(w -> w.getDurationMinutes() != null ? w.getDurationMinutes() : 0).sum();
        summary.totalWeightliftingMinutes = dailyWorkouts.stream().filter(w -> "Weightlifting".equalsIgnoreCase(w.getType())).mapToInt(w -> w.getDurationMinutes() != null ? w.getDurationMinutes() : 0).sum();
        
        summary.todaySteps = dailyWorkouts.stream()
            .filter(w -> "Running".equalsIgnoreCase(w.getType()))
            .mapToInt(w -> w.getDurationMinutes() != null ? w.getDurationMinutes() * 150 : 0)
            .sum();

        // --- Calculate Profile Tags based on ALL workouts for context ---
        List<Workout> allWorkouts = workoutRepository.findByUserId(currentUser.getId());
        long totalLiftingMinutes = allWorkouts.stream().filter(w -> "Weightlifting".equalsIgnoreCase(w.getType())).mapToInt(w -> w.getDurationMinutes() != null ? w.getDurationMinutes() : 0).sum();
        summary.profileTag1 = totalLiftingMinutes > 60 ? "Strength Training" : "Cardio Focus";
        summary.profileTag2 = allWorkouts.size() >= 15 ? "Frequent User" : "Casual Activity";

        // --- Fetch Log Data ---
        // Sleep is for the NIGHT BEFORE the selected date.
        summary.latestSleepLog = sleepLogRepository.findByUserIdAndDate(currentUser.getId(), selectedDate.minusDays(1)).orElse(null);
        // Water is for the selected date.
        Integer waterIntake = waterLogRepository.sumAmountMlByUserIdAndDate(currentUser.getId(), selectedDate);
        summary.todayWaterIntake = waterIntake != null ? waterIntake : 0;
        // Cycle metrics are long-term, so we just get the latest one.
        summary.latestCycleMetric = cycleMetricRepository.findFirstByUserIdOrderByDateDesc(currentUser.getId()).orElse(null);
        
        return ResponseEntity.ok(summary);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        return userRepository.findByUsername(currentPrincipalName)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentPrincipalName));
    }
}