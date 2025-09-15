package com.pj.springboot.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTO {
    private String loginId; // loginid → loginId로 CamelCase 통일
    private String password;
}