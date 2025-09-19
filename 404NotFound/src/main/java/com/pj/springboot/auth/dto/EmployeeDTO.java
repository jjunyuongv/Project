package com.pj.springboot.auth.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {
    private String employeeId;
    private String name;
    private String loginId; // loginid → loginId
    private String email;
    private String password;
    private String address;
    private String phone;

    // ✅ 추가 필드
    private String department; // 부서
    private String job;      // 직무
    private String gender;
    private String role;
}
