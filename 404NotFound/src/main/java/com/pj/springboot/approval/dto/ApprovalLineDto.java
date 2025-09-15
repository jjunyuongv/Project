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
    private Integer approvalId;
    private Integer approvalSequence;
    private ApprovalLine.LineStatus approvalLineStatus; // ✅ 라인 상태
    private LocalDateTime approvalLineDate;
}
