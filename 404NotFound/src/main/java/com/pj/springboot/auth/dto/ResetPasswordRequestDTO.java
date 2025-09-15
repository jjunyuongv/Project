package com.pj.springboot.auth.dto;

import lombok.Data;

@Data
public class ResetPasswordRequestDTO {
    private String loginId;
    private String email;
    private String newPassword;
    private String authCode;
}