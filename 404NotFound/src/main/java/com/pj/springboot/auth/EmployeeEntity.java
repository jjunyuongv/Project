package com.pj.springboot.auth;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "employees")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeEntity {

    @Id
    @Column(name = "employee_id")
    private int employeeId; // 또는 private Long employeeId;

    @Column(name = "employee_loginid", nullable = false, unique = true)
    private String loginId;

    @Column(name = "employee_name", nullable = false)
    private String name;

    @Column(name = "employee_email", nullable = true, unique = true)
    private String email;

    @Column(name = "employee_pw", nullable = false)
    private String password;

    @Column(name = "employee_address")
    private String address;

    @Column(name = "employee_phone")
    private String phone;

    @Column(name = "employee_create_date")
    private LocalDateTime createDate = LocalDateTime.now();

    @Column(name = "employee_role")
    private String role = "USER";

    // ✅ 추가 필드: 부서(category)와 직무(job)
    @Column(name = "employee_department")
    private String department;

    @Column(name = "employee_job")
    private String job;
    
    @Column(name = "employee_gender")
    private String gender;
    
    @Column(name = "employee_kakao_id", unique = true)
    private String kakaoId; 
    
    @Column(name = "employee_google_id", unique = true)
    private String googleId;
}
