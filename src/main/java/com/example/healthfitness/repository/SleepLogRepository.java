package com.example.healthfitness.repository;

import com.example.healthfitness.model.SleepLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface SleepLogRepository extends JpaRepository<SleepLog, Long> {
    // This is for initial load if no date is selected
    Optional<SleepLog> findFirstByUserIdOrderByDateDesc(Long userId);

    // NEW: This method gets the sleep log for a specific date
    Optional<SleepLog> findByUserIdAndDate(Long userId, LocalDate date);
}