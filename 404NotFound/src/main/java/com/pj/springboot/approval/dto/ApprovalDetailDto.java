// src/main/java/com/pj/springboot/approval/dto/ApprovalDetailDto.java
package com.pj.springboot.approval.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.pj.springboot.approval.ApprovalDoc;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDetailDto {
    private String approvalDocId;
    private String approvalTitle;
    private String approvalContent;
    private LocalDateTime approvalDate;
    private ApprovalDoc.DocStatus approvalStatus;
    private String ofile;
    private String sfile;
    private Integer approvalAuthor;
    private ApprovalDoc.DocCategory approvalCategory;
    private List<ApprovalLineDto> lines;

    /** 현재 사용자가 결재 가능 여부 */
    private boolean canApprove;

    /** 현재 사용자가 삭제 가능 여부 (서버가 규칙대로 계산해서 내려줌) */
    private boolean canDelete;
}
