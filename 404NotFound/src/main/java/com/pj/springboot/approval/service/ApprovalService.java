package com.pj.springboot.approval.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.pj.springboot.approval.ApprovalDoc;
import com.pj.springboot.approval.ApprovalLine;
import com.pj.springboot.approval.FileUpload;
import com.pj.springboot.approval.TimeoffRequest;
import com.pj.springboot.approval.dto.ApprovalDetailDto;
import com.pj.springboot.approval.dto.ApprovalDto;
import com.pj.springboot.approval.dto.ApprovalLineDto;
import com.pj.springboot.approval.dto.CreateApprovalReq;
import com.pj.springboot.approval.dto.UpdateApprovalReq;
import com.pj.springboot.approval.repository.ApprovalDocRepository;
import com.pj.springboot.approval.repository.ApprovalLineRepository;
import com.pj.springboot.approval.repository.TimeoffRequestRepository;

@Service
@Transactional
public class ApprovalService {

    private final ApprovalDocRepository docRepo;
    private final ApprovalLineRepository lineRepo;
    private final TimeoffRequestRepository timeoffRepo;
    private final FileUpload fileUpload;

    // application.properties: app.admin-employee-id=9001
    private final Integer adminEmployeeId;

    public ApprovalService(ApprovalDocRepository docRepo,
                           ApprovalLineRepository lineRepo,
                           TimeoffRequestRepository timeoffRepo,
                           FileUpload fileUpload,
                           @Value("${app.admin-employee-id:9001}") Integer adminEmployeeId) {
        this.docRepo = docRepo;
        this.lineRepo = lineRepo;
        this.timeoffRepo = timeoffRepo;
        this.fileUpload = fileUpload;
        this.adminEmployeeId = adminEmployeeId;
    }

    /* 목록 */
    @Transactional(readOnly = true)
    public Page<ApprovalDto> listApprovals(String status, Pageable pageable) {
        ApprovalDoc.DocStatus parsed = parseStatus(status);
        Page<ApprovalDoc> page = (parsed == null)
                ? docRepo.findAll(pageable)
                : docRepo.findByApprovalStatus(parsed, pageable);

        return page.map(d -> new ApprovalDto(
                d.getApprovalDocId(),
                d.getApprovalTitle(),
                d.getApprovalContent(),
                d.getApprovalDate(),
                d.getApprovalStatus(),
                d.getApprovalAuthor(),
                d.getApprovalCategory()
        ));
    }

