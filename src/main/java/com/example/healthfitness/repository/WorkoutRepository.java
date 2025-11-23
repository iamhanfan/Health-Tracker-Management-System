package com.example.healthfitness.repository;

import com.example.healthfitness.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate; // Import LocalDate
import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    // This method gets ALL workouts for a user (for profile tags)
    List<Workout> findByUserId(Long userId);

    // NEW: This method gets workouts for a specific user AND a specific date
    List<Workout> findByUserIdAndDate(Long userId, LocalDate date);
}