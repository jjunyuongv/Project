package com.pj.springboot.approval.dto;

import java.time.LocalDateTime;

import com.pj.springboot.approval.ApprovalDoc;

public record ApprovalDto(String approvalDocId, String approvalTitle, String approvalContent,
							LocalDateTime approvalDate,ApprovalDoc.DocStatus approvalStatus,
							Integer approvalAuthor, ApprovalDoc.DocCategory approvalCategory)
{
	
}
