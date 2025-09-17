package com.pj.springboot.attendance.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pj.springboot.attendance.dto.AttendanceDTO;
import com.pj.springboot.attendance.dto.AttendanceStatDTO;
import com.pj.springboot.attendance.service.AttendancesService;

@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {

	@Autowired
	AttendancesService attendancesService;

	// 작성
	@PostMapping()
	public int insertTodayRow() {
		if (attendancesService.count(LocalDate.now()) > 0) {
			return -1;
		}
		try {
			return attendancesService.insertTodayAttendances();
		} catch (Exception e) {
			return -1;
		}
	}

	// 작성
	@PostMapping("/{attendanceId}")
	public int updateAttendance(@PathVariable long attendanceId, @RequestBody AttendanceDTO dto) {
		try {
			return attendancesService.updateAttendance(attendanceId, dto);
		} catch (Exception e) {
			return -1;
		}
	}

	@PostMapping("/checkin/{employeeId}")
	public int updateAttendanceStart(@PathVariable int employeeId) {
		try {
			return attendancesService.checkIn(employeeId);
		} catch (Exception e) {
			return -1;
		}
	}

	@PostMapping("/checkout/{employeeId}")
	public int updateAttendanceEnd(@PathVariable int employeeId) {
		try {
			return attendancesService.checkOut(employeeId);
		} catch (Exception e) {
			return -1;
		}
	}

	// 사원의 오늘 근태 ROW 가져오기
	@GetMapping("/{employeeId}")
	public AttendanceDTO getOne(@PathVariable int employeeId) {
		return attendancesService.getOne(employeeId);
	}

	// 페이징된 리스트
	@GetMapping("/page/{page}/{size}")
	public ResponseEntity<List<AttendanceDTO>> listWithPaging(@PathVariable int page, @PathVariable int size) {
		return ResponseEntity.ok(attendancesService.getListWithPaging(null, page, size));
	}

	// 검색 후 페이징된 리스트
	@GetMapping("/{searchField}/{searchWord}/page/{page}/{size}")
	public ResponseEntity<List<AttendanceDTO>> listSearchWithPaging(@PathVariable String searchField,
			@PathVariable String searchWord, @PathVariable int page, @PathVariable int size) {
		return ResponseEntity.ok(attendancesService.getListSearchWithPaging(null, searchField, searchWord, page, size));
	}

	// 페이징된 리스트
	@GetMapping("/{date}/page/{page}/{size}")
	public ResponseEntity<List<AttendanceDTO>> listWithPagingAndDate(@PathVariable LocalDate date,
			@PathVariable int page, @PathVariable int size) {
		return ResponseEntity.ok(attendancesService.getListWithPaging(date, page, size));
	}

	// 검색 후 페이징된 리스트
	@GetMapping("/{date}/{searchField}/{searchWord}/page/{page}/{size}")
	public ResponseEntity<List<AttendanceDTO>> listSearchWithPagingAndDate(@PathVariable LocalDate date,
			@PathVariable String searchField, @PathVariable String searchWord, @PathVariable int page,
			@PathVariable int size) {
		return ResponseEntity.ok(attendancesService.getListSearchWithPaging(date, searchField, searchWord, page, size));
	}

	// 검색 결과 개수
	@GetMapping("/count/{searchField}/{searchWord}")
	public Long searchCount(@PathVariable String searchField, @PathVariable String searchWord) {
		return attendancesService.count(null, searchField, searchWord);
	}

	// 전체 개수
	@GetMapping("/count")
	public Long count() {
		return attendancesService.count(null);
	}

	// 검색 결과 개수 특정 날짜
	@GetMapping("/count/{date}/{searchField}/{searchWord}")
	public Long searchCountWithDate(@PathVariable LocalDate date, @PathVariable String searchField,
			@PathVariable String searchWord) {
		return attendancesService.count(date, searchField, searchWord);
	}

	// 날짜 검색 개수
	@GetMapping("/count/{date}")
	public Long countWithDate(@PathVariable LocalDate date) {
		return attendancesService.count(date);
	}

	//////////////////////////

	// 사원별 근태 월별 통계 개수
	@GetMapping("count/month/{month}/page/{page}/{size}")
	public Long countWithMonth(@PathVariable String month, @PathVariable int page, @PathVariable int size) {
		LocalDate start = LocalDate.parse(month + "-01");
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
		return attendancesService.getStatCount(start, end);
	}

	// 검색 결과 개수 특정 날짜
	@GetMapping("/count/month/{month}/{searchField}/{searchWord}")
	public Long searchCountWithMonth(@PathVariable String month, @PathVariable String searchField,
			@PathVariable String searchWord) {
		LocalDate start = LocalDate.parse(month + "-01");
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
		return attendancesService.getStatCount(start, end, searchField, searchWord);
	}

	// 사원별 검색 근태 월별 통계
	@GetMapping("/month/{month}/{searchField}/{searchWord}/page/{page}/{size}")
	public ResponseEntity<List<AttendanceStatDTO>> listSearchWithMonthAndPaging(@PathVariable String month,
			@PathVariable String searchField, @PathVariable String searchWord, @PathVariable int page,
			@PathVariable int size) {
		LocalDate start = LocalDate.parse(month + "-01");
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
		return ResponseEntity.ok(attendancesService.getListSearchWithPage(start, end, searchField, searchWord, page, size));
	}

	// 사원별 근태 월별 통계
	@GetMapping("/month/{month}/page/{page}/{size}")
	public ResponseEntity<List<AttendanceStatDTO>> listWithMonthAndPaging(@PathVariable String month,
			@PathVariable int page, @PathVariable int size) {
		LocalDate start = LocalDate.parse(month + "-01");
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
		return ResponseEntity.ok(attendancesService.getStatsWithPage(start, end, page, size));
	}
}
