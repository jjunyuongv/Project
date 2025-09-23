package com.pj.springboot.auth.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pj.springboot.auth.EmployeeEntity;
import com.pj.springboot.auth.dto.EmployeeDTO;
import com.pj.springboot.auth.dto.LoginDTO;
import com.pj.springboot.auth.dto.ResetPasswordRequestDTO;
import com.pj.springboot.auth.repository.EmployeeRepository;
import com.pj.springboot.facilities.dto.FacilityEmployeeDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeService {

	private final EmployeeRepository repository;
	private final PasswordEncoder passwordEncoder;
	private final EmailAuthService emailAuthService;

	@Transactional
	public synchronized String generateEmployeeId() {
		int year = LocalDate.now().getYear();
		long count = repository.countByYear(year) + 1;
		return String.valueOf(year) + String.format("%04d", count);
	}

	public EmployeeEntity signup(EmployeeDTO dto) {
		if (repository.existsByLoginId(dto.getLoginId())) {
			throw new RuntimeException("이미 존재하는 아이디입니다.");
		}
		if (repository.existsByEmail(dto.getEmail())) {
			throw new RuntimeException("이미 존재하는 이메일입니다.");
		}

		String role = "USER"; // 기본값
		String job = dto.getJob();
		if ("기장".equals(job) || "사무장".equals(job) || "지상 관리자".equals(job)) {
			role = "MANAGER";
		}

		EmployeeEntity emp = EmployeeEntity.builder().employeeId(Integer.parseInt(generateEmployeeId()))
				.loginId(dto.getLoginId()).name(dto.getName()).email(dto.getEmail())
				.password(passwordEncoder.encode(dto.getPassword())).address(dto.getAddress()).phone(dto.getPhone())
				.department(dto.getDepartment()).job(dto.getJob()).gender(dto.getGender())
				.createDate(LocalDateTime.now()).role(role).build();

		return repository.save(emp);
	}

	public EmployeeDTO login(LoginDTO dto) {
		EmployeeEntity employee = repository.findByLoginId(dto.getLoginId())
				.orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

		if (!passwordEncoder.matches(dto.getPassword(), employee.getPassword())) {
			throw new RuntimeException("비밀번호가 일치하지 않습니다.");
		}

		return EmployeeDTO.builder().employeeId(String.valueOf(employee.getEmployeeId())).name(employee.getName())
				.loginId(employee.getLoginId()).email(employee.getEmail()).phone(employee.getPhone())
				.address(employee.getAddress()).gender(employee.getGender()).department(employee.getDepartment())
				.job(employee.getJob()).role(employee.getRole()).build();
	}

	public String findIdByNameAndEmail(String name, String email) {
		EmployeeEntity employee = repository.findByNameAndEmail(name, email)
				.orElseThrow(() -> new RuntimeException("일치하는 사용자 정보가 없습니다."));
		return employee.getLoginId();
	}

	@Transactional(readOnly = true)
	public EmployeeEntity findByEmail(String email) {
		return repository.findByEmail(email).orElse(null);
	}

	@Transactional
	public EmployeeEntity save(EmployeeEntity user) {
		return repository.save(user);
	}

	@Transactional
	public void resetPassword(ResetPasswordRequestDTO request) {
		EmployeeEntity employee = repository.findByLoginIdAndEmail(request.getLoginId(), request.getEmail())
				.orElseThrow(() -> new RuntimeException("일치하는 사용자 정보를 찾을 수 없습니다."));

		if (!emailAuthService.verifyAuthCode(request.getEmail(), request.getAuthCode())) {
			throw new RuntimeException("인증 코드가 유효하지 않습니다.");
		}

		employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
		repository.save(employee);

		emailAuthService.removeAuthCode(request.getEmail());
	}

	@Transactional
	public void updatePassword(String loginId, String currentPassword, String newPassword) {
		EmployeeEntity employee = repository.findByLoginId(loginId)
				.orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

		if (!passwordEncoder.matches(currentPassword, employee.getPassword())) {
			throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
		}

		employee.setPassword(passwordEncoder.encode(newPassword));
		repository.save(employee);
	}

	public boolean passwordMatches(String rawPassword, String encodedPassword) {
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}

	// =======================
	// 카카오 로그인용 추가
	// =======================

	@Transactional(readOnly = true)
	public EmployeeEntity findByKakaoId(String kakaoId) {
		return repository.findByKakaoId(kakaoId).orElse(null);
	}

	@Transactional
	public EmployeeEntity saveKakaoUser(EmployeeEntity user) {
		EmployeeEntity existing = findByKakaoId(user.getKakaoId());
		if (existing != null)
			return existing; // 이미 존재하면 반환
		return repository.save(user);
	}

	@Transactional(readOnly = true)
	public EmployeeEntity findByGoogleId(String googleId) {
		return repository.findByGoogleId(googleId).orElse(null);
	}

	@Transactional
	public EmployeeEntity saveGoogleUser(EmployeeEntity user) {
		EmployeeEntity existing = findByGoogleId(user.getGoogleId());
		if (existing != null)
			return existing; // 이미 존재하면 반환
		return repository.save(user);
	}

	// 현준 추가

	@Transactional
	public Long count(String searchField, String searchWord) {
		if (searchWord == null || searchWord.trim().isEmpty() || searchField == null) {
			return repository.count();
		} else {
			switch (searchField) {
			case "employeeName":
				return repository.countByNameLike("%" + searchWord + "%");
			}
		}

		return (long) 0;
	}

	@Transactional
	public List<FacilityEmployeeDTO> getList(String searchField, String searchWord, int page, int size, String type) {
		Pageable pageable = PageRequest.of(page - 1, size);
		Page<EmployeeEntity> entityList = Page.empty();
		if (searchWord == null || searchWord.trim().isEmpty() || searchField == null) {
			entityList = repository.findAll(pageable);
		} else {
			switch (searchField) {
			case "employeeName":
				entityList = repository.findByNameLike("%" + searchWord + "%", pageable);
				break;
			}
		}
		List<FacilityEmployeeDTO> list = new ArrayList<>();
		for (EmployeeEntity entity : entityList) {
			list.add(new FacilityEmployeeDTO(entity, type));
		}

		return list;
	}
	// 현준 끝

	// =======================
	// MyPage 수정 기능 추가
	// =======================

	// 기존 EmployeeService 그대로 + 아래 메서드 2개 추가

	@Transactional
	public void updateEmployeeInfo(String loginId, EmployeeDTO dto, String currentPassword) {
		EmployeeEntity employee = repository.findByLoginId(loginId)
				.orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

		// ✅ 비밀번호 확인
		if (!passwordEncoder.matches(currentPassword, employee.getPassword())) {
			throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
		}

		// 기존 필드 업데이트
		employee.setName(dto.getName());
		employee.setLoginId(dto.getLoginId());
		employee.setGender(dto.getGender());
		employee.setDepartment(dto.getDepartment());
		employee.setJob(dto.getJob());
		employee.setAddress(dto.getAddress());
		employee.setPhone(dto.getPhone());

		repository.save(employee);
	}

	public EmployeeEntity getEmployeeEntityByLoginId(String loginId) {
		return repository.findByLoginId(loginId).orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));
	}

	public EmployeeDTO getEmployeeByLoginId(String loginId) {
		EmployeeEntity employee = repository.findByLoginId(loginId)
				.orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));
		return EmployeeDTO.builder().employeeId(String.valueOf(employee.getEmployeeId())).name(employee.getName())
				.loginId(employee.getLoginId()).email(employee.getEmail()).phone(employee.getPhone())
				.address(employee.getAddress()).gender(employee.getGender()).department(employee.getDepartment())
				.job(employee.getJob()).build();
	}
}
