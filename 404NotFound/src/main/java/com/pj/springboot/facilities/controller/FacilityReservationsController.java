package com.pj.springboot.facilities.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pj.springboot.facilities.dto.FacilityReservationDTO;
import com.pj.springboot.facilities.service.FacilityReservationsService;

@RestController
@RequestMapping("/api/facilityReservations")
public class FacilityReservationsController {
	@Autowired
	FacilityReservationsService facilityReservationsService;

	// 작성
	@PostMapping()
	public int insert(@RequestBody FacilityReservationDTO dto) {
		try {
			return facilityReservationsService.insertFacilityReservation(dto);
		} catch (Exception e) {
			return -1;
		}
	}

	// 승인/반려 처리
	@PostMapping("/{reservationId}")
	public int approval(@PathVariable("reservationId") int reservationId, @RequestBody FacilityReservationDTO dto) {
		try {
			return facilityReservationsService.approvalFacilityReservation(reservationId, dto.getReservationStatus());
		} catch (Exception e) {
			return -1;
		}
	}

	// 삭제
	@DeleteMapping("/{reservationId}")
	public int deleteReservation(@PathVariable("reservationId") int reservationId) {
		try {
			return facilityReservationsService.deleteReservation(reservationId);
		} catch (Exception e) {
			return -1;
		}
	}

	// 대기중인 목록을 상단에
	// 종료일시가 지나지 않은 건만
	// 작성일이 빠른 순서대로
	@GetMapping("/approval")
	public ResponseEntity<List<FacilityReservationDTO>> listSearchScheduled(
			@RequestParam(required = false, name = "searchField") String searchField, @RequestParam(required = false, name = "searchWord") String searchWord,
			@RequestParam(defaultValue = "1", name = "page") int page, @RequestParam(defaultValue = "5", name = "size") int size) {
		return ResponseEntity.ok(facilityReservationsService.getListScheduled(searchField, searchWord, page, size));
	}

	// 특정 시설물의 예약 검색 리스트 페이징 적용
	@GetMapping("/{facilityId}")
	public ResponseEntity<List<FacilityReservationDTO>> listSearchByFacilityId(@PathVariable("facilityId") int facilityId,
			@RequestParam(required = false, name = "searchField") String searchField, @RequestParam(required = false, name = "searchWord") String searchWord,
			@RequestParam(defaultValue = "1", name = "page") int page, @RequestParam(defaultValue = "5", name = "size") int size) {
		List<FacilityReservationDTO> list = facilityReservationsService.getListByFacilityId(facilityId, searchField,
				searchWord, page, size);
		return ResponseEntity.ok(list);
	}

	// 검색 후 페이징된 리스트
	@GetMapping()
	public ResponseEntity<List<FacilityReservationDTO>> listSearchWithPaging(
			@RequestParam(required = false, name = "searchField") String searchField, @RequestParam(required = false, name = "searchWord") String searchWord,
			@RequestParam(defaultValue = "1", name = "page") int page, @RequestParam(defaultValue = "5", name = "size") int size) {
		return ResponseEntity.ok(facilityReservationsService.getList(searchField, searchWord, page, size));
	}

	// 전체 예약 개수
	@GetMapping("/count")
	public Long count(@RequestParam(required = false, name = "searchField") String searchField,
			@RequestParam(required = false, name = "searchWord") String searchWord) {
		return facilityReservationsService.count(searchField, searchWord);
	}

	// 특정 시설물의 예약 개수
	@GetMapping("/count/{facilityId}")
	public Long searchCountByfacilityId(@PathVariable("facilityId") int facilityId,
			@RequestParam(required = false, name = "searchField") String searchField, @RequestParam(required = false, name = "searchWord") String searchWord) {
		return facilityReservationsService.countByfacilityId(facilityId, searchField, searchWord);
	}

	// 지나지 않은 예약 개수
	@GetMapping("/approval/count")
	public Long searchScheduledCount(@RequestParam(required = false, name = "searchField") String searchField,
			@RequestParam(required = false, name = "searchWord") String searchWord) {
		return facilityReservationsService.scheduledCount(searchField, searchWord);
	}
}
