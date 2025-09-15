package com.pj.springboot.facilities.dto;

import java.time.LocalDateTime;

import com.pj.springboot.auth.EmployeeEntity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FacilityEmployeeDTO {
	private int employeeId;
	private String employeeLoginId;
	private String employeeName;
	private String employeePw;
	private LocalDateTime employeeCreateDate;
	private String employeeRole;
	private String employeeAddress;

	// type : "FULL" 전체 정보 "MODAL" modal창에 띄울 정보만
	public FacilityEmployeeDTO(EmployeeEntity entity, String type) {
		switch (type) {
		case "FULL":
			employeeId = entity.getEmployeeId();
			employeeLoginId = entity.getLoginId();
			employeeName = entity.getName();
			employeePw = entity.getPassword();
			employeeCreateDate = entity.getCreateDate();
			employeeRole = entity.getRole();
			employeeAddress = entity.getAddress();
			break;
		case "MODAL":
			employeeId = entity.getEmployeeId();
			employeeName = entity.getName();
			break;
		}
	}
}