package com.pj.springboot.auth.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
// [reCAPTCHA] 헤더/쿼리 토큰도 허용할 수 있게 추가
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pj.springboot.auth.EmployeeEntity;
import com.pj.springboot.auth.dto.EmployeeDTO;
import com.pj.springboot.auth.dto.LoginDTO;
import com.pj.springboot.auth.dto.ResetPasswordRequestDTO;
import com.pj.springboot.auth.service.EmployeeService;
import com.pj.springboot.facilities.dto.FacilityEmployeeDTO;
import com.pj.springboot.recaptcha.service.RecaptchaService;

// [reCAPTCHA] 추가 import 시작
import jakarta.servlet.http.HttpServletRequest;
// [reCAPTCHA] 추가 import 끝
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://notfound.p-e.kr", allowCredentials = "true")
public class EmployeeController {

	@Autowired
	private final EmployeeService employeeService;

	// [reCAPTCHA] DI 필드 추가 (기존 코드 보존)
	private final RecaptchaService recaptchaService;

	@PostMapping("/signup")
	public ResponseEntity<String> signup(@RequestBody EmployeeDTO dto,

			// [reCAPTCHA] 추가: 헤더/쿼리로도 토큰을 받을 수 있게 허용 (프론트 유연성)
			@RequestHeader(value = "X-Recaptcha-Token", required = false) String recaptchaHeaderToken,
			@RequestParam(value = "recaptchaToken", required = false) String recaptchaQueryToken,

			// [reCAPTCHA] 추가: remoteIp 얻기 위해 요청객체 주입
			HttpServletRequest request) {
		try {
			// [reCAPTCHA] 시작: 토큰 추출(헤더 → 쿼리 → DTO에 필드가 있다면 리플렉션으로)
			String token = (recaptchaHeaderToken != null && !recaptchaHeaderToken.isBlank()) ? recaptchaHeaderToken
					: recaptchaQueryToken;

			if (token == null || token.isBlank()) {
				try {
					// DTO에 getRecaptchaToken()이 존재하면(추가되어 있다면) 읽어옴.
					var m = dto.getClass().getMethod("getRecaptchaToken");
					Object val = m.invoke(dto);
					if (val != null)
						token = String.valueOf(val);
				} catch (NoSuchMethodException ignored) {
					// DTO에 필드가 없으면 조용히 무시
				} catch (Exception ignored) {
				}
			}

			// 토큰 검증
			if (!recaptchaService.verify(token, request.getRemoteAddr())) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("reCAPTCHA failed");
			}
			// [reCAPTCHA] 끝

			employeeService.signup(dto);
			return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공!");
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginDTO dto, HttpSession session) {
		try {
			EmployeeDTO loggedInUser = employeeService.login(dto);
			session.setAttribute("employeeId", loggedInUser.getEmployeeId());
			session.setAttribute("employeeName", loggedInUser.getName());
			session.setAttribute("loggedInUser", loggedInUser);
			return ResponseEntity.ok(loggedInUser);
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
		}
	}

