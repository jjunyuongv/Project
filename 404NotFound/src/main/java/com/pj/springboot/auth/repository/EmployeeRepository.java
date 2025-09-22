package com.pj.springboot.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pj.springboot.auth.EmployeeEntity;

public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Integer> {
	boolean existsByLoginId(String loginId);

	boolean existsByEmail(String email);
	
	boolean existsByLoginIdAndEmail(String loginId, String email);

	@Query("SELECT COUNT(e) FROM EmployeeEntity e WHERE FUNCTION('YEAR', e.createDate) = :year")
	long countByYear(@Param("year") int year);

	Optional<EmployeeEntity> findByLoginId(String loginId);

	Optional<EmployeeEntity> findByNameAndEmail(String name, String email);
	
	Optional<EmployeeEntity> findByKakaoId(String kakaoId); // 추가
	
	Optional<EmployeeEntity> findByGoogleId(String googleId); // 구글용
	
	// 로그인 아이디와 이메일로 사용자를 찾는 메서드
	Optional<EmployeeEntity> findByLoginIdAndEmail(String loginId, String email);
	
	Optional<EmployeeEntity> findByEmail(String email);
	
	// 현준 추가
	List<EmployeeEntity> findByNameLike(String employeeName);

	Long countByNameLike(String employeeName);

	Page<EmployeeEntity> findByNameLike(String employeeName, Pageable pageable);
}
