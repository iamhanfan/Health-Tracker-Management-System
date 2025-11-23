package com.example.healthfitness.controller;

import com.example.healthfitness.model.Goal;
import com.example.healthfitness.model.User;
import com.example.healthfitness.repository.GoalRepository;
import com.example.healthfitness.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Retrieves all goals set by the currently authenticated user.
     * @return A list of Goal objects.
     */
    @GetMapping
    public List<Goal> getAllGoalsForUser() {
        User currentUser = getCurrentUser();
        return goalRepository.findByUserId(currentUser.getId());
    }

    /**
     * Creates a new goal for the currently authenticated user.
     * The goal data is provided in the request body.
     * @param goal The Goal object to be created.
     * @return The saved Goal object, including its new ID.
     */
    @PostMapping
    public Goal createGoal(@RequestBody Goal goal) {
        User currentUser = getCurrentUser();
        goal.setUser(currentUser); // Associate the goal with the current user
        return goalRepository.save(goal);
    }

    /**
     * Helper method to get the currently authenticated user from the security context.
     * @return The authenticated User object.
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        return userRepository.findByUsername(currentPrincipalName)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentPrincipalName));
    }
}