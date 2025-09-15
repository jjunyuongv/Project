package com.pj.springboot.approval.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pj.springboot.approval.TimeoffRequest;

public interface TimeoffRequestRepository extends JpaRepository<TimeoffRequest, String> {

    // ✅ 문서에 연결된 휴가 상세 삭제 (@MapsId 로 연결되어 있다면 PK=docId)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from TimeoffRequest t where t.doc.approvalDocId = :docId")
    void deleteByApprovalDocId(@Param("docId") String docId);
}
