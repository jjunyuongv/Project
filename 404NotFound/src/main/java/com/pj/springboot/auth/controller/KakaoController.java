package com.pj.springboot.auth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pj.springboot.auth.dto.EmployeeDTO;
import com.pj.springboot.auth.service.KakaoService;

@RestController
@RequestMapping("/api/auth")
public class KakaoController {

    @Autowired
    private KakaoService kakaoService;

    // ---------------------------
    // 카카오 로그인
    // ---------------------------
    @PostMapping("/kakao")
    public ResponseEntity<EmployeeDTO> kakaoLogin(@RequestBody Map<String, String> body) {
        try {
            String code = body.get("code"); // Map에서 code 가져오기
            EmployeeDTO user = kakaoService.getUserInfo(code);

            // 프론트에서 AuthContext로 바로 반영
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
