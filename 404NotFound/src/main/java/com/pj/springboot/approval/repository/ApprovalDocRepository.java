package com.pj.springboot.approval.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
// ★ NEW: 검색 JPQL을 위해 추가
import org.springframework.data.jpa.repository.Query;           // ★ NEW
import org.springframework.data.repository.query.Param;      // ★ NEW

import com.pj.springboot.approval.ApprovalDoc;

public interface ApprovalDocRepository extends JpaRepository<ApprovalDoc, String> {

    Page<ApprovalDoc> findByApprovalStatus(ApprovalDoc.DocStatus status, Pageable pageable);

    /* ----------------------------------------------------------
     * ★ NEW: 상태 + 키워드(제목/내용) 검색
     *  - status, q 둘 다 옵션(null 허용)
     *  - lower(...)로 대소문자 무시 (DB collation에 따라 생략 가능)
     *  - Pageable 정렬/페이지네이션 그대로 사용
     * ---------------------------------------------------------- */
    @Query(
        value = """
            select d
              from ApprovalDoc d
             where (:status is null or d.approvalStatus = :status)
               and (
                    :q is null
                    or lower(d.approvalTitle)  like lower(concat('%', :q, '%'))
                    or lower(d.approvalContent) like lower(concat('%', :q, '%'))
               )
            """,
        countQuery = """
            select count(d)
              from ApprovalDoc d
             where (:status is null or d.approvalStatus = :status)
               and (
                    :q is null
                    or lower(d.approvalTitle)  like lower(concat('%', :q, '%'))
                    or lower(d.approvalContent) like lower(concat('%', :q, '%'))
               )
            """
    )
    Page<ApprovalDoc> search(                                   // ★ NEW
        @Param("status") ApprovalDoc.DocStatus status,          // ★ NEW
        @Param("q") String q,                                   // ★ NEW
        Pageable pageable                                       // ★ NEW
    );
}
