package com.pj.springboot.arch.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pj.springboot.arch.dto.ArchfilesDTO;
import com.pj.springboot.arch.entity.ArchfilesEntity;
import com.pj.springboot.arch.repository.ArchfilesRepository;
import com.pj.springboot.arch.repository.ArchiveRepository;

@Service
@Transactional
public class ArchfilesService {

	@Autowired
	private ArchfilesRepository archfilesRepository;
	@Autowired
	private ArchiveRepository archiveRepository;

	// 전체 select
	public List<ArchfilesDTO> getFileList() {
		List<ArchfilesEntity> entityList = archfilesRepository.findAll();
		List<ArchfilesDTO> list = new ArrayList<>();
		for (ArchfilesEntity entity : entityList) {
			list.add(new ArchfilesDTO(entity));

		}

		return list;
	}

	// 특정 전표의 파일 select
	public List<ArchfilesDTO> getFileListWithArchId(int archId) {
		List<ArchfilesEntity> entityList = archfilesRepository.findByArchId(archId);
		List<ArchfilesDTO> list = new ArrayList<>();
		for (ArchfilesEntity entity : entityList) {
			list.add(new ArchfilesDTO(entity));
		}

		return list;
	}

	public ArchfilesDTO getOneFileResource(int fileidx) {
		ArchfilesEntity entity = archfilesRepository.findById(fileidx).get();
		ArchfilesDTO dto = new ArchfilesDTO(entity);

		return dto;
	}

}