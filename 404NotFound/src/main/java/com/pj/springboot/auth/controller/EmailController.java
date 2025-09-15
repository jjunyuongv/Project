package com.pj.springboot.auth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pj.springboot.auth.service.EmailAuthService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailAuthService emailAuthService;

    // ✅ 이메일로 인증 코드 전송 요청
    @PostMapping("/send-auth-code")
    public ResponseEntity<?> sendAuthCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body("이메일을 입력해주세요.");
        }
        try {
            emailAuthService.sendAuthEmail(email);
            return ResponseEntity.ok("인증번호가 발송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("이메일 전송에 실패했습니다: " + e.getMessage());
        }
    }

    // ✅ 인증 코드 확인 요청
    @PostMapping("/verify-auth-code")
    public ResponseEntity<?> verifyAuthCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String authCode = request.get("authCode");

        if (email == null || authCode == null) {
            return ResponseEntity.badRequest().body("이메일 또는 인증 코드를 입력해주세요.");
        }
        
        try {
            // 이메일 서비스에서 예외가 발생할 수 있으므로 try-catch 블록으로 감싸줍니다.
            if (emailAuthService.verifyAuthCode(email, authCode)) {
                 // 인증 성공
                 return ResponseEntity.ok(Map.of("success", true, "message", "인증이 완료되었습니다."));
            } else {
                 // 인증 실패 (EmailAuthService에서 예외를 던지지 않았을 때)
                 return ResponseEntity.status(400).body(Map.of("success", false, "message", "인증번호가 일치하지 않습니다."));
            }
        } catch (RuntimeException e) {
            // 인증 실패 (시간 초과, 코드 불일치 등)
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
