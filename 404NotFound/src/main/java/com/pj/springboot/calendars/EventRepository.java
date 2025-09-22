package com.pj.springboot.calendars;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {

    @Query("""
        select e from Event e
        where
          (e.endDate is null and e.startDate between :start and :end)
          or
          (e.endDate is not null and e.startDate <= :end and e.endDate >= :start)
    """)
    List<Event> findOverlapping(@Param("start")LocalDate start, @Param("end")LocalDate end);
}
