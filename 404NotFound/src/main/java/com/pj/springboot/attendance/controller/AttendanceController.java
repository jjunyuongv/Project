package com.pj.springboot.attendance.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
		try {
			return attendancesService.insertTodayAttendances();
		} catch (Exception e) {
			return -1;
		}
	}

	// 작성
	@PostMapping("/{attendanceId}")
	public int updateAttendance(@PathVariable("attendanceId") long attendanceId, @RequestBody AttendanceDTO dto) {
		try {
			return attendancesService.updateAttendance(attendanceId, dto);
		} catch (Exception e) {
			return -1;
		}
	}

	@PostMapping("/checkin/{employeeId}")
	public int updateAttendanceStart(@PathVariable("employeeId") int employeeId) {
		try {
			return attendancesService.checkIn(employeeId);
		} catch (Exception e) {
			return -1;
		}
	}

	@PostMapping("/checkout/{employeeId}")
	public int updateAttendanceEnd(@PathVariable("employeeId") int employeeId) {
		try {
			return attendancesService.checkOut(employeeId);
		} catch (Exception e) {
			return -1;
		}
	}

	// 사원의 오늘 근태 ROW 가져오기
	@GetMapping("/{employeeId}")
	public AttendanceDTO getOne(@PathVariable("employeeId") int employeeId) {
		return attendancesService.getOne(employeeId);
	}

	// 근태 정보 얻기
	@GetMapping()
	public ResponseEntity<List<AttendanceDTO>> listWithPaging(@RequestParam(required = false, name = "date") LocalDate date,
			@RequestParam(defaultValue = "1", name = "page") int page, @RequestParam(defaultValue = "5", name = "size") int size,
			@RequestParam(required = false, name = "searchField") String searchField, @RequestParam(required = false, name = "searchWord") String searchWord) {
		return ResponseEntity.ok(attendancesService.getList(date, page, size, searchField, searchWord));
	}

	// 근태 정보 개수
	@GetMapping("/count")
	public Long searchCountWithDate(@RequestParam(required = false, name = "date") LocalDate date,
			@RequestParam(required = false, name = "searchField") String searchField, @RequestParam(required = false, name = "searchWord") String searchWord) {
		return attendancesService.count(date, searchField, searchWord);
	}

	//////////////////////////

	// 월별 근태 통계 개수
	@GetMapping("/stat/count")
	public Long searchCountWithMonth(@RequestParam("month") String month, @RequestParam(required = false, name = "searchField") String searchField,
			@RequestParam(required = false, name = "searchWord") String searchWord) {
		LocalDate start = LocalDate.parse(month + "-01");
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
		return attendancesService.getStatCount(start, end, searchField, searchWord);
	}

	// 사원별 근태 월별 통계
	@GetMapping("/stat")
	public ResponseEntity<List<AttendanceStatDTO>> listSearchWithMonthAndPaging(@RequestParam("month") String month,
			@RequestParam(required = false, name = "searchField") String searchField, @RequestParam(required = false, name = "searchWord") String searchWord, @RequestParam(defaultValue = "1", name = "page") int page,
			@RequestParam(defaultValue = "5", name = "size") int size) {
		LocalDate start = LocalDate.parse(month + "-01");
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
		return ResponseEntity
				.ok(attendancesService.getStatList(start, end, searchField, searchWord, page, size));
	}
}
