//package com.pj.springboot.facilities.entity;
//
//import java.time.LocalDateTime;
//
//import jakarta.persistence.Column;
//import jakarta.persistence.Entity;
//import jakarta.persistence.Id;
//import jakarta.persistence.Table;
//import lombok.Getter;
//
//@Entity
//@Table(name = "EMPLOYEES")
//@Getter
//public class Employees {
//	@Id
//	@Column(nullable = false, name = "employee_id")
//	private int employeeId;
//	
//	@Column(length = 50, nullable = false, name = "employee_loginid")
//	private String employeeLoginId;
//	
//	@Column(length = 50, nullable = false, name = "employee_name")
//	private String employeeName;
//	
//	@Column(length = 255, nullable = false, name = "employee_pw")
//	private String employeePw;
//	
//	@Column(nullable = false, name = "employee_create_date")
//	private LocalDateTime employeeCreateDate;
//	
//	@Column(length = 20, name = "employee_role")
//	private String employeeRole;
//	
//	@Column(length = 200, nullable = false, name = "employee_address")
//	private String employeeAddress;
//}