// src/main/java/com/pj/springboot/approval/dto/ApprovalDto.java
package com.pj.springboot.approval.dto;

import java.time.LocalDateTime;
import com.pj.springboot.approval.ApprovalDoc;

/**
 * 목록/투두에서 사용하는 요약 DTO
 * NEW 배지 표기를 위해 isNew(작성 24시간 이내) 필드를 추가합니다.
 */
public record ApprovalDto(
        String approvalDocId,
        String approvalTitle,
        String approvalContent,
        LocalDateTime approvalDate,
        ApprovalDoc.DocStatus approvalStatus,
        Integer approvalAuthor,
        ApprovalDoc.DocCategory approvalCategory,
        boolean isNew      // ✅ 24시간 이내이면 true
) {}
