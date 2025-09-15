package com.pj.springboot.facilities.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.pj.springboot.auth.repository.EmployeeRepository;
import com.pj.springboot.facilities.FacilityReservations;
import com.pj.springboot.facilities.dto.FacilityReservationDTO;
import com.pj.springboot.facilities.repository.FacilitiesRepository;
import com.pj.springboot.facilities.repository.FacilityReservationsRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class FacilityReservationsService {
	@Autowired
	FacilityReservationsRepository facilityReservationsRepository;

	@Autowired
	FacilitiesRepository facilitiesRepository;

	@Autowired
	EmployeeRepository employeeRepository;

	// 작성
	public int insertFacilityReservation(FacilityReservationDTO dto) {
		FacilityReservations entity = new FacilityReservations();
		entity.setReservationFacilityId(facilitiesRepository.getReferenceById(dto.getReservationFacilityId()));
		entity.setReservationEmployeeId(employeeRepository.getReferenceById(dto.getReservationEmployeeId()));
		entity.setReservationStatus(dto.getReservationStatus());
		entity.setReservationStartTime(dto.getReservationStartTime());
		entity.setReservationEndTime(dto.getReservationEndTime());
		entity.setReservationDate(LocalDateTime.now());

		facilityReservationsRepository.save(entity);
		return 1;
	}

	// 승인/반려
	public int approvalFacilityReservation(int reservationId, String approval) {
		FacilityReservations entity = facilityReservationsRepository.findById(reservationId).get();
		entity.setReservationStatus(approval);
		facilityReservationsRepository.save(entity);

		return 1;
	}

	// 관리자가 결재를 하기위한 리스트
	// 대기중인 예약이 제일 위에 표시되고, 승인/반려된 예약은 아래에서
	// 예약 일시가 지나간 예약은 제외
	public List<FacilityReservationDTO> getListScheduledWithPaging(int page, int size) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "reservationDate"));
		Page<FacilityReservations> entityList = facilityReservationsRepository
				.findScheduleReservation(LocalDateTime.now(), pageable);
		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations facilityreservations : entityList) {
			list.add(new FacilityReservationDTO(facilityreservations));
		}
		return list;
	}

	// entity로 가져와 dto로 변환
	// 모든 데이터
	public List<FacilityReservationDTO> getList() {
		List<FacilityReservations> entityList = facilityReservationsRepository.findAll();
		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations facilityreservations : entityList) {
			list.add(new FacilityReservationDTO(facilityreservations));
		}
		return list;
	}

	// 모든 데이터 페이징 적용
	public List<FacilityReservationDTO> getListWithPaging(int page, int size) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "reservationDate"));
		Page<FacilityReservations> entityList = facilityReservationsRepository.findAll(pageable);
		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations entity : entityList) {
			list.add(new FacilityReservationDTO(entity));
		}

		return list;
	}

	// facilityId로 데이터 검색
	public List<FacilityReservationDTO> getListByFacilityId(int facilityId) {
		List<FacilityReservations> entityList = facilityReservationsRepository.findByFacilityId(facilityId);
		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations facilityreservations : entityList) {
			list.add(new FacilityReservationDTO(facilityreservations));
		}
		return list;
	}

	// facilityId로 데이터 검색, 페이징 적용
	public List<FacilityReservationDTO> getListByFacilityIdWithPaging(int facilityId, int page, int size) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "reservationDate"));
