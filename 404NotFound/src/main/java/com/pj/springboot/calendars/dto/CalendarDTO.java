package com.pj.springboot.calendars.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class CalendarDTO {
    private String id;
    private String title;
    private LocalDateTime start;
    private LocalDateTime end;

    private String backgroundColor;
    private String borderColor;

    private String category;
    private Boolean allDay;

    @JsonProperty("isShift")
    private boolean isShift;

    private Map<String, Object> extendedProps;

    @Data
    public static class CreateEventRequest {
        private Integer crewEmployeeId;
        private String title;
        private String content;
        private LocalDate startDate;
        private LocalDate endDate;
        private String category;
    }

    @Data
    public static class UpdateEventRequest {
        private String title;
        private String content;
        private LocalDate startDate;
        private LocalDate endDate;
        private String category;
    }
}