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

		EmployeeEntity emp = EmployeeEntity.builder().employeeId(Integer.parseInt(generateEmployeeId()))
				.loginId(dto.getLoginId()).name(dto.getName()).email(dto.getEmail())
				.password(passwordEncoder.encode(dto.getPassword())).address(dto.getAddress()).phone(dto.getPhone())
				.createDate(LocalDateTime.now()).role("USER").build();

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
				.address(employee.getAddress()).build();
	}

	public String findIdByNameAndEmail(String name, String email) {
		EmployeeEntity employee = repository.findByNameAndEmail(name, email)
				.orElseThrow(() -> new RuntimeException("일치하는 사용자 정보가 없습니다."));
		return employee.getLoginId();
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

		// ✅ reset-password 완료 후 authCode 삭제
		emailAuthService.removeAuthCode(request.getEmail());
	}

	// 현준 추가
	// entity로 가져와 dto로 변환
	public List<FacilityEmployeeDTO> getList(String type) {
		List<EmployeeEntity> entityList = repository.findAll();
		List<FacilityEmployeeDTO> list = new ArrayList<>();
		for (EmployeeEntity entity : entityList) {
			list.add(new FacilityEmployeeDTO(entity, type));
		}
		return list;
	}

	public List<FacilityEmployeeDTO> getListSearch(String searchField, String searchWord, String type) {
		List<EmployeeEntity> entityList = null;
		switch (searchField) {
		case "employeeName":
			entityList = repository.findByNameLike("%" + searchWord + "%");
			break;
		}
		List<FacilityEmployeeDTO> list = new ArrayList<>();
		for (EmployeeEntity entity : entityList) {
			list.add(new FacilityEmployeeDTO(entity, type));
		}

		return list;
	}

	public Long count() {
		return repository.count();
	}

	public Long count(String searchField, String searchWord) {
		switch (searchField) {
		case "employeeName":
			return repository.countByNameLike("%" + searchWord + "%");
		}

		return (long) 0;
	}

	public List<FacilityEmployeeDTO> getListWithPaging(int page, int size, String type) {
		Pageable pageable = PageRequest.of(page - 1, size);
		Page<EmployeeEntity> entityList = repository.findAll(pageable);
		List<FacilityEmployeeDTO> list = new ArrayList<>();
		for (EmployeeEntity entity : entityList) {
			list.add(new FacilityEmployeeDTO(entity, type));
		}

		return list;
	}

	public List<FacilityEmployeeDTO> getListSearchWithPaging(String searchField, String searchWord, int page, int size,
			String type) {
		Pageable pageable = PageRequest.of(page - 1, size);
		Page<EmployeeEntity> entityList = Page.empty();

		switch (searchField) {
		case "employeeName":
			entityList = repository.findByNameLike("%" + searchWord + "%", pageable);
			break;
		}

		List<FacilityEmployeeDTO> list = new ArrayList<>();
		for (EmployeeEntity entity : entityList) {
			list.add(new FacilityEmployeeDTO(entity, type));
		}

		return list;
	}
}
