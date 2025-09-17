package com.pj.springboot.attendance.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.pj.springboot.attendance.entity.Attendances;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceDTO {
	long attendanceId;
	LocalDate attendanceDate;
	int attendanceEmployeeId;
	String attendanceEmployeeName;
	LocalTime attendanceStart;
	LocalTime attendanceEnd;
	String attendanceStatus;
	String attendanceReason;
	int attendanceEditEmployeeId;
	String attendanceEditEmployeeName;
	
	public AttendanceDTO(Attendances entity) {
		attendanceId = entity.getAttendanceId();
		attendanceDate = entity.getAttendanceDate();
		attendanceEmployeeId = entity.getAttendanceEmployeeId().getEmployeeId();
		attendanceEmployeeName = entity.getAttendanceEmployeeId().getName();
		attendanceStart = entity.getAttendanceStart() != null ? entity.getAttendanceStart() : null;
		attendanceEnd = entity.getAttendanceEnd() != null ? entity.getAttendanceEnd() : null;
		attendanceStatus = entity.getAttendanceStatus();
		attendanceReason = entity.getAttendanceReason() != null ? entity.getAttendanceReason() : "";
		attendanceEditEmployeeId = entity.getAttendanceEditEmployeeId() != null ? entity.getAttendanceEditEmployeeId().getEmployeeId() : -1;
		attendanceEditEmployeeName = entity.getAttendanceEditEmployeeId() != null ? entity.getAttendanceEditEmployeeId().getName() : "";
	}
}