//		Page<FacilityReservations> entityList = facilityReservationsRepository
//				.findByReservationFacilityId_FacilityId(facilityId, pageable);
		Page<FacilityReservations> entityList = facilityReservationsRepository
				.findByReservationFacilityId_FacilityIdAndReservationEndTimeAfter(facilityId, LocalDateTime.now(),
						pageable);
		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations entity : entityList) {
			list.add(new FacilityReservationDTO(entity));
		}

		return list;
	}

	// facilityId에 포함된 데이터 중 검색
	public List<FacilityReservationDTO> getListSearchByFacilityId(int facilityId, String searchField,
			String searchWord) {
		Sort sort = Sort.by(Sort.Direction.ASC, "reservationDate");
		List<FacilityReservations> entityList = null;
		switch (searchField) {
		case "reservationEmployeeName":
			entityList = facilityReservationsRepository
					.findByReservationFacilityId_FacilityIdAndReservationEmployeeId_nameLike(facilityId,
							"%" + searchWord + "%", sort);
			break;
		}
		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations facilityReservation : entityList) {
			list.add(new FacilityReservationDTO(facilityReservation));
		}
		return list;
	}

	// facilityId에 포함된 데이터 중 검색, 페이징 적용
	public List<FacilityReservationDTO> getListSearchByFacilityIdWithPaging(int facilityId, String searchField,
			String searchWord, int page, int size) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "reservationDate"));
		Page<FacilityReservations> entityList = Page.empty();

		switch (searchField) {
		case "reservationEmployeeName":
			entityList = facilityReservationsRepository
					.findByReservationFacilityId_FacilityIdAndReservationEmployeeId_nameLikeAndReservationEndTimeAfter(
							facilityId, "%" + searchWord + "%", LocalDateTime.now(), pageable);
			break;
		}
		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations facilityReservation : entityList) {
			list.add(new FacilityReservationDTO(facilityReservation));
		}
		return list;
	}

	// 검색어로 데이터 검색
	public List<FacilityReservationDTO> getListSearch(String searchField, String searchWord) {
		List<FacilityReservations> entityList = null;
		switch (searchField) {
		case "reservationEmployeeName":
			entityList = facilityReservationsRepository
					.findByReservationEmployeeId_nameLike("%" + searchWord + "%");
			break;
		case "reservationEmployeeId":
			// 나중에 varchar바꿨다면 걍 String으로
			entityList = facilityReservationsRepository
					.findByReservationEmployeeId_employeeId(Integer.parseInt(searchWord));
			break;
		}
		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations facilities : entityList) {
			list.add(new FacilityReservationDTO(facilities));
		}

		return list;
	}

	// 검색어로 데이터 검색, 페이징 적용
	public List<FacilityReservationDTO> getListSearchWithPaging(String searchField, String searchWord, int page,
			int size) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "reservationDate"));
		Page<FacilityReservations> entityList = Page.empty();

		switch (searchField) {
		case "reservationEmployeeName":
			entityList = facilityReservationsRepository
					.findByReservationEmployeeId_nameLike("%" + searchWord + "%", pageable);
			break;
		case "reservationEmployeeId":
			// 나중에 varchar바꿨다면 걍 String으로
			// 최신 예약부터
			pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "reservationDate"));
			entityList = facilityReservationsRepository
					.findByReservationEmployeeId_employeeId(Integer.parseInt(searchWord), pageable);
			break;
		}

		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations entity : entityList) {
			list.add(new FacilityReservationDTO(entity));
		}

		return list;
	}

	public List<FacilityReservationDTO> getListSearchScheduledWithPaging(String searchField, String searchWord,
			int page, int size) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "reservationDate"));
		Page<FacilityReservations> entityList = Page.empty();

		switch (searchField) {
		case "reservationEmployeeName":
			entityList = facilityReservationsRepository
					.findSearchEmployeeNameScheduleReservation("%" + searchWord + "%", LocalDateTime.now(), pageable);
			break;
		}

		List<FacilityReservationDTO> list = new ArrayList<>();
		for (FacilityReservations entity : entityList) {
			list.add(new FacilityReservationDTO(entity));
		}

		return list;
	}

	public Long count() {
		return facilityReservationsRepository.count();
	}

	public Long count(String searchField, String searchWord) {
		switch (searchField) {
		case "reservationEmployeeName":
			return facilityReservationsRepository.countByReservationEmployeeId_nameLike("%" + searchWord + "%");
		case "reservationEmployeeId":
			// 나중에 varchar바꿨다면 걍 String으로
			return facilityReservationsRepository
					.countByReservationEmployeeId_employeeId(Integer.parseInt(searchWord));
		}

		return (long) 0;
	}

	public Long countByfacilityId(int facilityId) {
		return facilityReservationsRepository.countByReservationFacilityId_FacilityId(facilityId);
	}

	public Long searchCountByfacilityId(int facilityId, String searchField, String searchWord) {
		switch (searchField) {
		case "reservationEmployeeName":
			return facilityReservationsRepository
					.countByReservationFacilityId_FacilityIdAndReservationEmployeeId_nameLike(facilityId,
							"%" + searchWord + "%");
		}

		return (long) 0;
	}

	public Long scheduledCount() {
		return facilityReservationsRepository.countByReservationEndTimeAfter(LocalDateTime.now());
	}

	public Long searchScheduledCount(String searchField, String searchWord) {
		switch (searchField) {
		case "reservationEmployeeName":
			return facilityReservationsRepository
					.countByReservationEmployeeId_nameLikeAndReservationEndTimeAfter("%" + searchWord + "%",
							LocalDateTime.now());
		}
		return (long) 0;
	}

	public int deleteReservation(int reservationId) {
		facilityReservationsRepository.delete(facilityReservationsRepository.findById(reservationId).get());
		return 1;
	}
}
