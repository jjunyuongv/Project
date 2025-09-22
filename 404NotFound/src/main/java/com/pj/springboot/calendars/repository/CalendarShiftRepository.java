package com.pj.springboot.calendars.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pj.springboot.calendars.CalendarShift;

import java.time.LocalDateTime;
import java.util.List;

public interface CalendarShiftRepository extends JpaRepository<CalendarShift, String> {
    List<CalendarShift> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}