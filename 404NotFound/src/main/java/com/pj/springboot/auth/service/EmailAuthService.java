package com.pj.springboot.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailAuthService {

    @Autowired
    private JavaMailSender mailSender;

    private ConcurrentHashMap<String, AuthCodeEntry> authCodeStore = new ConcurrentHashMap<>();

    private static class AuthCodeEntry {
        private String code;
        private LocalDateTime expiryTime;

        public AuthCodeEntry(String code, LocalDateTime expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }

        public String getCode() { return code; }
        public LocalDateTime getExpiryTime() { return expiryTime; }
    }

    public String createAuthCode() {
        Random random = new Random();
        StringBuilder authCode = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            authCode.append(random.nextInt(10));
        }
        return authCode.toString();
    }

    public void sendAuthEmail(String email) {
        String authCode = createAuthCode();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);
        authCodeStore.put(email, new AuthCodeEntry(authCode, expiryTime));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("이메일 인증 안내");
        message.setText("안녕하세요. 인증번호는 [" + authCode + "] 입니다. 인증 유효 시간은 5분입니다.");
        mailSender.send(message);
    }

    // ✅ verifyAuthCode 성공 시 삭제하지 않고 reset-password 완료 시 삭제
    public boolean verifyAuthCode(String email, String authCode) {
        AuthCodeEntry storedEntry = authCodeStore.get(email);

        if (storedEntry == null) throw new RuntimeException("유효하지 않은 인증 코드입니다.");
        if (LocalDateTime.now().isAfter(storedEntry.getExpiryTime())) {
            authCodeStore.remove(email);
            throw new RuntimeException("인증 시간이 초과되었습니다.");
        }
        if (!storedEntry.getCode().equals(authCode)) throw new RuntimeException("인증 코드가 일치하지 않습니다.");

        // ✅ 여기서는 삭제하지 않음
        return true;
    }

    // reset-password 성공 후 호출하여 코드 삭제
    public void removeAuthCode(String email) {
        authCodeStore.remove(email);
    }
}
