package com.pj.springboot.attendance.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import com.pj.springboot.auth.EmployeeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ATTENDANCES", uniqueConstraints = @UniqueConstraint(name = "uq_attendance_employee_date", columnNames = {
		"attendance_employee_id", "attendance_date" }))
@Getter
@Setter
public class Attendances {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false, name = "attendance_id")
	private long attendanceId;

	@ManyToOne(fetch = FetchType.LAZY) // 여기 안에 있는 컬럼을 참조할때 select문 실행
	@JoinColumn(name = "attendance_employee_id")
	EmployeeEntity attendanceEmployeeId;

	@Column(nullable = false, name = "attendance_date")
	private LocalDate attendanceDate;

	@Column(name = "attendance_start")
	private LocalTime attendanceStart;

	@Column(name = "attendance_end")
	private LocalTime attendanceEnd;

	@Column(length = 100, nullable = false, name = "attendance_status")
	private String attendanceStatus;

	@Column(length = 255, name = "attendance_reason")
	private String attendanceReason;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "attendance_edit_employee_id")
	EmployeeEntity attendanceEditEmployeeId;
}
