package com.pj.springboot.approval.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile; // ★ NEW (기존 주석 유지)

import com.pj.springboot.approval.ApprovalDoc;
import com.pj.springboot.approval.ApprovalLine;
import com.pj.springboot.approval.FileUpload;
import com.pj.springboot.approval.TimeoffRequest;
import com.pj.springboot.approval.dto.ApprovalDetailDto;
import com.pj.springboot.approval.dto.ApprovalDto;
import com.pj.springboot.approval.dto.ApprovalLineDto;
import com.pj.springboot.approval.dto.CreateApprovalReq;
import com.pj.springboot.approval.repository.ApprovalDocRepository;
import com.pj.springboot.approval.repository.ApprovalLineRepository;
import com.pj.springboot.approval.repository.TimeoffRequestRepository;

// ✅ 역할(Role) 확인을 위해 사원 레포지토리 사용
import com.pj.springboot.auth.repository.EmployeeRepository;
import com.pj.springboot.calendars.service.EventSyncService;
import com.pj.springboot.calendars.service.EventSyncService.ApprovalSnapshot;

@Service
@Transactional
public class ApprovalService {

    private final ApprovalDocRepository docRepo;
    private final ApprovalLineRepository lineRepo;
    private final TimeoffRequestRepository timeoffRepo;
    private final FileUpload fileUpload;

    // ✅ 역할 기반 권한을 위해 추가
    private final EmployeeRepository employeeRepo;

    // NEW 배지 유지 시간
    private final Duration newBadgeDuration;

    // ★ NEW: 캘린더 동기화 서비스 주입
    private final EventSyncService eventSyncService;                           // ★ NEW

    /**
     * ✅ 더 이상 adminEmployeeId 주입 없음 (관리자 사번 정책 제거)
     */
    public ApprovalService(ApprovalDocRepository docRepo,
                           ApprovalLineRepository lineRepo,
                           TimeoffRequestRepository timeoffRepo,
                           FileUpload fileUpload,
                           EmployeeRepository employeeRepo,
                           @Value("${app.new-badge-duration:PT24H}") Duration newBadgeDuration,
                           EventSyncService eventSyncService // ★ NEW
    ) {
        this.docRepo = docRepo;
        this.lineRepo = lineRepo;
        this.timeoffRepo = timeoffRepo;
        this.fileUpload = fileUpload;
        this.employeeRepo = employeeRepo;
        this.newBadgeDuration = newBadgeDuration;
        this.eventSyncService = eventSyncService;                              // ★ NEW
    }

    /* 목록 */
    @Transactional(readOnly = true)
    // ★ 변경: 검색어 q 추가
    public Page<ApprovalDto> listApprovals(String status, String q, Pageable pageable) {
        ApprovalDoc.DocStatus parsed = parseStatus(status);
        String keyword = (q == null || q.isBlank()) ? null : q.trim();

        // ★ 변경: 레포지토리의 search 사용 (status + 제목/내용 like)
        Page<ApprovalDoc> page = docRepo.search(parsed, keyword, pageable);

        LocalDateTime threshold = LocalDateTime.now().minus(newBadgeDuration);

        List<ApprovalDto> content = new ArrayList<>();
        for (ApprovalDoc d : page.getContent()) {
            boolean isNew = d.getApprovalDate() != null && d.getApprovalDate().isAfter(threshold);
            content.add(new ApprovalDto(
                    d.getApprovalDocId(),
                    d.getApprovalTitle(),
                    d.getApprovalContent(),
                    d.getApprovalDate(),
                    d.getApprovalStatus(),
                    d.getApprovalAuthor(),
                    d.getApprovalCategory(),
                    isNew
            ));
        }
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    /* 상세
     * - canApprove: 문서가 PENDING이고 (매니저) 또는 (현재 PENDING 라인의 결재자 == me)
     * - canDelete: (매니저) 또는 (작성자이며 승인 완료 전)
     */
    @Transactional(readOnly = true)
    public ApprovalDetailDto getApproval(String docId, Integer me) {
        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));

