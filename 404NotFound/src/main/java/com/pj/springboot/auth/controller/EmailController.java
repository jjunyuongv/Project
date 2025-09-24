package com.pj.springboot.auth.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pj.springboot.auth.EmployeeEntity;
import com.pj.springboot.auth.dto.EmailRequest;
import com.pj.springboot.auth.repository.EmployeeRepository;
import com.pj.springboot.auth.service.EmailAuthService;

@CrossOrigin(origins = "http://notfound.p-e.kr")
@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailAuthService emailAuthService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @PostMapping("/send-auth-code")
    public ResponseEntity<?> sendAuthCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String loginId = request.get("loginId"); // ✅ 추가
        String mode = request.get("mode");

        if (email == null || mode == null) {
            return ResponseEntity.badRequest().body("잘못된 요청입니다.");
        }

        // 회원가입 → 이미 존재하는 이메일이면 거부
        if (mode.equals("signup") && employeeRepository.existsByEmail(email)) {
            return ResponseEntity.status(400).body("이미 가입된 이메일입니다.");
        }

        // 아이디 찾기 → 가입된 이메일이 없으면 거부
        if (mode.equals("findId")) {
            String name = request.get("name");
            if (name == null || name.isEmpty()) {
                return ResponseEntity.status(400).body("이름을 입력해주세요.");
            }
            Optional<EmployeeEntity> emp = employeeRepository.findByNameAndEmail(name, email);
            if (emp.isEmpty()) {
                return ResponseEntity.status(400).body("이름과 이메일이 일치하는 사용자가 없습니다.");
            }
        }
        
        // 비밀번호 재설정 → loginId와 email이 일치하는 사용자가 없으면 거부
        if (mode.equals("resetPassword")) {
            if (loginId == null || loginId.isEmpty()) {
                return ResponseEntity.status(400).body("아이디를 입력해주세요.");
            }
            boolean exists = employeeRepository.existsByLoginIdAndEmail(loginId, email);
            if (!exists) {
                return ResponseEntity.status(400).body("아이디와 이메일이 일치하는 사용자가 없습니다.");
            }
        }

        try {
            emailAuthService.sendAuthEmail(email);
            return ResponseEntity.ok("인증번호가 발송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("이메일 전송에 실패했습니다: " + e.getMessage());
        }
    }

    @PostMapping("/verify-auth-code")
    public ResponseEntity<?> verifyAuthCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String authCode = request.get("authCode");

        if (email == null || authCode == null) {
            return ResponseEntity.badRequest().body("이메일 또는 인증 코드를 입력해주세요.");
        }
        
        try {
            if (emailAuthService.verifyAuthCode(email, authCode)) {
                 return ResponseEntity.ok(Map.of("success", true, "message", "인증이 완료되었습니다."));
            } else {
                 return ResponseEntity.status(400).body(Map.of("success", false, "message", "인증번호가 일치하지 않습니다."));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/email/send-auth-code")
    public ResponseEntity<?> sendAuthCode(@RequestBody EmailRequest request) {
        // 예: findId 모드일 경우
        if ("findId".equals(request.getMode())) {
            Optional<EmployeeEntity> emp = employeeRepository.findByNameAndEmail(request.getName(), request.getEmail());
            if (emp.isEmpty()) {
                throw new RuntimeException("일치하는 사용자가 없습니다.");
            }
        }

        emailAuthService.sendAuthEmail(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "인증번호가 발송되었습니다."));
    }
}