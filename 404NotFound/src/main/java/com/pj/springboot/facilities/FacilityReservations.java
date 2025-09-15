package com.pj.springboot.facilities;

import java.time.LocalDateTime;

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
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "FACILITY_RESERVATIONS")
@Getter
@Setter
public class FacilityReservations {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false, name = "reservation_id")
	private int reservationId;
	
	@ManyToOne(fetch = FetchType.LAZY) // 여기 안에 있는 컬럼을 참조할때 select문 실행
	@JoinColumn(name = "reservation_facility_id")
	Facilities reservationFacilityId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reservation_employee_id")
	EmployeeEntity reservationEmployeeId;
	
	@Column(length = 20, nullable = false, name = "reservation_status")
	private String reservationStatus;
	
	@Column(nullable = false, name = "reservation_start_time")
	private LocalDateTime reservationStartTime;
	
	@Column(nullable = false, name = "reservation_end_time")
	private LocalDateTime reservationEndTime;
	
	@Column(nullable = false, name = "reservation_date")
	private LocalDateTime reservationDate;
	
	
}
