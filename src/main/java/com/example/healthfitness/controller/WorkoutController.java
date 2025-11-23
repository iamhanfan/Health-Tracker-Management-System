package com.example.healthfitness.controller;

import com.example.healthfitness.model.User;
import com.example.healthfitness.model.Workout;
import com.example.healthfitness.repository.UserRepository;
import com.example.healthfitness.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Workout> getAllWorkoutsForUser() {
        User currentUser = getCurrentUser();
        return workoutRepository.findByUserId(currentUser.getId());
    }

    @PostMapping
    public Workout createWorkout(@RequestBody Workout workout) {
        User currentUser = getCurrentUser();
        workout.setUser(currentUser);
        return workoutRepository.save(workout);
    }
    
    // Helper method to get the current user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        return userRepository.findByUsername(currentPrincipalName)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentPrincipalName));
    }
}