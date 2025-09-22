package com.pj.springboot.calendars.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pj.springboot.calendars.Event;

import java.time.LocalDate;
import java.util.List;
// ★ 추가
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Integer> {

    @Query("""
        select e from Event e
        where
          (e.endDate is null and e.startDate between :start and :end)
          or
          (e.endDate is not null and e.startDate <= :end and e.endDate >= :start)
    """)
    List<Event> findOverlapping(@Param("start")LocalDate start, @Param("end")LocalDate end);

    // ★ 추가: 결재문서 토큰(콘텐츠에 숨김)을 이용해 기존 일정 1건 조회(업서트 키)
    Optional<Event> findFirstByCrewEmployeeIdAndContentContaining(Integer crewEmployeeId, String token);

    // ★ 추가: 토큰 일괄 삭제용(혹시 중복되어 있을 경우 정리)
    List<Event> findAllByCrewEmployeeIdAndContentContaining(Integer crewEmployeeId, String token);
}
