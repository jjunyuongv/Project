package com.pj.springboot.facilities.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.pj.springboot.auth.repository.EmployeeRepository;
import com.pj.springboot.facilities.Facilities;
import com.pj.springboot.facilities.FacilityReservations;
import com.pj.springboot.facilities.dto.FacilitiesDTO;
import com.pj.springboot.facilities.repository.FacilitiesRepository;
import com.pj.springboot.facilities.repository.FacilityReservationsRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class FacilitiesService {
	@Autowired
	FacilitiesRepository facilitiesRepository;

	@Autowired
	EmployeeRepository employeeRepository;

	@Autowired
	FacilityReservationsRepository facilityReservationsRepository;

	// entity로 가져와 dto로 변환
	public List<FacilitiesDTO> getList(int page, int size, String searchField, String searchWord) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "facilityId"));
		Page<Facilities> entityList = Page.empty();

		if (searchWord == null || searchWord.trim().isEmpty()) {
			entityList = facilitiesRepository.findAll(pageable);
		} else {
			switch (searchField) {
			case "facilityName":
				entityList = facilitiesRepository.findByFacilityNameLike("%" + searchWord + "%", pageable);
				break;
			case "facilityType":
				entityList = facilitiesRepository.findByFacilityTypeLike("%" + searchWord + "%", pageable);
				break;
			default:
				entityList = facilitiesRepository.findAll(pageable);
				break;
			}
		}

		List<FacilitiesDTO> list = new ArrayList<>();
		for (Facilities facilities : entityList) {
			list.add(new FacilitiesDTO(facilities));
		}
		return list;
	}

	public Long count(String searchField, String searchWord) {
		if (searchWord == null || searchWord.trim().isEmpty()) {
			return facilitiesRepository.count();
		} else {
			switch (searchField) {
			case "facilityName":
				return facilitiesRepository.countByFacilityNameLike("%" + searchWord + "%");
			case "facilityType":
				return facilitiesRepository.countByFacilityTypeLike("%" + searchWord + "%");
			default:
				return facilitiesRepository.count();
			}
		}
	}

	public int insertFacilities(FacilitiesDTO dto) {
		Facilities entity = new Facilities();
		entity.setFacilityType(dto.getFacilityType());
		entity.setFacilityName(dto.getFacilityName());
		entity.setFacilityStatus(dto.getFacilityStatus());
		entity.setFacilityLocation(dto.getFacilityLocation());
		entity.setFacilityManagerId(employeeRepository.getReferenceById(dto.getFacilityManagerId()));

		facilitiesRepository.save(entity);
		return 1;
	}

	public int update(int facilityId, FacilitiesDTO dto) {
		Facilities entity = facilitiesRepository.findById(facilityId).get();
		entity.setFacilityType(dto.getFacilityType());
		entity.setFacilityName(dto.getFacilityName());
		entity.setFacilityStatus(dto.getFacilityStatus());
		entity.setFacilityLocation(dto.getFacilityLocation());
		entity.setFacilityManagerId(employeeRepository.getReferenceById(dto.getFacilityManagerId()));
		facilitiesRepository.save(entity);
		return 1;
	}

	public FacilitiesDTO getOne(int facilityId) {
		Facilities entity = facilitiesRepository.findById(facilityId).get();
		FacilitiesDTO dto = new FacilitiesDTO(entity);
		return dto;
	}

	public int delete(int facilityId) {
		// 해당 시설의 예약 삭제
		List<FacilityReservations> entityList = facilityReservationsRepository.findByFacilityId(facilityId);
		for (FacilityReservations entity : entityList) {
			facilityReservationsRepository.delete(entity);
		}
		// 시설물 삭제
		facilitiesRepository.deleteById(facilityId);
		return 1;
	}
}
