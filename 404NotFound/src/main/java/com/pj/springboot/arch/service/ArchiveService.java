package com.pj.springboot.arch.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.pj.springboot.arch.dto.ArchDTO;
import com.pj.springboot.arch.dto.ArchfilesDTO;
import com.pj.springboot.arch.entity.ArchfilesEntity;
import com.pj.springboot.arch.entity.ArchiveEntity;
import com.pj.springboot.arch.repository.ArchfilesRepository;
import com.pj.springboot.arch.repository.ArchiveRepository;
import com.pj.springboot.arch.util.FileUtil;
import com.pj.springboot.auth.repository.EmployeeRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ArchiveService {

	@Autowired
	private ArchfilesRepository archfilesRepository;

	@Autowired
	private ArchiveRepository archiveRepository;

	@Autowired
	private EmployeeRepository employeeRepository;

	/**
	 * 문서 삭제
	 * 
	 * @return
	 */

	public int delete(int id) {
		List<ArchfilesEntity> list = archfilesRepository.findByArchId(id);

		List<String> names = new ArrayList<>();

		for (ArchfilesEntity fileEntity : list) {
			names.add(fileEntity.getSfile());
		}
		try {
			FileUtil.deleteFiles(names);
		} catch (Exception e) {
			return -1;
		}
		archfilesRepository.deleteByArchId(id);
		archiveRepository.deleteById(id);
		return 1;
	}

	public List<ArchDTO> getListWithPaging(int page, int size) {
		System.out.println("들어옴");
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "archId"));
		Page<ArchiveEntity> entityList = archiveRepository.findAll(pageable);
		List<ArchDTO> list = new ArrayList<>();
		for (ArchiveEntity entity : entityList) {
			list.add(new ArchDTO(entity, archfilesRepository.countByArchId(entity.getArchId())));
		}
		System.out.println("리스트받아왔음" + list);
		return list;

	}

	public Long count() {
		return archiveRepository.count();

	}

	public Long count(String searchField, String searchWord) {
		switch (searchField) {
		case "archTitle":
			return archiveRepository.countByArchTitleLike("%" + searchWord + "%");
		case "archCtnt":
			return archiveRepository.countByArchCtntLike("%" + searchWord + "%");
		}

		return (long) 0;

	}

	public List<ArchDTO> getListSearchWithPaging(String searchField, String searchWord, int page, int size) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "archId"));
		Page<ArchiveEntity> entityList = Page.empty();

		switch (searchField) {
		case "archTitle":
			entityList = archiveRepository.findByArchTitleLike("%" + searchWord + "%", pageable);
			break;
		case "archCtnt":
			entityList = archiveRepository.findByArchCtntLike("%" + searchWord + "%", pageable);
			break;
		}

		List<ArchDTO> list = new ArrayList<>();
		for (ArchiveEntity entity : entityList) {
			list.add(new ArchDTO(entity, archfilesRepository.countByArchId(entity.getArchId())));
		}

		return list;

	}

	public int insertArchive(ArchDTO dto) {

		ArchiveEntity entity = new ArchiveEntity();
		entity.setArchTitle(dto.getArchTitle());
		entity.setRegUserId(employeeRepository.getReferenceById(dto.getRegUserId()));
		entity.setArchCtnt(dto.getArchCtnt());
		entity.setRegDt(LocalDateTime.now());

		archiveRepository.save(entity);

		// 파일 등록

		for (ArchfilesDTO fileDto : dto.getFileList()) {
			ArchfilesEntity file = new ArchfilesEntity();
			file.setArchId(entity.getArchId());
			file.setOfile(fileDto.getOfile());
			file.setSfile(fileDto.getSfile());
			archfilesRepository.save(file);
		}

		return 1;
	}

	public ArchDTO getOne(int archId) {
		ArchiveEntity entity = archiveRepository.findById(archId).get();
		System.out.println("qqqqqqqqqqqqqqqq" + archfilesRepository.countByArchId(entity.getArchId()));
		ArchDTO dto = new ArchDTO(entity, archfilesRepository.countByArchId(entity.getArchId()));
		return dto;
	}

	public int update(int archId, ArchDTO dto) {
		ArchiveEntity entity = archiveRepository.findById(archId).get();
		entity.setArchTitle(dto.getArchTitle());
		entity.setArchCtnt(dto.getArchCtnt());
		entity.setUdtDt(LocalDateTime.now());
		entity.setUdtUserId(employeeRepository.getReferenceById(dto.getUdtUserId()));

		archiveRepository.save(entity);

		List<ArchfilesEntity> list = archfilesRepository.findByArchId(entity.getArchId());

		List<String> names = new ArrayList<>();

		for (ArchfilesEntity fileEntity : list) {
			names.add(fileEntity.getSfile());
		}
		try {
			FileUtil.deleteFiles(names);
		} catch (Exception e) {
			System.out.println("163번째줄 오류");
			return -1;
		}
		archfilesRepository.deleteByArchId(entity.getArchId());

		for (ArchfilesDTO fileDto : dto.getFileList()) {
			ArchfilesEntity file = new ArchfilesEntity();
			file.setArchId(entity.getArchId());
			file.setOfile(fileDto.getOfile());
			file.setSfile(fileDto.getSfile());
			archfilesRepository.save(file);
		}

		return 1;
	}
}
