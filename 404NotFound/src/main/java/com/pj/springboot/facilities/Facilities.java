package com.pj.springboot.facilities;

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
@Table(name = "FACILITIES")
@Getter
@Setter
public class Facilities {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false, name = "facility_id")
	private int facilityId;
	
	@Column(length = 255, nullable = false, name = "facility_name")
	private String facilityName;
	
	@Column(length = 100, nullable = false, name = "facility_type")
	private String facilityType;
	
	@Column(length = 255, nullable = false, name = "facility_location")
	private String facilityLocation;
	
	@Column(length = 20, nullable = false, name = "facility_status")
	private String facilityStatus;
	
	@ManyToOne(fetch = FetchType.LAZY) // 여기 안에 있는 컬럼을 참조할때 select문 실행
	@JoinColumn(name = "facilityManagerId")
	EmployeeEntity facilityManagerId;
}
