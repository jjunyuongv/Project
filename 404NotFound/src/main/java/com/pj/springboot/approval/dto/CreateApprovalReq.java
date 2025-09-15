package com.pj.springboot.approval.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

import com.pj.springboot.approval.ApprovalDoc;
import com.pj.springboot.approval.ApprovalDoc.DocCategory;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateApprovalReq {

    private String title;
    private String content;
    private ApprovalDoc.DocCategory category;   // TIMEOFF / SHIFT / ETC

    private List<LineItem> lines;               // 결재선

    private TimeoffItem timeoff;                // category == TIMEOFF 일 때만 사용

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class LineItem {
        private Integer approvalId;             // 결재자 사번
        private Integer approvalSequence;       // 순서(1..n)
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class TimeoffItem {
        private String timeoffType;             // "ANNUAL" | "HALF" | "SICK"
        private LocalDate start;                // 휴가 시작
        private LocalDate end;                  // 휴가 종료
        private String reason;                  // 사유
    }
}
