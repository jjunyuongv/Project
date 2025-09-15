package com.pj.springboot.approval;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_line")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    @Column(name = "approval_line_idx")
    private Integer approvalLineIdx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_doc_id", nullable = false)
    private ApprovalDoc doc;

    @Column(name = "approval_id", nullable = false)
    private Integer approvalId;

    @Column(name = "approval_sequence", nullable = false)
    private Integer approvalSequence;

    /** ✅ 라인 상태 전용 enum */
    public enum LineStatus { PENDING, APPROVED, REJECTED }

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_line_status", nullable = false, length = 20)
    private LineStatus approvalLineStatus;

    @Column(name = "approval_line_date")
    private LocalDateTime approvalLineDate;

    /** (편의) 연관 문서 ID만 필요할 때 사용 */
    public String getApprovalDocId() {
        return (doc != null ? doc.getApprovalDocId() : null);
    }
}
