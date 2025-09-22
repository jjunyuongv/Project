package com.pj.springboot.calendars.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pj.springboot.calendars.ShiftMemo;
import com.pj.springboot.calendars.dto.ShiftMemoDTO;
import com.pj.springboot.calendars.service.ShiftMemoService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shift-memos")
@RequiredArgsConstructor
public class ShiftMemoController {

    private final ShiftMemoService service;

    @GetMapping
    public List<ShiftMemoDTO> list(
            @RequestParam("employeeId") Integer employeeId,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(value = "team", required = false) String team) {
        return service.list(employeeId, start, end, team)
                .stream().map(this::toDTO).toList();
    }

    @PostMapping
    public ShiftMemoDTO upsert(@RequestBody UpsertReq req) {
        ShiftMemo saved = service.upsert(req.employeeId, req.memoDate, req.teamName, req.content);
        return toDTO(saved);
    }

    @DeleteMapping("/{memoId}")
    public ResponseEntity<Void> delete(@PathVariable("memoId") Integer memoId) {
        service.delete(memoId);
        return ResponseEntity.noContent().build();
    }
    
    private ShiftMemoDTO toDTO(ShiftMemo m) {
        ShiftMemoDTO dto = new ShiftMemoDTO();
        dto.setMemoId(m.getMemoId());
        dto.setShiftEmployeeId(m.getShiftEmployeeId());
        dto.setMemoDate(m.getMemoDate());
        dto.setTeamName(m.getTeamName());
        dto.setContent(m.getContent());
        return dto;
    }

    @Data
    public static class UpsertReq {
        private Integer employeeId;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate memoDate;
        private String teamName;
        private String content;
    }
}
