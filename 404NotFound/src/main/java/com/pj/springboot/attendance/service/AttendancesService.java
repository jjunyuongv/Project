package com.pj.springboot.attendance.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.pj.springboot.attendance.dto.AttendanceDTO;
import com.pj.springboot.attendance.dto.AttendanceStatDTO;
import com.pj.springboot.attendance.entity.Attendances;
import com.pj.springboot.attendance.repository.AttendancesRepository;
import com.pj.springboot.auth.EmployeeEntity;
import com.pj.springboot.auth.repository.EmployeeRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class AttendancesService {
	@Autowired
	AttendancesRepository attendancesRepository;

	@Autowired
	EmployeeRepository employeeRepository;

	// 오전 9시마다 서버가 켜져있으면 자동으로 오늘 근태 정보 사원별로 insert
	@Scheduled(cron = "0 0 9 * * ?")
	public int insertTodayAttendances() {
		// 추가되어있는 직원을 제외한 직원 근태 정보 추가
		LocalDate today = LocalDate.now();
		List<Attendances> exist = attendancesRepository.findByAttendanceDate(today);
		List<Integer> existId = new ArrayList<>();
		for (Attendances attendance : exist) {
			existId.add(attendance.getAttendanceEmployeeId().getEmployeeId());
		}
		List<EmployeeEntity> entityList = employeeRepository.findAll();
		List<Attendances> saveList = new ArrayList<>();
		for (EmployeeEntity employee : entityList) {
			if (existId.contains(employee.getEmployeeId()))
				continue;
			Attendances entity = new Attendances();
			entity.setAttendanceDate(today);
			entity.setAttendanceEmployeeId(employee);
			entity.setAttendanceStatus("결근");
			saveList.add(entity);
		}
		attendancesRepository.saveAll(saveList);
		return 1;
	}

	// 상태 변경
	public int updateAttendance(long attendanceId, AttendanceDTO dto) {
		Attendances entity = attendancesRepository.findById(attendanceId).get();
		entity.setAttendanceStatus(dto.getAttendanceStatus());
		entity.setAttendanceEditEmployeeId(employeeRepository.getReferenceById(dto.getAttendanceEditEmployeeId()));
		entity.setAttendanceReason(dto.getAttendanceReason());
		attendancesRepository.save(entity);
		return 1;
	}

	// 출근 버튼
	public int checkIn(int employeeId) {
		Attendances entity = attendancesRepository
				.findByAttendanceDateAndAttendanceEmployeeId_EmployeeId(LocalDate.now(), employeeId);
		// 오전 9시 이후에 출근시 지각으로
		if (LocalTime.now().isAfter(LocalTime.of(9, 0))) {
			entity.setAttendanceStatus("지각");
		} else {
			entity.setAttendanceStatus("출근");
		}
		entity.setAttendanceStart(LocalTime.now());
		attendancesRepository.save(entity);
		return 1;
	}

	// 퇴근 버튼
	public int checkOut(int employeeId) {
		Attendances entity = attendancesRepository
				.findByAttendanceDateAndAttendanceEmployeeId_EmployeeId(LocalDate.now(), employeeId);
		// 지각일때는 퇴근후에도 지각으로
		if (!entity.getAttendanceStatus().equals("지각")) {
			// 오후 6시 이전에 퇴근시 조퇴로
			if (LocalTime.now().isBefore(LocalTime.of(18, 0))) {
				entity.setAttendanceStatus("조퇴");
			} else {
				entity.setAttendanceStatus("퇴근");
			}
		}
		entity.setAttendanceEnd(LocalTime.now());
		attendancesRepository.save(entity);
		return 1;
	}

	public AttendanceDTO getOne(int employeeId) {
		Attendances entity = attendancesRepository
				.findByAttendanceDateAndAttendanceEmployeeId_EmployeeId(LocalDate.now(), employeeId);
		return entity != null ? new AttendanceDTO(entity) : null;
	}

	// 근태 리스트 검색, 페이징 적용
	public List<AttendanceDTO> getList(LocalDate date, int page, int size, String searchField, String searchWord) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "attendanceId"));
		Page<Attendances> entityList = Page.empty();
		List<AttendanceDTO> list = new ArrayList<>();
		if (searchWord == null || searchWord.trim().isEmpty() || searchField == null) {
			if (date == null) {
				entityList = attendancesRepository.findAll(pageable);
			} else {
				entityList = attendancesRepository.findByAttendanceDate(date, pageable);
			}
		} else {
			if (date == null) {
				switch (searchField) {
				case "employeeName":
					entityList = attendancesRepository.findByAttendanceEmployeeId_NameLike("%" + searchWord + "%",
							pageable);
					break;
				case "employeeId":
					entityList = attendancesRepository
							.findByAttendanceEmployeeId_EmployeeId(Integer.parseInt(searchWord), pageable);
					break;
				case "attendanceStatus":
					entityList = attendancesRepository.findByAttendanceStatusLike("%" + searchWord + "%", pageable);
					break;
				}
			} else {
				switch (searchField) {
				case "employeeName":
					entityList = attendancesRepository.findByAttendanceDateAndAttendanceEmployeeId_NameLike(date,
							"%" + searchWord + "%", pageable);
					break;
				case "employeeId":
					entityList = attendancesRepository.findByAttendanceDateAndAttendanceEmployeeId_EmployeeId(date,
							Integer.parseInt(searchWord), pageable);
					break;
				case "attendanceStatus":
					entityList = attendancesRepository.findByAttendanceDateAndAttendanceStatusLike(date,
							"%" + searchWord + "%", pageable);
					break;
				}
			}
		}
		list = new ArrayList<>();
		for (Attendances entity : entityList) {
			list.add(new AttendanceDTO(entity));
		}
		return list;
	}

	// 월별 통계 리스트
	public List<AttendanceStatDTO> getStatList(LocalDate start, LocalDate end, String searchField, String searchWord,
			int page, int size) {
		Pageable pageable = PageRequest.of(page - 1, size,
				Sort.by(Sort.Direction.ASC, "attendanceEmployeeId.employeeId"));
		if (searchWord == null || searchWord.trim().isEmpty() || searchField == null) {
			return attendancesRepository.getStats(start, end, pageable).getContent();
		} else {
			switch (searchField) {
			case "employeeName":
				return attendancesRepository
						.getStatsByAttendanceEmployeeId_NameLike(start, end, "%" + searchWord + "%", pageable)
						.getContent();
			case "employeeId":
				try {
					return attendancesRepository.getStatsByAttendanceEmployeeId_EmployeeId(start, end,
							Integer.parseInt(searchWord), pageable).getContent();
				} catch (Exception e) {
					return new ArrayList<>();
				}
			default:
				return attendancesRepository.getStats(start, end, pageable).getContent();
			}
		}
	}

	// 근태 정보 개수
	public long count(LocalDate date, String searchField, String searchWord) {
		if (searchWord == null || searchWord.trim().isEmpty()) {
			if (date == null) {
				return attendancesRepository.count();
			} else {
				return attendancesRepository.countByAttendanceDate(date);
			}
		} else {

			if (date == null) {
				switch (searchField) {
				case "employeeName":
					return attendancesRepository.countByAttendanceEmployeeId_NameLike("%" + searchWord + "%");
				case "employeeId":
					try {
						return attendancesRepository
								.countByAttendanceEmployeeId_EmployeeId(Integer.parseInt(searchWord));
					} catch (Exception e) {
						return 0;
					}
				case "attendanceStatus":
					return attendancesRepository.countByAttendanceStatusLike("%" + searchWord + "%");
				}
			} else {
				switch (searchField) {
				case "employeeName":
					return attendancesRepository.countByAttendanceDateAndAttendanceEmployeeId_NameLike(date,
							"%" + searchWord + "%");
				case "employeeId":
					return attendancesRepository.countByAttendanceDateAndAttendanceEmployeeId_EmployeeId(date,
							Integer.parseInt(searchWord));
				case "attendanceStatus":
					return attendancesRepository.countByAttendanceDateAndAttendanceStatusLike(date,
							"%" + searchWord + "%");
				}
			}
		}

		return (long) 0;
	}

	// 월별 통계 개수
	public long getStatCount(LocalDate start, LocalDate end, String searchField, String searchWord) {
		if (searchWord == null || searchWord.trim().isEmpty() || searchField == null) {
			return attendancesRepository.countByAttendanceDateBetween(start, end);
		} else {
			switch (searchField) {
			case "employeeName":
				return attendancesRepository.countByAttendanceEmployeeId_NameLikeAndAttendanceDateBetween(
						"%" + searchWord + "%", start, end);
			case "employeeId":
				try {
					return attendancesRepository.countByAttendanceEmployeeId_EmployeeIdAndAttendanceDateBetween(
							Integer.parseInt(searchWord), start, end);
				} catch (Exception e) {
					return 0;
				}
			}
		}
		return (long) 0;
	}
}
