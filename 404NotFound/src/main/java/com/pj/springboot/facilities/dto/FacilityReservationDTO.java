package com.pj.springboot.facilities.dto;

import java.time.LocalDateTime;

import com.pj.springboot.facilities.FacilityReservations;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FacilityReservationDTO {

	private int reservationId;
	private int reservationFacilityId;
	private String reservationFacilityName;
	private int reservationEmployeeId;
	private String reservationEmployeeName;

	private String reservationStatus;
	private LocalDateTime reservationStartTime;
	private LocalDateTime reservationEndTime;
	private LocalDateTime reservationDate;

	public FacilityReservationDTO(FacilityReservations entity) {
		reservationId = entity.getReservationId();
		reservationFacilityId = entity.getReservationFacilityId().getFacilityId();
		reservationFacilityName = entity.getReservationFacilityId().getFacilityName();
		
		reservationEmployeeId = entity.getReservationEmployeeId().getEmployeeId();
		reservationEmployeeName = entity.getReservationEmployeeId().getName();
		
		reservationStatus = entity.getReservationStatus();
		reservationStartTime = entity.getReservationStartTime();
		reservationEndTime = entity.getReservationEndTime();
		reservationDate = entity.getReservationDate();
	}
}
