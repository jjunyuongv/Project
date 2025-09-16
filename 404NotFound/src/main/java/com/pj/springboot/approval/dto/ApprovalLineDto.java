package com.pj.springboot.approval.dto;

import java.time.LocalDateTime;

import com.pj.springboot.approval.ApprovalLine;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalLineDto {
    private Integer approvalLineIdx;
    private Integer approvalId;                     // 사번
    private Integer approvalSequence;
    private ApprovalLine.LineStatus approvalLineStatus;
    private LocalDateTime approvalLineDate;

    // 결재자 이름(백엔드에서 채워서 내려줌)
    private String approverName;
}
