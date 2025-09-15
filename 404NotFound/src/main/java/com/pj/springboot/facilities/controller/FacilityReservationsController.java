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
	public int approval(@PathVariable int reservationId, @RequestBody FacilityReservationDTO dto) {
		try {
			return facilityReservationsService.approvalFacilityReservation(reservationId, dto.getReservationStatus());
		} catch (Exception e) {
			return -1;
		}
	}

	@DeleteMapping("/{reservationId}")
	public int deleteReservation(@PathVariable int reservationId) {
		try {
			return facilityReservationsService.deleteReservation(reservationId);
		} catch (Exception e) {
			return -1;
		}
	}

	// 전체 리스트
	@GetMapping()
	public ResponseEntity<List<FacilityReservationDTO>> list() {
		return ResponseEntity.ok(facilityReservationsService.getList());
	}

	// 대기중인 목록을 상단에
	// 종료일시가 지나지 않은 건만
	// 작성일이 빠른 순서대로
	@GetMapping("/approval/page/{page}/{size}")
	public ResponseEntity<List<FacilityReservationDTO>> listScheduled(@PathVariable int page, @PathVariable int size) {
		return ResponseEntity.ok(facilityReservationsService.getListScheduledWithPaging(page, size));
	}

	@GetMapping("/approval/{searchField}/{searchWord}/page/{page}/{size}")
	public ResponseEntity<List<FacilityReservationDTO>> listSearchScheduled(@PathVariable String searchField,
			@PathVariable String searchWord, @PathVariable int page, @PathVariable int size) {
		return ResponseEntity
				.ok(facilityReservationsService.getListSearchScheduledWithPaging(searchField, searchWord, page, size));
	}

	// 특정 시설물의 예약
	@GetMapping("/{facilityId}")
	public ResponseEntity<List<FacilityReservationDTO>> listByFacilityId(@PathVariable int facilityId) {
		List<FacilityReservationDTO> list = facilityReservationsService.getListByFacilityId(facilityId);
		System.out.println("테스트 : " + list);
		return ResponseEntity.ok(list);
	}

	// 특정 시설물의 예약 페이징
	@GetMapping("/{facilityId}/page/{page}/{size}")
	public ResponseEntity<List<FacilityReservationDTO>> listByFacilityId(@PathVariable int facilityId,
			@PathVariable int page, @PathVariable int size) {
		List<FacilityReservationDTO> list = facilityReservationsService.getListByFacilityIdWithPaging(facilityId, page,
				size);
		return ResponseEntity.ok(list);
	}

	// 검색 리스트
	@GetMapping("/{searchField}/{searchWord}")
	public ResponseEntity<List<FacilityReservationDTO>> listSearch(@PathVariable String searchField,
			@PathVariable String searchWord) {
		List<FacilityReservationDTO> list = facilityReservationsService.getListSearch(searchField, searchWord);
		return ResponseEntity.ok(list);
	}

	// 특정 시설물의 예약 검색 리스트
	@GetMapping("/{facilityId}/{searchField}/{searchWord}")
	public ResponseEntity<List<FacilityReservationDTO>> listSearchByFacilityId(@PathVariable int facilityId,
			@PathVariable String searchField, @PathVariable String searchWord) {
		List<FacilityReservationDTO> list = facilityReservationsService.getListSearchByFacilityId(facilityId,
				searchField, searchWord);
		return ResponseEntity.ok(list);
	}

	// 특정 시설물의 예약 검색 리스트 페이징 적용
	@GetMapping("/{facilityId}/{searchField}/{searchWord}/page/{page}/{size}")
	public ResponseEntity<List<FacilityReservationDTO>> listSearchByFacilityId(@PathVariable int facilityId,
			@PathVariable String searchField, @PathVariable String searchWord, @PathVariable int page,
			@PathVariable int size) {
		List<FacilityReservationDTO> list = facilityReservationsService.getListSearchByFacilityIdWithPaging(facilityId,
				searchField, searchWord, page, size);
		return ResponseEntity.ok(list);
	}

	// 페이징된 리스트
	@GetMapping("/page/{page}/{size}")
	public ResponseEntity<List<FacilityReservationDTO>> listWithPaging(@PathVariable int page, @PathVariable int size) {
		return ResponseEntity.ok(facilityReservationsService.getListWithPaging(page, size));
	}

	// 검색 결과 개수
	@GetMapping("/count/{searchField}/{searchWord}")
	public Long searchCount(@PathVariable String searchField, @PathVariable String searchWord) {
		return facilityReservationsService.count(searchField, searchWord);
	}

	// 검색 후 페이징된 리스트
	@GetMapping("/{searchField}/{searchWord}/page/{page}/{size}")
	public ResponseEntity<List<FacilityReservationDTO>> listSearchWithPaging(@PathVariable String searchField,
			@PathVariable String searchWord, @PathVariable int page, @PathVariable int size) {
		return ResponseEntity
				.ok(facilityReservationsService.getListSearchWithPaging(searchField, searchWord, page, size));
	}

	@GetMapping("/count")
	public Long count() {
		return facilityReservationsService.count();
	}

	// 특정 시설물의 예약 개수
	@GetMapping("/count/{facilityId}")
	public Long countByfacilityId(@PathVariable int facilityId) {
		return facilityReservationsService.countByfacilityId(facilityId);
	}

	// 특정 시설물의 검색어 포함 예약 개수
	@GetMapping("/count/{facilityId}/{searchField}/{searchWord}")
	public Long searchCountByfacilityId(@PathVariable int facilityId, @PathVariable String searchField,
			@PathVariable String searchWord) {
		return facilityReservationsService.searchCountByfacilityId(facilityId, searchField, searchWord);
	}

	@GetMapping("/approval/count")
	public Long scheduledCount() {
		return facilityReservationsService.scheduledCount();
	}

	@GetMapping("/approval/count/{searchField}/{searchWord}")
	public Long searchScheduledCount(@PathVariable String searchField, @PathVariable String searchWord) {
		return facilityReservationsService.searchScheduledCount(searchField, searchWord);
	}
}
