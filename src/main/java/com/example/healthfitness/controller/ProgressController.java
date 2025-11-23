package com.example.healthfitness.controller;

import com.example.healthfitness.model.Progress;
import com.example.healthfitness.model.User;
import com.example.healthfitness.repository.ProgressRepository;
import com.example.healthfitness.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Retrieves all progress records for the currently authenticated user.
     * @return A list of Progress objects.
     */
    @GetMapping
    public List<Progress> getAllProgressForUser() {
        User currentUser = getCurrentUser();
        return progressRepository.findByUserId(currentUser.getId());
    }

    /**
     * Creates a new progress entry for the currently authenticated user.
     * The progress data is provided in the request body.
     * @param progress The Progress object to be created.
     * @return The saved Progress object, including its new ID.
     */
    @PostMapping
    public Progress createProgress(@RequestBody Progress progress) {
        User currentUser = getCurrentUser();
        progress.setUser(currentUser); // Associate the progress record with the current user
        return progressRepository.save(progress);
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