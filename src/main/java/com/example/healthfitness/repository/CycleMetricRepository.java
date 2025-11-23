package com.example.healthfitness.repository;

import com.example.healthfitness.model.CycleMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CycleMetricRepository extends JpaRepository<CycleMetric, Long> {
    Optional<CycleMetric> findFirstByUserIdOrderByDateDesc(Long userId);
}