package com.pj.springboot.calendars.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.pj.springboot.calendars.CalendarShift;
import com.pj.springboot.calendars.Event;
import com.pj.springboot.calendars.NotFoundException;
import com.pj.springboot.calendars.dto.CalendarDTO;
import com.pj.springboot.calendars.repository.CalendarShiftRepository;
import com.pj.springboot.calendars.repository.EventRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarShiftRepository shiftRepository;
    private final EventRepository eventRepository;

    public List<CalendarDTO> findAllByDateRange(LocalDate start, LocalDate end) {
        System.out.println("Finding events between " + start + " and " + end);

        List<CalendarDTO> shifts = shiftRepository
                .findByStartTimeBetween(start.atStartOfDay(), end.plusDays(1).atStartOfDay())
                .stream()
                .map(this::convertShiftToDTO)
                .collect(Collectors.toList());

        List<CalendarDTO> events = eventRepository.findOverlapping(start, end)
                .stream()
                .map(this::convertEventToDTO)
                .collect(Collectors.toList());

        return Stream.concat(shifts.stream(), events.stream()).collect(Collectors.toList());
    }

    // "내 일정만" (교대 미포함)
    public List<CalendarDTO> findMineByDateRange(Integer me, LocalDate start, LocalDate end) {
        if (me == null) {
            throw new IllegalArgumentException("X-Employee-Id(로그인 사용자 식별자)가 필요합니다.");
        }

        return eventRepository.findOverlapping(start, end)
                .stream()
                .filter(e -> e.getCrewEmployeeId() != null && e.getCrewEmployeeId().equals(me))
                .map(this::convertEventToDTO)
                .collect(Collectors.toList());
    }

    public com.pj.springboot.calendars.Event createEvent(CalendarDTO.CreateEventRequest request) {
        Event newEvent = new Event();
        newEvent.setCrewEmployeeId(request.getCrewEmployeeId());
        newEvent.setTitle(request.getTitle());
        newEvent.setContent(request.getContent() != null ? request.getContent() : "");
        newEvent.setStartDate(request.getStartDate());
        newEvent.setEndDate(request.getEndDate());
        newEvent.setCategory(request.getCategory());
        return eventRepository.save(newEvent);
    }

    public Event updateEvent(Integer eventId, CalendarDTO.UpdateEventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("해당 ID의 일정이 없습니다: " + eventId));

        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getContent() != null) event.setContent(request.getContent());
        if (request.getStartDate() != null) event.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) event.setEndDate(request.getEndDate());
        if (request.getCategory() != null) event.setCategory(request.getCategory());

        return eventRepository.save(event);
    }

    public void deleteEvent(Integer eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new NotFoundException("해당 ID의 일정이 없습니다: " + eventId);
        }
        eventRepository.deleteById(eventId);
    }

    private CalendarDTO convertShiftToDTO(CalendarShift shift) {
        if (shift.getStartTime() == null || shift.getEndTime() == null) {
            throw new IllegalStateException("Shift 시간값이 null 입니다: " + shift.getShiftId());
        }
        String dayType = Optional.ofNullable(shift.getDayType()).orElse("교대");

        Map<String, Object> props = new HashMap<>();
        props.put("isShift", true);
        props.put("category", "교대");

        return CalendarDTO.builder()
                .id("shift-" + shift.getShiftId())
                .title(dayType)
                .start(shift.getStartTime())
                .end(shift.getEndTime())
                .backgroundColor(getColorForShift(dayType))
                .borderColor(getColorForShift(dayType))
                .isShift(true)
                .category("교대")
                .allDay(false)
                .extendedProps(props)
                .build();
    }

    private CalendarDTO convertEventToDTO(Event event) {
        LocalDateTime start = event.getStartDate().atStartOfDay();
        LocalDateTime end = (event.getEndDate() != null)
                ? event.getEndDate().plusDays(1).atStartOfDay()
                : start.plusDays(1);

        String displayCategory = mapCategoryForFrontend(event.getCategory());

        Map<String, Object> props = new HashMap<>();
        props.put("category", displayCategory);
        props.put("rawCategory", event.getCategory());
        props.put("content", event.getContent());

        return CalendarDTO.builder()
                .id("event-" + event.getEventId())
                .title(event.getTitle())
                .start(start)
                .end(end)
                .backgroundColor(getColorForEvent(displayCategory))
                .borderColor(getColorForEvent(displayCategory))
                .isShift(false)
                .category(displayCategory)
                .allDay(true)
                .extendedProps(props)
                .build();
    }

    private String mapCategoryForFrontend(String raw) {
        if (raw == null) return "개인일정";
        if ("개인일정".equals(raw) || "비행일정".equals(raw) || "정비일정".equals(raw)
                || "교육일정".equals(raw) || "휴가일정".equals(raw)) {
            return raw;
        }
        return switch (raw) {
            case "TIMEOFF" -> "휴가일정";
            case "SHIFT", "ETC" -> "개인일정";
            default -> "개인일정";
        };
    }

    private String getColorForShift(String dayType) {
        if ("오전".equals(dayType)) return "#42a5f5";
        if ("오후".equals(dayType)) return "#ff7043";
        if ("야간".equals(dayType)) return "#5c6bc0";
        return "#78909c";
    }

    private String getColorForEvent(String category) {
        if ("비행일정".equals(category)) return "#26a69a";
        if ("정비일정".equals(category)) return "#ffb300";
        if ("교육일정".equals(category)) return "#42a5f5";
        if ("개인일정".equals(category)) return "#ef4444";
        if ("휴가일정".equals(category)) return "#5c6bc0";
        return "#ab47bc";
    }
}
