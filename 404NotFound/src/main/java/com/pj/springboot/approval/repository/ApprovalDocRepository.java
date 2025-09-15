package com.pj.springboot.approval.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pj.springboot.approval.ApprovalDoc;

public interface ApprovalDocRepository extends JpaRepository<ApprovalDoc, String> {
    Page<ApprovalDoc> findByApprovalStatus(ApprovalDoc.DocStatus status, Pageable pageable);
}
