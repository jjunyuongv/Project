package com.pj.springboot.facilities.dto;

import com.pj.springboot.facilities.Facilities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FacilitiesDTO {
	
	private int facilityId;
	private String facilityName;
	private String facilityType;
	private String facilityLocation;
	private String facilityStatus;
	private int facilityManagerId;
	private String facilityManagerName;
	
	public FacilitiesDTO(Facilities entity) {
		facilityId = entity.getFacilityId();
		facilityName = entity.getFacilityName();
		facilityType = entity.getFacilityType();
		facilityLocation = entity.getFacilityLocation();
		facilityStatus = entity.getFacilityStatus();
		if(entity.getFacilityManagerId() != null) {
			facilityManagerId = entity.getFacilityManagerId().getEmployeeId();
			facilityManagerName = entity.getFacilityManagerId().getName();
		}
	}
}
