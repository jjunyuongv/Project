package com.pj.springboot.calendars.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pj.springboot.calendars.ShiftMemo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ShiftMemoRepository extends JpaRepository<ShiftMemo, Integer> {

    @Query("select m from ShiftMemo m " +
           "where m.shiftEmployeeId = :employeeId " +
           "and m.memoDate between :start and :end")
    List<ShiftMemo> findRange(
            @Param("employeeId") Integer employeeId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("select m from ShiftMemo m " +
           "where m.shiftEmployeeId = :employeeId " +
           "and m.memoDate between :start and :end " +
           "and m.teamName = :teamName")
    List<ShiftMemo> findRangeByTeam(
            @Param("employeeId") Integer employeeId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("teamName") String teamName);

    @Query("select m from ShiftMemo m " +
           "where m.shiftEmployeeId = :employeeId " +
           "and m.memoDate = :memoDate " +
           "and m.teamName = :teamName")
    Optional<ShiftMemo> findOneByComposite(
            @Param("employeeId") Integer employeeId,
            @Param("memoDate") LocalDate memoDate,
            @Param("teamName") String teamName);
}
