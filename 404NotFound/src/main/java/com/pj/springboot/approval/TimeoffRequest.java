package com.pj.springboot.approval;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "timeoff_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeoffRequest {

    @Id
    @Column(name = "timeoff_id", length = 255, nullable = false)
    private String timeoffId; // approval_doc_id 와 동일 (PK 공유)

    /** 문서와 1:1, PK 공유 */
    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "timeoff_id", nullable = false)
    private ApprovalDoc doc;

    /** DB ENUM('ANNUAL','HALF','SICK') 와 동일 */
    public enum Type { ANNUAL, HALF, SICK }

    @Enumerated(EnumType.STRING)
    @Column(name = "timeoff_type", nullable = false, length = 10)
    private Type timeoffType;

    @Column(name = "timeoff_start", nullable = false)
    private LocalDate timeoffStart;

    @Column(name = "timeoff_end", nullable = false)
    private LocalDate timeoffEnd;

    @Column(name = "timeoff_reason", length = 1000)
    private String timeoffReason;
}