        List<ApprovalLine> lines = lineRepo.findByDocApprovalDocIdOrderByApprovalSequenceAsc(docId);

        List<ApprovalLineDto> lineDtos = new ArrayList<>();
        for (ApprovalLine l : lines) {
            lineDtos.add(new ApprovalLineDto(
                    l.getApprovalLineIdx(),
                    l.getApprovalId(),
                    l.getApprovalSequence(),
                    l.getApprovalLineStatus(),
                    l.getApprovalLineDate(),
                    null // 필요 시 결재자 이름 채워 넣을 수 있음
            ));
        }

        boolean canApprove = false;
        boolean canDelete  = false;

        if (me != null) {
            boolean manager = isManager(me);

            // 결재 가능?
            if (d.getApprovalStatus() == ApprovalDoc.DocStatus.PENDING) {
                if (manager) {
                    canApprove = true; // 매니저는 대기 중 문서 결재 가능(대리 결재 허용)
                } else {
                    canApprove = lineRepo
                            .findFirstByDocApprovalDocIdAndApprovalLineStatusOrderByApprovalSequenceAsc(
                                    docId, ApprovalLine.LineStatus.PENDING)
                            .map(cur -> meEquals(cur.getApprovalId(), me))
                            .orElse(false);
                }
            }

            // 삭제 가능?
            boolean isOwner = meEquals(d.getApprovalAuthor(), me);
            if (manager) {
                canDelete = true; // 매니저는 승인 완료 문서도 삭제 가능
            } else {
                canDelete = isOwner && (d.getApprovalStatus() != ApprovalDoc.DocStatus.APPROVED);
            }
        }

        ApprovalDetailDto dto = new ApprovalDetailDto();
        dto.setApprovalDocId(d.getApprovalDocId());
        dto.setApprovalTitle(d.getApprovalTitle());
        dto.setApprovalContent(d.getApprovalContent());
        dto.setApprovalDate(d.getApprovalDate());
        dto.setApprovalStatus(d.getApprovalStatus());
        dto.setOfile(d.getOfile());
        dto.setSfile(d.getSfile());
        dto.setApprovalAuthor(d.getApprovalAuthor());
        dto.setApprovalCategory(d.getApprovalCategory());
        dto.setLines(lineDtos);
        dto.setCanApprove(canApprove); // ✅ 서버가 규칙대로 계산해서 내려줌
        dto.setCanDelete(canDelete);   // ✅ 서버가 규칙대로 계산해서 내려줌

