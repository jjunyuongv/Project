package com.pj.springboot.arch.dto;

import com.pj.springboot.arch.entity.ArchfilesEntity;

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

public class ArchfilesDTO {
	
	   private Integer fileId;    // 파일 고유 ID
	    private Integer archId;    // 문서 ID (연결된 문서 PK)
	    private String ofile;      // 원본 파일명
	    private String sfile;      // 저장된 파일명

	    /** Entity → DTO 변환 생성자 */
	    public ArchfilesDTO(ArchfilesEntity entity) {
	        this.fileId = entity.getFileId();
	        this.archId = entity.getArchId();
	        this.ofile = entity.getOfile();
	        this.sfile = entity.getSfile();
	    
	}
}
