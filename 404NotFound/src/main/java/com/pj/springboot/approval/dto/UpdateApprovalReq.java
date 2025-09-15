package com.pj.springboot.approval.dto;

import com.pj.springboot.approval.ApprovalDoc;
import com.pj.springboot.approval.ApprovalDoc.DocCategory;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateApprovalReq {
    private String title;
    private String content;
    private ApprovalDoc.DocCategory category;
}
