package com.pj.springboot.calendars;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "calendars")
@Getter
@Setter
public class CalendarShift {

    @Id
    @Column(name = "shift_id")
    private String shiftId;

    @Column(name = "team_name", nullable = false)
    private String teamName;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "all_day", nullable = false)
    private String allDay;

    @Column(name = "day_type", nullable = false)
    private String dayType;
}