        return dto;
    }

    /* 생성 */
    public String create(com.pj.springboot.approval.dto.CreateApprovalReq req, int author, MultipartFile file) {
        String docId = generateDocId();

        ApprovalDoc d = new ApprovalDoc();
        d.setApprovalDocId(docId);
        d.setApprovalTitle(nz(req.getTitle()));
        d.setApprovalContent(nz(req.getContent()));
        d.setApprovalDate(LocalDateTime.now());
        d.setApprovalStatus(ApprovalDoc.DocStatus.PENDING);
        d.setApprovalAuthor(author);
        d.setApprovalCategory(
                req.getCategory() != null ? req.getCategory() : ApprovalDoc.DocCategory.ETC
        );

        if (file != null && !file.isEmpty()) {
            FileUpload.Saved saved = fileUpload.save(file, docId);
            d.setOfile(saved.originalName());
            d.setSfile(saved.savedName());
        } else {
            d.setOfile(null);
            d.setSfile(null);
        }

        docRepo.save(d);

        ApprovalDoc managed = docRepo.getReferenceById(docId);

        if (req.getLines() != null && !req.getLines().isEmpty()) {
            req.getLines().stream()
                    .sorted(Comparator.comparing(com.pj.springboot.approval.dto.CreateApprovalReq.LineItem::getApprovalSequence))
                    .forEach(li -> {
                        ApprovalLine l = new ApprovalLine();
                        l.setDoc(managed);
                        l.setApprovalId(li.getApprovalId());
                        l.setApprovalSequence(li.getApprovalSequence());
                        l.setApprovalLineStatus(ApprovalLine.LineStatus.PENDING);
                        l.setApprovalLineDate(null);
                        lineRepo.save(l);
                    });
        } else {
            // 결재선이 없으면 본인 1단계 기본 생성
            ApprovalLine l1 = new ApprovalLine();
            l1.setDoc(managed);
            l1.setApprovalId(author);
            l1.setApprovalSequence(1);
            l1.setApprovalLineStatus(ApprovalLine.LineStatus.PENDING);
            lineRepo.save(l1);
        }

        if (managed.getApprovalCategory() == ApprovalDoc.DocCategory.TIMEOFF && req.getTimeoff() != null) {
            var to = req.getTimeoff();
            TimeoffRequest tr = TimeoffRequest.builder()
                    .doc(managed)
                    .timeoffType(safeTimeoffType(to.getTimeoffType()))
                    .timeoffStart(to.getStart() != null ? to.getStart() : LocalDate.now())
                    .timeoffEnd(to.getEnd() != null ? to.getEnd() : LocalDate.now())
                    .timeoffReason(nz(to.getReason()))
                    .build();
            timeoffRepo.save(tr);
        }

        return docId;
    }

    public String create(com.pj.springboot.approval.dto.CreateApprovalReq req, int author) { return create(req, author, null); }

    /* ==============================
     * 수정 (오버로드 추가)
     * ============================== */

    // (기존) 단순 수정 메서드 — 기존 코드 유지
    public void update(String docId, com.pj.springboot.approval.dto.UpdateApprovalReq req) {
        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));

        if (req.getTitle() != null)   d.setApprovalTitle(req.getTitle().trim());
        if (req.getContent() != null) d.setApprovalContent(req.getContent());
        if (req.getCategory() != null) d.setApprovalCategory(req.getCategory());
        docRepo.save(d);
    }

    // ★ 추가: 작성자 검증이 포함된 수정 메서드(오버로드)
    public void update(String docId, int me, com.pj.springboot.approval.dto.UpdateApprovalReq req) { // ★ 추가
        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));

        // 🔒 작성자만 수정 가능
        if (d.getApprovalAuthor() == null || d.getApprovalAuthor() != me) {
            throw new SecurityException("글쓴이가 아닙니다."); // ★ 추가
        }

        if (req.getTitle() != null)   d.setApprovalTitle(req.getTitle().trim());
        if (req.getContent() != null) d.setApprovalContent(req.getContent());
        if (req.getCategory() != null) d.setApprovalCategory(req.getCategory());
        docRepo.save(d);
    }

    /* 승인 (매니저는 대리 승인 가능) */
    public void approve(String docId, int me, String opinion) {
        ApprovalLine cur = lineRepo
                .findFirstByDocApprovalDocIdAndApprovalLineStatusOrderByApprovalSequenceAsc(
                        docId, ApprovalLine.LineStatus.PENDING)
                .orElseThrow(() -> new IllegalStateException("결재할 단계가 없습니다."));

        boolean manager = isManager(me);

        if (!manager && !meEquals(cur.getApprovalId(), me)) {
            throw new SecurityException("이 문서의 결재 권한이 없습니다.");
        }
        if (manager && !meEquals(cur.getApprovalId(), me)) {
            cur.setApprovalId(me); // 대리 승인 기록
        }

        cur.setApprovalLineStatus(ApprovalLine.LineStatus.APPROVED);
        cur.setApprovalLineDate(LocalDateTime.now());
        lineRepo.save(cur);

        boolean hasMore = lineRepo.existsByDocApprovalDocIdAndApprovalLineStatus(
                docId, ApprovalLine.LineStatus.PENDING);
        if (!hasMore) {
            ApprovalDoc d = docRepo.findById(docId)
                    .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));
            d.setApprovalStatus(ApprovalDoc.DocStatus.APPROVED);
            docRepo.save(d);

            // ★ NEW: 최종 승인 완료 시 캘린더 업서트 (DB 스키마 변경 없이 EVENT 동기화)
            eventSyncService.onApprovalStatusChanged(                            // ★ NEW
                    new ApprovalSnapshot(                                        // ★ NEW
                            d.getApprovalDocId(),                                // 문서ID
                            d.getApprovalTitle(),                                // 제목
                            d.getApprovalContent(),                              // 본문
                            d.getApprovalCategory().name(),                      // "TIMEOFF" | "SHIFT" | "ETC"
                            d.getApprovalStatus().name(),                        // "APPROVED"
                            d.getApprovalAuthor(),                               // 신청자(= 일정 소유자)
                            me,                                                  // 최종 승인자
                            (d.getApprovalDate() != null                         // 기준일
                                    ? d.getApprovalDate().toLocalDate()
                                    : LocalDate.now())
                    )
            );
        }
    }

    /* 반려 (매니저는 대리 반려 가능) */
    public void reject(String docId, int me, String opinion) {
        ApprovalLine cur = lineRepo
                .findFirstByDocApprovalDocIdAndApprovalLineStatusOrderByApprovalSequenceAsc(
                        docId, ApprovalLine.LineStatus.PENDING)
                .orElseThrow(() -> new IllegalStateException("결재할 단계가 없습니다."));

        boolean manager = isManager(me);

        if (!manager && !meEquals(cur.getApprovalId(), me)) {
            throw new SecurityException("이 문서의 결재 권한이 없습니다.");
        }
        if (manager && !meEquals(cur.getApprovalId(), me)) {
            cur.setApprovalId(me); // 대리 반려 기록
        }

        cur.setApprovalLineStatus(ApprovalLine.LineStatus.REJECTED);
        cur.setApprovalLineDate(LocalDateTime.now());
        lineRepo.save(cur);

        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));
        d.setApprovalStatus(ApprovalDoc.DocStatus.REJECTED);
        docRepo.save(d);

        // ★ NEW: 반려 시 캘린더에서 해당 일정 제거
        eventSyncService.onApprovalStatusChanged(                                // ★ NEW
                new ApprovalSnapshot(
                        d.getApprovalDocId(),
                        d.getApprovalTitle(),
                        d.getApprovalContent(),
                        d.getApprovalCategory().name(),                          // "TIMEOFF" | "SHIFT" | "ETC"
                        d.getApprovalStatus().name(),                            // "REJECTED"
                        d.getApprovalAuthor(),
                        me,
                        (d.getApprovalDate() != null
                                ? d.getApprovalDate().toLocalDate()
                                : LocalDate.now())
                )
        );
    }

    /* 내 결재할 문서 (본인 차례) */
    @Transactional(readOnly = true)
    public Page<ApprovalDto> myTodo(int me, Pageable pageable) {
        Page<ApprovalLine> lines = lineRepo.findByApprovalIdAndApprovalLineStatus(
                me, ApprovalLine.LineStatus.PENDING, pageable);

        LocalDateTime threshold = LocalDateTime.now().minus(newBadgeDuration);

        List<ApprovalDto> dtos = new ArrayList<>();
        for (ApprovalLine l : lines.getContent()) {
            ApprovalDoc d = l.getDoc();
            if (d != null) {
                boolean isNew = d.getApprovalDate() != null && d.getApprovalDate().isAfter(threshold);
                dtos.add(new ApprovalDto(
                        d.getApprovalDocId(),
                        d.getApprovalTitle(),
                        d.getApprovalContent(),
                        d.getApprovalDate(),
                        d.getApprovalStatus(),
                        d.getApprovalAuthor(),
                        d.getApprovalCategory(),
                        isNew
                ));
            }
        }
        return new PageImpl<>(dtos, pageable, lines.getTotalElements());
    }

    /* 삭제: (매니저) 또는 (작성자 & 미승인) */
    public void delete(String docId, Integer me) {
        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));

        boolean manager = isManager(me);
        boolean isOwner = (me != null && meEquals(d.getApprovalAuthor(), me));

        if (!(manager || isOwner)) {
            throw new SecurityException("삭제 권한이 없습니다.");
        }
        if (!manager && d.getApprovalStatus() == ApprovalDoc.DocStatus.APPROVED) {
            throw new SecurityException("승인 완료 문서는 매니저만 삭제할 수 있습니다.");
        }

        // 하위 리소스 정리
        timeoffRepo.deleteByApprovalDocId(docId);
        lineRepo.deleteByDocApprovalDocId(docId);

        if (d.getSfile() != null && !d.getSfile().isBlank()) {
            fileUpload.deleteQuietly(d.getSfile());
        }

        // ★ NEW: 문서 삭제 시 관련 일정 전부 제거(토큰 기반)
        eventSyncService.purgeDoc(docId, d.getApprovalAuthor());                 // ★ NEW

        docRepo.delete(d);
    }

    public static record DownloadableFile(Resource resource, String originalName, String contentType) {}

    @Transactional(readOnly = true)
    public DownloadableFile getDownloadableFile(String docId) {
        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));

        if (d.getSfile() == null || d.getSfile().isBlank()) return null;

        Resource res = fileUpload.loadAsResource(d.getSfile());
        if (res == null || !res.exists()) return null;

        return new DownloadableFile(res, d.getOfile(), null);
    }

    /* =========================================================
     * ★ NEW: 첨부 파일 교체
     * - 작성자만 가능
     * - 기존 sfile 물리 파일 삭제 후 새 파일 저장
     * - ofile/sfile 갱신
     * ========================================================= */
    public void replaceFile(String docId, int me, MultipartFile file) { // ★ NEW
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }
        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));

        if (d.getApprovalAuthor() == null || d.getApprovalAuthor() != me) {
            throw new SecurityException("글쓴이가 아닙니다.");
        }

        // 기존 파일 삭제
        if (d.getSfile() != null && !d.getSfile().isBlank()) {
            fileUpload.deleteQuietly(d.getSfile());
        }

        // 새 파일 저장
        FileUpload.Saved saved = fileUpload.save(file, docId);
        d.setOfile(saved.originalName());
        d.setSfile(saved.savedName());

        docRepo.save(d);
    }

    // ---------- util ----------

    private boolean meEquals(Integer x, int me) { return x != null && x == me; }

    // ✅ 역할 기반 권한: role == "MANAGER" 면 매니저로 간주 (대소문자 무시)
    private boolean isManager(Integer me) {
        if (me == null) return false;
        return employeeRepo.findById(me)
                .map(emp -> "MANAGER".equalsIgnoreCase(String.valueOf(emp.getRole())))
                .orElse(false);
    }

    private String nz(String s) { return s == null ? "" : s; }

    private ApprovalDoc.DocStatus parseStatus(String status) {
        if (status == null) return null;
        String s = status.trim();
        if (s.isEmpty() || "ALL".equalsIgnoreCase(s)) return null;
        try { return ApprovalDoc.DocStatus.valueOf(s.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }

    private String generateDocId() {
        String year = String.valueOf(LocalDate.now().getYear());
        String tail = String.valueOf(System.currentTimeMillis()).substring(7);
        return "AP-" + year + "-" + tail;
    }

    private TimeoffRequest.Type safeTimeoffType(String t) {
        if (t == null) return TimeoffRequest.Type.ANNUAL;
        try { return TimeoffRequest.Type.valueOf(t.trim().toUpperCase()); }
        catch (Exception e) { return TimeoffRequest.Type.ANNUAL; }
    }
}
