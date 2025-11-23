package com.example.healthfitness.repository;

import com.example.healthfitness.model.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;

public interface WaterLogRepository extends JpaRepository<WaterLog, Long> {
    @Query("SELECT SUM(w.amountMl) FROM WaterLog w WHERE w.user.id = :userId AND w.date = :date")
    Integer sumAmountMlByUserIdAndDate(Long userId, LocalDate date);
}