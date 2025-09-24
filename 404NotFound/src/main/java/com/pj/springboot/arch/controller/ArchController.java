package com.pj.springboot.arch.controller;

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

import com.pj.springboot.arch.dto.ArchDTO;
import com.pj.springboot.arch.service.ArchiveService;

@RestController
@RequestMapping("/api/archive")

public class ArchController {

	@Autowired
	ArchiveService archiveService;

	// 페이징된 리스트
	@GetMapping("/page/{page}/{size}")
	public ResponseEntity<List<ArchDTO>> listWithPaging(@PathVariable("page") int page,
			@PathVariable("size") int size) {

		return ResponseEntity.ok(archiveService.getListWithPaging(page, size));
	}

	@GetMapping("/{searchField}/{searchWord}/page/{page}/{size}")
	public ResponseEntity<List<ArchDTO>> listSearchWithPaging(@PathVariable("searchField") String searchField,
			@PathVariable("searchWord") String searchWord, @PathVariable("page") int page,
			@PathVariable("size") int size) {

		return ResponseEntity.ok(archiveService.getListSearchWithPaging(searchField, searchWord, page, size));
	}

	// 검색 결과 개수
	@GetMapping("/count/{searchField}/{searchWord}")
	public Long searchCount(@PathVariable("searchField") String searchField,
			@PathVariable("searchWord") String searchWord) {
		return archiveService.count(searchField, searchWord);
	}

	@GetMapping("/count")
	public Long count() {
		return archiveService.count();
	}

	// id에 해당하는 시설물 가져오기
	@GetMapping("/{archId}")
	public ArchDTO getOne(@PathVariable("archId") int archId) {
		System.out.println("들어왔따" + archId);

		return archiveService.getOne(archId);
	}

	// 작성
	@PostMapping()
	public int insert(@RequestBody ArchDTO dto) {
		try {
			return archiveService.insertArchive(dto);
		} catch (Exception e) {
			return -1;
		}

	}

	// id에 해당하는 시설물 삭제
	@DeleteMapping("/{archId}")
	public int delete(@PathVariable("archId") int archId) {
		try {
			System.out.println("헐랭털" + archId);
			return archiveService.delete(archId);
		} catch (Exception e) {
			return -1;
		}
	}

	// id에 해당하는 시설물 정보 수정
	@PostMapping("/{archId}")
	public int update(@PathVariable("archId") int archId, @RequestBody ArchDTO dto) {
		try {
			return archiveService.update(archId, dto);
		} catch (Exception e) {
			System.out.println("컨트롤러 오류");
			return -1;
		}
	}

}
