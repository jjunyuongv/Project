package com.pj.springboot.approval;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "approval_doc")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalDoc {

    @Id
    @Column(name = "approval_doc_id", length = 255, nullable = false)
    private String approvalDocId;

    @Column(name = "approval_title", nullable = false, length = 100)
    private String approvalTitle;

    @Column(name = "approval_content", nullable = false, length = 4000)
    private String approvalContent;

    @Column(name = "approval_date", nullable = false)
    private LocalDateTime approvalDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    private DocStatus approvalStatus;

    @Column(name = "ofile", length = 255)
    private String ofile;

    @Column(name = "sfile", length = 255)
    private String sfile;

    @Column(name = "approval_author", nullable = false)
    private Integer approvalAuthor; // INT

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_category", nullable = false, length = 20)
    private DocCategory approvalCategory;

    @OneToMany(mappedBy = "doc", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("approvalSequence ASC")
    private List<ApprovalLine> lines = new ArrayList<>();

    public enum DocStatus { PENDING, APPROVED, REJECTED }
    public enum DocCategory { TIMEOFF, SHIFT, ETC }
}
