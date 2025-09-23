package com.pj.springboot.facilities.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pj.springboot.facilities.Facilities;

@Repository
public interface FacilitiesRepository extends JpaRepository<Facilities, Integer> {

	@Query("SELECT f FROM Facilities f JOIN FETCH f.facilityManagerId")
	List<Facilities> findAll();
	
	@Query("SELECT f FROM Facilities f JOIN FETCH f.facilityManagerId WHERE f.facilityName LIKE :facilityName")
	List<Facilities> findByFacilityNameLike(@Param("facilityName") String facilityName);

	@Query("SELECT f FROM Facilities f JOIN FETCH f.facilityManagerId WHERE f.facilityType LIKE :facilityType")
	List<Facilities> findByFacilityTypeLike(@Param("facilityType") String facilityType);

	Long countByFacilityNameLike(String facilityName);

	Long countByFacilityTypeLike(String facilityType);

	@Query(value = "SELECT f FROM Facilities f JOIN FETCH f.facilityManagerId WHERE f.facilityName LIKE :facilityName",
			countQuery = "SELECT COUNT(f) FROM Facilities f WHERE f.facilityName LIKE :facilityName")
	Page<Facilities> findByFacilityNameLike(@Param("facilityName") String facilityName, Pageable pageable);

	@Query(value = "SELECT f FROM Facilities f JOIN FETCH f.facilityManagerId WHERE f.facilityType LIKE :facilityType",
			countQuery = "SELECT COUNT(f) FROM Facilities f WHERE f.facilityType LIKE :facilityType")
	Page<Facilities> findByFacilityTypeLike(@Param("facilityType") String facilityType, Pageable pageable);
	
}
