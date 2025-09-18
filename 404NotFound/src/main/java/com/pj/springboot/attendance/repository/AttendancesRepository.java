package com.pj.springboot.attendance.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.pj.springboot.attendance.dto.AttendanceStatDTO;
import com.pj.springboot.attendance.entity.Attendances;

@Repository
public interface AttendancesRepository extends JpaRepository<Attendances, Long> {

	@EntityGraph(attributePaths = { "attendanceEmployeeId", "attendanceEditEmployeeId" })
	List<Attendances> findAll();

	@EntityGraph(attributePaths = { "attendanceEmployeeId", "attendanceEditEmployeeId" })
	Page<Attendances> findByAttendanceDate(LocalDate date, Pageable pageable);

	long countByAttendanceDate(LocalDate date);

	long countByAttendanceEmployeeId_NameLike(String searchWord);

	long countByAttendanceDateAndAttendanceEmployeeId_NameLike(LocalDate date, String searchWord);

	long countByAttendanceEmployeeId_EmployeeId(int searchWord);

	long countByAttendanceDateAndAttendanceEmployeeId_EmployeeId(LocalDate date, int searchWord);

	long countByAttendanceStatusLike(String searchWord);

	long countByAttendanceDateAndAttendanceStatusLike(LocalDate date, String searchWord);

	@EntityGraph(attributePaths = { "attendanceEmployeeId", "attendanceEditEmployeeId" })
	Page<Attendances> findByAttendanceEmployeeId_NameLike(String employeeName, Pageable pageable);

	@EntityGraph(attributePaths = { "attendanceEmployeeId", "attendanceEditEmployeeId" })
	Page<Attendances> findByAttendanceDateAndAttendanceEmployeeId_NameLike(LocalDate date, String employeeName,
			Pageable pageable);

	@EntityGraph(attributePaths = { "attendanceEmployeeId", "attendanceEditEmployeeId" })
	Page<Attendances> findByAttendanceEmployeeId_EmployeeId(int employeeId, Pageable pageable);

	@EntityGraph(attributePaths = { "attendanceEmployeeId", "attendanceEditEmployeeId" })
	Page<Attendances> findByAttendanceDateAndAttendanceEmployeeId_EmployeeId(LocalDate date, int employeeId,
			Pageable pageable);

	@EntityGraph(attributePaths = { "attendanceEmployeeId", "attendanceEditEmployeeId" })
	Page<Attendances> findByAttendanceStatusLike(String searchWord, Pageable pageable);

	@EntityGraph(attributePaths = { "attendanceEmployeeId", "attendanceEditEmployeeId" })
	Page<Attendances> findByAttendanceDateAndAttendanceStatusLike(LocalDate date, String searchWord, Pageable pageable);

	@EntityGraph(attributePaths = { "attendanceEmployeeId", "attendanceEditEmployeeId" })
	Attendances findByAttendanceDateAndAttendanceEmployeeId_EmployeeId(LocalDate attendanceDate, int employeeId);

	@Query("SELECT new com.pj.springboot.attendance.dto.AttendanceStatDTO(" + " e.employeeId, " + " e.name, "
			+ " SUM(CASE WHEN a.attendanceStatus IN ('출근', '퇴근') THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '지각' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '조퇴' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '휴가' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '병가' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '결근' THEN 1 END) "
			+ " ) FROM Attendances a JOIN a.attendanceEmployeeId e "
			+ " WHERE a.attendanceDate BETWEEN :start AND :end " + " GROUP BY e.employeeId, e.name ")
	Page<AttendanceStatDTO> getStats(LocalDate start, LocalDate end, Pageable pageable);

	@Query("SELECT COUNT(DISTINCT e.employeeId) " + " FROM Attendances a JOIN a.attendanceEmployeeId e "
			+ " WHERE a.attendanceDate BETWEEN :start AND :end ")
	long countByAttendanceDateBetween(LocalDate start, LocalDate end);

	@Query("SELECT COUNT(DISTINCT e.employeeId) " + " FROM Attendances a JOIN a.attendanceEmployeeId e"
			+ " WHERE a.attendanceEmployeeId.name LIKE :employeeName AND a.attendanceDate BETWEEN :start AND :end ")
	long countByAttendanceEmployeeId_NameLikeAndAttendanceDateBetween(String employeeName, LocalDate start, LocalDate end);
	
	@Query("SELECT COUNT(DISTINCT e.employeeId) " + " FROM Attendances a JOIN a.attendanceEmployeeId e"
			+ " WHERE a.attendanceEmployeeId.employeeId = :employeeId AND a.attendanceDate BETWEEN :start AND :end ")
	long countByAttendanceEmployeeId_EmployeeIdAndAttendanceDateBetween(int employeeId, LocalDate start, LocalDate end);

	@Query("SELECT new com.pj.springboot.attendance.dto.AttendanceStatDTO(" + " e.employeeId, " + " e.name, "
			+ " SUM(CASE WHEN a.attendanceStatus IN ('출근', '퇴근') THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '지각' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '조퇴' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '휴가' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '병가' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '결근' THEN 1 END) "
			+ " ) FROM Attendances a JOIN a.attendanceEmployeeId e "
			+ " WHERE e.name LIKE :employeeName AND a.attendanceDate BETWEEN :start AND :end " + " GROUP BY e.employeeId, e.name ")
	Page<AttendanceStatDTO> getStatsByAttendanceEmployeeId_NameLike(LocalDate start, LocalDate end, String employeeName,
			Pageable pageable);

	@Query("SELECT new com.pj.springboot.attendance.dto.AttendanceStatDTO(" + " e.employeeId, " + " e.name, "
			+ " SUM(CASE WHEN a.attendanceStatus IN ('출근', '퇴근') THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '지각' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '조퇴' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '휴가' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '병가' THEN 1 END), "
			+ " SUM(CASE WHEN a.attendanceStatus = '결근' THEN 1 END) "
			+ " ) FROM Attendances a JOIN a.attendanceEmployeeId e "
			+ " WHERE e.employeeId = :employeeId AND a.attendanceDate BETWEEN :start AND :end " + " GROUP BY e.employeeId, e.name ")
	Page<AttendanceStatDTO> getStatsByAttendanceEmployeeId_EmployeeId(LocalDate start, LocalDate end, int employeeId,
			Pageable pageable);
}
