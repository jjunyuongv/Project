package com.pj.springboot.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceStatDTO {
	int employeeId;
	String employeeName;
	Long commute;
	Long late;
	Long leaveEarly;
	Long vacation;
	Long sick;
	Long absence;
}
