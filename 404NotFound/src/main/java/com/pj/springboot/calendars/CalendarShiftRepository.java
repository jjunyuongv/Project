package com.pj.springboot.calendars;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface CalendarShiftRepository extends JpaRepository<CalendarShift, String> {
    List<CalendarShift> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}