package com.pj.springboot.calendars;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    @Transactional
    public Event createEvent(CalendarDTO.CreateEventRequest req) {
        Event e = new Event();
        e.setCrewEmployeeId(req.getCrewEmployeeId());
        e.setTitle(req.getTitle());
        e.setContent(req.getContent() != null ? req.getContent() : "");
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setCategory(req.getCategory());

        return eventRepository.save(e);
    }

    @Transactional
    public Event updateEvent(Integer eventId, CalendarDTO.UpdateEventRequest req) {
        Event e = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (req.getTitle() != null) e.setTitle(req.getTitle());
        if (req.getContent() != null) {
            e.setContent(req.getContent());
        } else if (e.getContent() == null) {
            e.setContent("");
        }
        if (req.getStartDate() != null) e.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) e.setEndDate(req.getEndDate());
        if (req.getCategory() != null) e.setCategory(req.getCategory());

        return eventRepository.save(e);
    }
}