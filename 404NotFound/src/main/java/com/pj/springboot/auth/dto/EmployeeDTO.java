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
}