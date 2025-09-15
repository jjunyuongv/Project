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

import com.pj.springboot.facilities.dto.FacilitiesDTO;
import com.pj.springboot.facilities.service.FacilitiesService;

@RestController
@RequestMapping("/api/facilities")
public class FacilitiesController {
	@Autowired
	FacilitiesService facilitiesService;
	
	// 작성
	@PostMapping()
	public int insert(@RequestBody FacilitiesDTO dto) {
		try {
			return facilitiesService.insertFacilities(dto);
		} catch (Exception e) {
			return -1;
		}
	}
	
	// id에 해당하는 시설물 가져오기
	@GetMapping("/{facilityId}")
	public FacilitiesDTO getOne(@PathVariable int facilityId) {
		return facilitiesService.getOne(facilityId);
	}
	
	// id에 해당하는 시설물 정보 수정
	@PostMapping("/{facilityId}")
	public int update(@PathVariable int facilityId, @RequestBody FacilitiesDTO dto) {
		try {
			return facilitiesService.update(facilityId, dto);
		} catch (Exception e) {
			return -1;
		}
	}
	
	// id에 해당하는 시설물 삭제
	@DeleteMapping("/{facilityId}")
	public int delete(@PathVariable int facilityId) {
		try {
			return facilitiesService.delete(facilityId);
		} catch (Exception e) {
			return -1;
		}
	}
	
	// 전체 리스트
	@GetMapping()
	public ResponseEntity<List<FacilitiesDTO>> list() {
		return ResponseEntity.ok(facilitiesService.getList());
	}

	// 검색 리스트
	@GetMapping("/{searchField}/{searchWord}")
	public ResponseEntity<List<FacilitiesDTO>> listSearch(@PathVariable String searchField,
			@PathVariable String searchWord) {
		List<FacilitiesDTO> list = facilitiesService.getListSearch(searchField, searchWord);
		return ResponseEntity.ok(list);
	}

	// 페이징된 리스트
	@GetMapping("/page/{page}/{size}")
	public ResponseEntity<List<FacilitiesDTO>> listWithPaging(@PathVariable int page, @PathVariable int size) {
		return ResponseEntity.ok(facilitiesService.getListWithPaging(page, size));
	}

	// 검색 결과 개수
	@GetMapping("/count/{searchField}/{searchWord}")
	public Long searchCount(@PathVariable String searchField, @PathVariable String searchWord) {
		return facilitiesService.count(searchField, searchWord);
	}

	// 검색 후 페이징된 리스트
	@GetMapping("/{searchField}/{searchWord}/page/{page}/{size}")
	public ResponseEntity<List<FacilitiesDTO>> listSearchWithPaging(@PathVariable String searchField,
			@PathVariable String searchWord, @PathVariable int page, @PathVariable int size) {
		return ResponseEntity.ok(facilitiesService.getListSearchWithPaging(searchField, searchWord, page, size));
	}

	@GetMapping("/count")
	public Long count() {
		return facilitiesService.count();
	}
}
