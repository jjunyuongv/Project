package com.pj.springboot.approval.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pj.springboot.approval.ApprovalLine;

public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, Integer> {

    List<ApprovalLine> findByDocApprovalDocIdOrderByApprovalSequenceAsc(String docId);

    Optional<ApprovalLine> findFirstByDocApprovalDocIdAndApprovalLineStatusOrderByApprovalSequenceAsc(
            String docId, ApprovalLine.LineStatus status);

    boolean existsByDocApprovalDocIdAndApprovalLineStatus(
            String docId, ApprovalLine.LineStatus status);

    Page<ApprovalLine> findByApprovalIdAndApprovalLineStatus(
            Integer approvalId, ApprovalLine.LineStatus status, Pageable pageable);

    // ✅ 문서 하위 라인 일괄 삭제
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from ApprovalLine l where l.doc.approvalDocId = :docId")
    void deleteByDocApprovalDocId(@Param("docId") String docId);
}
