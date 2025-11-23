package com.example.healthfitness.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class SleepLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    private LocalDate date;
    private Double totalHoursSleep;
    private Double timeInBed;
    private Integer restfulnessPercentage;
    private Integer restingHeartRate;

    // No-arg constructor, getters, and setters
    public SleepLog() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Double getTotalHoursSleep() { return totalHoursSleep; }
    public void setTotalHoursSleep(Double totalHoursSleep) { this.totalHoursSleep = totalHoursSleep; }
    public Double getTimeInBed() { return timeInBed; }
    public void setTimeInBed(Double timeInBed) { this.timeInBed = timeInBed; }
    public Integer getRestfulnessPercentage() { return restfulnessPercentage; }
    public void setRestfulnessPercentage(Integer restfulnessPercentage) { this.restfulnessPercentage = restfulnessPercentage; }
    public Integer getRestingHeartRate() { return restingHeartRate; }
    public void setRestingHeartRate(Integer restingHeartRate) { this.restingHeartRate = restingHeartRate; }
}