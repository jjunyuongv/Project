package com.pj.springboot.arch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "archive_files")
@Getter
@Setter
public class ArchfilesEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "file_id", nullable = false)
	private int fileId; // 파일 고유 ID (PK, Auto Increment)

	@Column(name = "arch_id", length = 255, nullable = false)
	private int archId; // 연결된 문서 엔티티

	@Column(name = "ofile", length = 255, nullable = false)
	private String ofile; // 원본 파일명

	@Column(name = "sfile", length = 255, nullable = false)
	private String sfile; // 저장된 파일명
}
