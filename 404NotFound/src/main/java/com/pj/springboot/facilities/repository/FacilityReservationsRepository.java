package com.pj.springboot.facilities.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pj.springboot.facilities.FacilityReservations;

@Repository
public interface FacilityReservationsRepository extends JpaRepository<FacilityReservations, Integer> {

	@Query("SELECT fr FROM FacilityReservations fr JOIN FETCH fr.reservationEmployeeId "
			+ " WHERE fr.reservationFacilityId.facilityId = :facilityId")
	List<FacilityReservations> findByFacilityId(@Param("facilityId") int facilityId);

	@EntityGraph(attributePaths = { "reservationEmployeeId" })
	Page<FacilityReservations> findByReservationFacilityId_FacilityId(int facilityId, Pageable pageable);

	@EntityGraph(attributePaths = { "reservationEmployeeId" })
	List<FacilityReservations> findByReservationEmployeeId_nameLike(String employeeName);

	Long countByReservationEmployeeId_nameLike(String employeeName);

	@EntityGraph(attributePaths = { "reservationEmployeeId" })
	Page<FacilityReservations> findByReservationEmployeeId_nameLike(String employeeName, Pageable pageable);

	@EntityGraph(attributePaths = { "reservationEmployeeId" })
	List<FacilityReservations> findByReservationFacilityId_FacilityIdAndReservationEmployeeId_nameLike(
			int facilityId, String employeeName, Sort sort);

	Page<FacilityReservations> findByReservationFacilityId_FacilityIdAndReservationEmployeeId_nameLike(
			int facilityId, String employeeName, Pageable pageable);

	Long countByReservationFacilityId_FacilityId(int facilityId);

	Long countByReservationFacilityId_FacilityIdAndReservationEmployeeId_nameLike(int facilityId,
			String string);

	Page<FacilityReservations> findByReservationFacilityId_FacilityIdAndReservationEndTimeAfter(int facilityId,
			LocalDateTime now, Pageable pageable);

	Page<FacilityReservations> findByReservationFacilityId_FacilityIdAndReservationEmployeeId_nameLikeAndReservationEndTimeAfter(
			int facilityId, String employeeName, LocalDateTime now, Pageable pageable);

	// 결재 처리 할때 보여주는 리스트
	// 대기우선 정렬 후 작성일이 빠른 기준
	@EntityGraph(attributePaths = { "reservationEmployeeId", "reservationFacilityId" })
	@Query(" SELECT fr FROM FacilityReservations fr WHERE fr.reservationEndTime > :now "
			+ " ORDER BY CASE fr.reservationStatus " + "WHEN '대기' THEN 1 ELSE 2 END, fr.reservationDate ")
	Page<FacilityReservations> findScheduleReservation(@Param("now") LocalDateTime now, Pageable pageable);

	Long countByReservationEndTimeAfter(LocalDateTime now);

	Long countByReservationEmployeeId_nameLikeAndReservationEndTimeAfter(@Param("employeeName") String employeeName,
			@Param("now") LocalDateTime now);

	// 결재 처리 할때 보여주는 리스트
	// 대기우선 정렬 후 작성일이 빠른 기준
	@EntityGraph(attributePaths = { "reservationEmployeeId", "reservationFacilityId" })
	@Query(" SELECT fr FROM FacilityReservations fr " + " WHERE fr.reservationEndTime > :now "
			+ " AND fr.reservationEmployeeId.name LIKE :employeeName "
			+ " ORDER BY CASE fr.reservationStatus " + "WHEN '대기' THEN 1 ELSE 2 END, fr.reservationDate ")
	Page<FacilityReservations> findSearchEmployeeNameScheduleReservation(@Param("employeeName") String employeeName, @Param("now") LocalDateTime now,
			Pageable pageable);

	// 사번 varchar라면 String으로
	List<FacilityReservations> findByReservationEmployeeId_employeeId(int employeeId);

	Page<FacilityReservations> findByReservationEmployeeId_employeeId(int employeeId, Pageable pageable);

	Long countByReservationEmployeeId_employeeId(int employeeId);
}
