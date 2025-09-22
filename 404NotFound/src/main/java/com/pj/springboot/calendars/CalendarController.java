package com.pj.springboot.calendars;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

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