    /* 상세 */
    @Transactional(readOnly = true)
    public ApprovalDetailDto getApproval(String docId, Integer me) {
        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));

        List<ApprovalLine> lines = lineRepo.findByDocApprovalDocIdOrderByApprovalSequenceAsc(docId);

        List<ApprovalLineDto> lineDtos = lines.stream()
                .map(l -> new ApprovalLineDto(
                        l.getApprovalLineIdx(),
                        l.getApprovalId(),
                        l.getApprovalSequence(),
                        l.getApprovalLineStatus(),
                        l.getApprovalLineDate()
                ))
                .toList();

        boolean canApprove = false;
        if (me != null) {
            canApprove = lineRepo
                    .findFirstByDocApprovalDocIdAndApprovalLineStatusOrderByApprovalSequenceAsc(
                            docId, ApprovalLine.LineStatus.PENDING)
                    .map(cur -> cur.getApprovalId() != null && cur.getApprovalId().equals(me))
                    .orElse(false);
        }

        return new ApprovalDetailDto(
                d.getApprovalDocId(),
                d.getApprovalTitle(),
                d.getApprovalContent(),
                d.getApprovalDate(),
                d.getApprovalStatus(),
                d.getOfile(),
                d.getSfile(),
                d.getApprovalAuthor(),
                d.getApprovalCategory(),
                lineDtos,
                canApprove
        );
    }

    /* 생성: 파일 첨부까지 처리 (멀티파트/JSON 공용) */
    public String create(CreateApprovalReq req, int author, MultipartFile file) {
        String docId = generateDocId();

        // 1) 문서 생성(한 번만 save, 중간 flush 없음)
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
            FileUpload.Saved saved = fileUpload.save(file, docId); // 저장명 접두어 docId
            d.setOfile(saved.originalName());
            d.setSfile(saved.savedName());
        } else {
            d.setOfile(null);
            d.setSfile(null);
        }

        docRepo.save(d);

        // 2) 동일한 managed 인스턴스로 자식들 연결(안전)
        ApprovalDoc managed = docRepo.getReferenceById(docId);

        // 결재선
        if (req.getLines() != null && !req.getLines().isEmpty()) {
            req.getLines().stream()
                    .sorted(Comparator.comparing(CreateApprovalReq.LineItem::getApprovalSequence))
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
            ApprovalLine l1 = new ApprovalLine();
            l1.setDoc(managed);
            l1.setApprovalId(author);
            l1.setApprovalSequence(1);
            l1.setApprovalLineStatus(ApprovalLine.LineStatus.PENDING);
            lineRepo.save(l1);
        }

        // TIMEOFF (@MapsId 이므로 PK를 직접 세팅하지 않음)
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

    // JSON 전용 호출 호환
    public String create(CreateApprovalReq req, int author) {
        return create(req, author, null);
    }

    /* 수정 */
    public void update(String docId, UpdateApprovalReq req) {
        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));

        if (req.getTitle() != null)   d.setApprovalTitle(req.getTitle().trim());
        if (req.getContent() != null) d.setApprovalContent(req.getContent());
        if (req.getCategory() != null) d.setApprovalCategory(req.getCategory());
        docRepo.save(d);
    }

    /* 승인 */
    public void approve(String docId, int me, String opinion) {
        ApprovalLine cur = lineRepo
                .findFirstByDocApprovalDocIdAndApprovalLineStatusOrderByApprovalSequenceAsc(
                        docId, ApprovalLine.LineStatus.PENDING)
                .orElseThrow(() -> new IllegalStateException("결재할 단계가 없습니다."));

        if (!meEquals(cur.getApprovalId(), me)) {
            throw new SecurityException("이 문서의 결재 권한이 없습니다.");
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
        }
    }

    /* 반려 */
    public void reject(String docId, int me, String opinion) {
        ApprovalLine cur = lineRepo
                .findFirstByDocApprovalDocIdAndApprovalLineStatusOrderByApprovalSequenceAsc(
                        docId, ApprovalLine.LineStatus.PENDING)
                .orElseThrow(() -> new IllegalStateException("결재할 단계가 없습니다."));

        if (!meEquals(cur.getApprovalId(), me)) {
            throw new SecurityException("이 문서의 결재 권한이 없습니다.");
        }

        cur.setApprovalLineStatus(ApprovalLine.LineStatus.REJECTED);
        cur.setApprovalLineDate(LocalDateTime.now());
        lineRepo.save(cur);

        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));
        d.setApprovalStatus(ApprovalDoc.DocStatus.REJECTED);
        docRepo.save(d);
    }

    /* 내 결재할 문서 */
    @Transactional(readOnly = true)
    public Page<ApprovalDto> myTodo(int me, Pageable pageable) {
        Page<ApprovalLine> lines = lineRepo.findByApprovalIdAndApprovalLineStatus(
                me, ApprovalLine.LineStatus.PENDING, pageable);

        return lines.map(l -> {
            ApprovalDoc d = l.getDoc();
            return new ApprovalDto(
                    d.getApprovalDocId(),
                    d.getApprovalTitle(),
                    d.getApprovalContent(),
                    d.getApprovalDate(),
                    d.getApprovalStatus(),
                    d.getApprovalAuthor(),
                    d.getApprovalCategory()
            );
        });
    }

    /* 삭제: 작성자 또는 관리자만 */
    public void delete(String docId, Integer me) {
        ApprovalDoc d = docRepo.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + docId));

        boolean isAdmin = (me != null && adminEmployeeId != null && adminEmployeeId.equals(me));
        boolean isOwner = (me != null && meEquals(d.getApprovalAuthor(), me));

        if (!(isAdmin || isOwner)) {
            throw new SecurityException("삭제 권한이 없습니다.");
        }
        if (!isAdmin && d.getApprovalStatus() == ApprovalDoc.DocStatus.APPROVED) {
            throw new SecurityException("승인 완료 문서는 관리자만 삭제할 수 있습니다.");
        }

        // 자식부터 삭제
        timeoffRepo.deleteByApprovalDocId(docId);
        lineRepo.deleteByDocApprovalDocId(docId);

        // 물리 파일 삭제
        if (d.getSfile() != null && !d.getSfile().isBlank()) {
            fileUpload.deleteQuietly(d.getSfile());
        }

        docRepo.delete(d);
    }

    /* 다운로드 DTO */
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

    // ---------- util ----------
    private boolean meEquals(Integer x, int me) { return x != null && x == me; }
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
