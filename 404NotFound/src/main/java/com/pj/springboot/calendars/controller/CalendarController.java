package com.pj.springboot.calendars.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pj.springboot.calendars.Event;
import com.pj.springboot.calendars.dto.CalendarDTO;
import com.pj.springboot.calendars.service.CalendarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/calendars")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public List<CalendarDTO> getCalendars(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        if (start == null || end == null) {
            throw new IllegalArgumentException("start/end는 필수입니다.");
        }
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("start가 end 이후일 수 없습니다.");
        }
        return calendarService.findAllByDateRange(start, end);
    }

    // mine=true → "내 일정만" (교대 포함 옵션 제거)
    @GetMapping(params = "mine=true")
    public List<CalendarDTO> getMyCalendars(
            @RequestHeader("X-Employee-Id") Integer employeeId,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("start/end는 필수입니다.");
        }
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("start가 end 이후일 수 없습니다.");
        }
        return calendarService.findMineByDateRange(employeeId, start, end);
    }

    @PostMapping("/events")
    public Event createEvent(@RequestBody CalendarDTO.CreateEventRequest request) {
        return calendarService.createEvent(request);
    }

    @PutMapping("/events/{id}")
    public Event updateEvent(@PathVariable("id") Integer id, @RequestBody CalendarDTO.UpdateEventRequest request) {
        return calendarService.updateEvent(id, request);
    }

    @DeleteMapping("/events/{id}")
    public void deleteEvent(@PathVariable("id") Integer id) {
        calendarService.deleteEvent(id);
    }
}
