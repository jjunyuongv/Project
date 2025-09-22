package com.pj.springboot.arch.entity;

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
@Table(name = "archive")
@Getter
@Setter

public class ArchiveEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	
	@Column(nullable = false, name = "arch_id")
	private int archId;

	@Column(length = 500, nullable = false, name = "arch_title")
	private String archTitle;
	
	@Column(length = 4000, nullable = false, name = "arch_ctnt")
	private String archCtnt;
	
	@Column(name = "udt_dt")
	private LocalDateTime udtDt;
	
	@ManyToOne(fetch = FetchType.LAZY) // 여기 안에 있는 컬럼을 참조할때 select문 실행
	@JoinColumn(name = "udt_user_id")
	private EmployeeEntity udtUserId;
	
	@Column(nullable = false, name = "reg_dt")
	private LocalDateTime regDt;
	


	
	@ManyToOne(fetch = FetchType.LAZY) // 여기 안에 있는 컬럼을 참조할때 select문 실행
	@JoinColumn(name = "reg_user_id")
	
	private EmployeeEntity regUserId;
	

}
