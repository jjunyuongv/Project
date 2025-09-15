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

    @Column(name = "employee_email", nullable = false, unique = true)
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
}