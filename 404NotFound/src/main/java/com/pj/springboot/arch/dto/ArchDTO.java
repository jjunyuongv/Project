package com.pj.springboot.arch.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.pj.springboot.arch.entity.ArchiveEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchDTO {
	public ArchDTO(ArchiveEntity entity, int filelistSize) {
		archId = entity.getArchId();
		archTitle = entity.getArchTitle();
		archCtnt = entity.getArchCtnt();
		if (entity.getUdtDt() != null) {
			udtDt = entity.getUdtDt();
			udtUserId = entity.getUdtUserId().getEmployeeId();
		}
		regDt = entity.getRegDt();
		regUserId = entity.getRegUserId().getEmployeeId();
		if (filelistSize > 0) {
			isDownloadfiles = "파일있음";
		} else {
			isDownloadfiles = "파일없음";
		}

	}

	private Integer archId;
	private String archTitle;
	private String archCtnt;
	private LocalDateTime udtDt; // 수정일시
	private Integer udtUserId; // 수정자 ID(사번)
	private LocalDateTime regDt; // 등록일시
	private Integer regUserId; // 등록자 ID(사번)
	private List<ArchfilesDTO> fileList;
	private String isDownloadfiles;
}
