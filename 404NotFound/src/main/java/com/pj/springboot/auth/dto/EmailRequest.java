package com.pj.springboot.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {
    private String name;   // findId 모드일 때 사용
    private String email;  // 필수
    private String mode;   // "findId", "resetPassword" 등
}