	@PostMapping("/reset-password")
	public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
		try {
			employeeService.resetPassword(request);
			return ResponseEntity.ok("비밀번호가 성공적으로 재설정되었습니다.");
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("비밀번호 재설정에 실패했습니다.");
		}
	}

	@PostMapping("/find-id")
	public ResponseEntity<Map<String, String>> findId(@RequestBody Map<String, String> request) {
		String name = request.get("name");
		String email = request.get("email");

		if (name == null || email == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "이름과 이메일을 입력해주세요."));
		}

		String foundId = employeeService.findIdByNameAndEmail(name, email);

		if (foundId != null) {
			return ResponseEntity.ok(Map.of("foundId", foundId));
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "일치하는 아이디가 없습니다."));
		}
	}

	@GetMapping("/session-check")
	public ResponseEntity<?> sessionCheck(HttpSession session) {
		Object loggedInUser = session.getAttribute("loggedInUser");
		if (loggedInUser != null) {
			return ResponseEntity.ok(loggedInUser);
		} else {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("로그인 필요");
		}
	}

	// PUT /update-info
	@PutMapping("/update-info")
	public ResponseEntity<?> updateInfo(@RequestBody Map<String, Object> requestBody, HttpSession session) {
		try {
			// 세션 체크
			Object loggedInUser = session.getAttribute("loggedInUser");
			if (loggedInUser == null) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("로그인 필요");
			}

			String loginId = ((EmployeeDTO) loggedInUser).getLoginId();

			// 프론트에서 전달된 currentPassword 추출
			String currentPassword = (String) requestBody.get("currentPassword");
			if (currentPassword == null || currentPassword.isEmpty()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("현재 비밀번호를 입력해주세요.");
			}

			// 🔹 비밀번호 비교를 위해 Entity 조회
			EmployeeEntity dbEntity = employeeService.getEmployeeEntityByLoginId(loginId);
			if (!employeeService.passwordMatches(currentPassword, dbEntity.getPassword())) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("현재 비밀번호가 일치하지 않습니다.");
			}

			// 기존 사용자 DTO 가져오기
			EmployeeDTO existingUser = employeeService.getEmployeeByLoginId(loginId);

			// null 체크 후 업데이트
			if (requestBody.get("name") != null)
				existingUser.setName((String) requestBody.get("name"));
			if (requestBody.get("gender") != null)
				existingUser.setGender((String) requestBody.get("gender"));
			if (requestBody.get("loginId") != null)
				existingUser.setLoginId((String) requestBody.get("loginId"));
			if (requestBody.get("address") != null)
				existingUser.setAddress((String) requestBody.get("address"));
			if (requestBody.get("phone") != null)
				existingUser.setPhone((String) requestBody.get("phone"));
			if (requestBody.get("department") != null)
				existingUser.setDepartment((String) requestBody.get("department"));
			if (requestBody.get("job") != null)
				existingUser.setJob((String) requestBody.get("job"));

			// 서비스 호출
			employeeService.updateEmployeeInfo(loginId, existingUser, currentPassword);

			// 세션 갱신
			session.setAttribute("loggedInUser", existingUser);

			return ResponseEntity.ok(existingUser);

		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("정보 수정 실패");
		}
	}

	@PutMapping("/update-password")
	public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> requestBody, HttpSession session) {
		try {
			Object loggedInUser = session.getAttribute("loggedInUser");
			if (loggedInUser == null) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("로그인 필요");
			}

			String loginId = ((EmployeeDTO) loggedInUser).getLoginId();
			String currentPassword = requestBody.get("currentPassword");
			String newPassword = requestBody.get("newPassword");

			if (currentPassword == null || newPassword == null) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("모든 항목을 입력해주세요.");
			}

			employeeService.updatePassword(loginId, currentPassword, newPassword);
			return ResponseEntity.ok("비밀번호가 변경되었습니다.");

		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("비밀번호 변경 실패");
		}
	}

	// 사원 데이터 개수
	@GetMapping("/count")
	public Long searchCount(@RequestParam(required = false, name = "searchField") String searchField,
			@RequestParam(required = false, name = "searchWord") String searchWord) {
		return employeeService.count(searchField, searchWord);
	}

	// 사원 모든 정보 리스트
	@GetMapping()
	public ResponseEntity<List<FacilityEmployeeDTO>> list(@RequestParam(required = false, name = "searchField") String searchField,
			@RequestParam(required = false, name = "searchWord") String searchWord, @RequestParam(defaultValue = "1", name = "page") int page,
			@RequestParam(defaultValue = "5", name = "size") int size) {
		return ResponseEntity.ok(employeeService.getList(searchField, searchWord, page, size, "FULL"));
	}

	// modal창에서 보여줄 정보 리스트
	@GetMapping("/modal")
	public ResponseEntity<List<FacilityEmployeeDTO>> listModal(@RequestParam(required = false, name = "searchField") String searchField,
			@RequestParam(required = false, name = "searchWord") String searchWord, @RequestParam(defaultValue = "1", name = "page") int page,
			@RequestParam(defaultValue = "5", name = "size") int size) {
		return ResponseEntity.ok(employeeService.getList(searchField, searchWord, page, size, "MODAL"));
	}
}
