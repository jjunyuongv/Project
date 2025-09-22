package com.pj.springboot.calendars.service;

import com.pj.springboot.approval.TimeoffRequest;
import com.pj.springboot.approval.repository.TimeoffRequestRepository;
import com.pj.springboot.calendars.Event;
import com.pj.springboot.calendars.repository.EventRepository;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;                         // ★ NEW
import org.slf4j.LoggerFactory;                 // ★ NEW
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Objects;

/**
 * DB 스키마 변경 없이 EVENT 테이블을 결재 상태와 동기화하는 서비스
 *  - 업서트 키: Event.CONTENT 안에 "[SRC:APPROVAL:<docId>]" 토큰을 숨겨 저장
 *  - APPROVED  : 업서트(있으면 수정, 없으면 생성)
 *  - REJECTED  : 해당 토큰의 일정 삭제
 *  - purgeDoc(): 문서 자체가 삭제될 때 일정 정리
 */
@Service
@RequiredArgsConstructor
public class EventSyncService {

    private static final String TOKEN_PREFIX = "[SRC:APPROVAL:";
    private static final String TOKEN_SUFFIX = "]";

    private final EventRepository eventRepository;
    private final TimeoffRequestRepository timeoffRepo; // 휴가 기간/사유 조회용

    private static final Logger log = LoggerFactory.getLogger(EventSyncService.class); // ★ NEW

    /** 승인/반려 등 상태 변화 시 호출 */
    @Transactional
    public void onApprovalStatusChanged(ApprovalSnapshot doc) {
        if (doc == null || doc.docId() == null || doc.applicantId() == null) {
            log.warn("onApprovalStatusChanged: invalid snapshot {}", doc); // ★ NEW
            return;
        }

        String token = tokenOf(doc.docId());
        log.info("Approval changed: docId={}, status={}, category={}, applicant={}", // ★ NEW
                doc.docId(), doc.status(), doc.category(), doc.applicantId());

        if ("APPROVED".equalsIgnoreCase(doc.status())) {
            upsertFromApproval(doc, token);
        } else if ("REJECTED".equalsIgnoreCase(doc.status())) {
            deleteByToken(doc.applicantId(), token);
        } // PENDING 등은 무시
    }

    /** 문서 삭제 시 일정 정리 */
    @Transactional
    public void purgeDoc(String docId, Integer applicantId) {
        if (docId == null || applicantId == null) return;
        deleteByToken(applicantId, tokenOf(docId));
        // (선택) 승인자 일정도 복제 운용 시: tokenOf(docId)+"#mgr" 도 함께 삭제
    }

    // ===== 내부 구현 =====

    private void upsertFromApproval(ApprovalSnapshot doc, String token) {
        // 기존 일정 찾기(신청자 소유)
        var existing = eventRepository.findFirstByCrewEmployeeIdAndContentContaining(doc.applicantId(), token)
                                      .orElse(null);

        var c = computeEventFields(doc);

        Event e = (existing != null) ? existing : new Event();
        e.setCrewEmployeeId(doc.applicantId());

        // ★ NEW: 프런트 필터와 맞추기 위해 category를 한글로 저장
        //  TIMEOFF -> "휴가일정", SHIFT/ETC -> "개인일정"
        e.setCategory(mapCategoryForFrontend(doc.category()));                  // ★ NEW

        e.setTitle(c.title());

        String base = (c.content() == null ? "" : c.content());
        e.setContent(ensureToken(base, token));

        e.setStartDate(c.start());
        e.setEndDate(c.end());

        Event saved = eventRepository.save(e);
        log.info("Event upserted: id={}, owner={}, title='{}', cat='{}', range={}~{}", // ★ NEW
                saved.getEventId(), saved.getCrewEmployeeId(), saved.getTitle(),
                saved.getCategory(), saved.getStartDate(), saved.getEndDate());
    }

    private void deleteByToken(Integer employeeId, String token) {
        eventRepository.findAllByCrewEmployeeIdAndContentContaining(employeeId, token)
                       .forEach(ev -> {
                           log.info("Event deleted by token: id={}, owner={}, token={}", // ★ NEW
                                   ev.getEventId(), ev.getCrewEmployeeId(), token);
                           eventRepository.delete(ev);
                       });
    }

    private String ensureToken(String contentBase, String token) {
        return (contentBase.contains(token)) ? contentBase
                : (contentBase.isBlank() ? token : contentBase + "\n" + token);
    }

    private String tokenOf(String docId) { return TOKEN_PREFIX + docId + TOKEN_SUFFIX; }

    private Computed computeEventFields(ApprovalSnapshot doc) {
        // 기본값
        LocalDate start = (doc.approvalDate() != null) ? doc.approvalDate() : LocalDate.now();
        LocalDate end   = start;
        String title    = "[" + toKo(doc.category()) + "] " + nz(doc.title());
        String content  = nz(doc.content());

        if (Objects.equals(doc.category(), "TIMEOFF")) {
            // 휴가: 상세 테이블에서 기간/사유를 우선 반영
            TimeoffRequest tr = timeoffRepo.findById(doc.docId()).orElse(null);
            if (tr != null) {
                start = tr.getTimeoffStart();
                end   = tr.getTimeoffEnd();
                title = "[휴가] " + (isBlank(tr.getTimeoffReason()) ? nz(doc.title()) : tr.getTimeoffReason());
                content = (content.isBlank() ? "" : content + "\n")
                        + "(유형:" + tr.getTimeoffType() + ", 기간:" + start + "~" + end + ")";
            } else {
                title = "[휴가] " + nz(doc.title());
            }
        } else if (Objects.equals(doc.category(), "SHIFT")) {
            // 근무변경: 시간 테이블이 없으므로 날짜 단위로 등록(필요한 시간 텍스트는 content에)
            title = "[근무변경] " + nz(doc.title());
        } else {
            title = "[기타결재] " + nz(doc.title());
        }

        return new Computed(title, content, start, end);
    }

    // ★ NEW: 프런트 카테고리와 맞추는 맵핑
    private String mapCategoryForFrontend(String raw) {
        if (raw == null) return "개인일정";
        return switch (raw) {
            case "TIMEOFF" -> "휴가일정";
            case "SHIFT", "ETC" -> "개인일정";
            default -> "개인일정";
        };
    }

    private String toKo(String cat) {
        return switch (cat) {
            case "TIMEOFF" -> "휴가";
            case "SHIFT"   -> "근무변경";
            default        -> "기타";
        };
    }

    private String nz(String s) { return (s == null) ? "" : s; }
    private boolean isBlank(String s) { return s == null || s.isBlank(); }

    // ===== 공용 스냅샷 DTO =====
    public record ApprovalSnapshot(
            String docId,
            String title,
            String content,
            String category,      // "TIMEOFF" | "SHIFT" | "ETC"
            String status,        // "PENDING" | "APPROVED" | "REJECTED"
            Integer applicantId,  // CREW_EMPLOYEE_ID 로 저장할 값
            Integer approverId,   // (선택) 최종 승인자 id
            LocalDate approvalDate
    ) {}

    private record Computed(String title, String content, LocalDate start, LocalDate end) {}
}
