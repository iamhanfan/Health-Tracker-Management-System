package com.example.healthfitness.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class CycleMetric {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    private LocalDate date;
    private Integer periodLength;
    private Integer cycleVariation;
    private Integer cycleLength;

    // No-arg constructor, getters, and setters
    public CycleMetric() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Integer getPeriodLength() { return periodLength; }
    public void setPeriodLength(Integer periodLength) { this.periodLength = periodLength; }
    public Integer getCycleVariation() { return cycleVariation; }
    public void setCycleVariation(Integer cycleVariation) { this.cycleVariation = cycleVariation; }
    public Integer getCycleLength() { return cycleLength; }
    public void setCycleLength(Integer cycleLength) { this.cycleLength = cycleLength; }
}