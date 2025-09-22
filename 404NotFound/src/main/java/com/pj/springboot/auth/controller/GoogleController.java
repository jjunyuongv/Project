package com.pj.springboot.auth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pj.springboot.auth.dto.EmployeeDTO;
import com.pj.springboot.auth.service.GoogleService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class GoogleController {

    @Autowired
    private GoogleService googleService;

    // ---------------------------
    // 구글 로그인
    // ---------------------------
    @PostMapping("/google")
    public ResponseEntity<EmployeeDTO> googleLogin(@RequestBody Map<String, String> body, HttpSession session) {
        try {
            String code = body.get("code");
            EmployeeDTO user = googleService.getUserInfo(code);

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
