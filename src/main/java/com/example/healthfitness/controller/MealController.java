package com.example.healthfitness.controller;

import com.example.healthfitness.model.Meal;
import com.example.healthfitness.model.User;
import com.example.healthfitness.repository.MealRepository;
import com.example.healthfitness.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Retrieves all meals logged by the currently authenticated user.
     * @return A list of Meal objects.
     */
    @GetMapping
    public List<Meal> getAllMealsForUser() {
        User currentUser = getCurrentUser();
        return mealRepository.findByUserId(currentUser.getId());
    }

    /**
     * Creates a new meal entry for the currently authenticated user.
     * The meal data is provided in the request body.
     * @param meal The Meal object to be created.
     * @return The saved Meal object, including its new ID.
     */
    @PostMapping
    public Meal createMeal(@RequestBody Meal meal) {
        User currentUser = getCurrentUser();
        meal.setUser(currentUser); // Associate the meal with the current user
        return mealRepository.save(meal);
    }

    /**
     * Helper method to get the currently authenticated user from the security context.
     * Throws a RuntimeException if the user cannot be found.
     * @return The authenticated User object.
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        return userRepository.findByUsername(currentPrincipalName)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentPrincipalName));
    }
}