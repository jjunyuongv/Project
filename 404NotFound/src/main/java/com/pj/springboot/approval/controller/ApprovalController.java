package com.pj.springboot.approval.controller;

import java.nio.charset.StandardCharsets;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pj.springboot.approval.dto.ApprovalDetailDto;
import com.pj.springboot.approval.dto.ApprovalDto;
import com.pj.springboot.approval.dto.ApproveOrRejectReq;
import com.pj.springboot.approval.dto.CreateApprovalReq;
import com.pj.springboot.approval.dto.UpdateApprovalReq;
import com.pj.springboot.approval.service.ApprovalService;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final ApprovalService service;

    public ApprovalController(ApprovalService service) {
        this.service = service;
    }

    // 목록
    @GetMapping
    public Page<ApprovalDto> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "approvalDate"));
        return service.listApprovals(status, pageable);
    }

    // 상세
    @GetMapping("/{docId}")
    public ApprovalDetailDto detail(@PathVariable String docId,
                                    @RequestHeader(value = "X-Employee-Id", required = false) String eid) {
        Integer me = parseIntOrNull(eid);
        return service.getApproval(docId, me);
    }

    // 생성 (JSON)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public String create(@RequestBody CreateApprovalReq req,
                         @RequestHeader(value = "X-Employee-Id", required = false) String eid) {
        int author = parseIntOrDefault(eid, 1001);
        return service.create(req, author, null);
    }

    // 생성 (멀티파트: data=JSON, file=첨부)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createMultipart(@RequestPart("data") CreateApprovalReq req,
                                                  @RequestPart(value = "file", required = false) MultipartFile file,
                                                  @RequestHeader(value = "X-Employee-Id", required = false) String eid) {
        int author = parseIntOrDefault(eid, 1001);
        String docId = service.create(req, author, file);
        return ResponseEntity.ok(docId);
    }

    // 수정
    @PutMapping("/{docId}")
    public void update(@PathVariable String docId, @RequestBody UpdateApprovalReq req) {
        service.update(docId, req);
    }

    // 승인
    @PostMapping("/{docId}/approve")
    public void approve(@PathVariable String docId,
                        @RequestBody(required = false) ApproveOrRejectReq body,
                        @RequestHeader("X-Employee-Id") String eid) {
        int me = Integer.parseInt(eid);
        service.approve(docId, me, body != null ? body.getOpinion() : null);
    }

    // 반려
    @PostMapping("/{docId}/reject")
    public void reject(@PathVariable String docId,
                       @RequestBody(required = false) ApproveOrRejectReq body,
                       @RequestHeader("X-Employee-Id") String eid) {
        int me = Integer.parseInt(eid);
        service.reject(docId, me, body != null ? body.getOpinion() : null);
    }

    // 내 결재할 문서
    @GetMapping("/todo")
    public Page<ApprovalDto> myTodo(@RequestHeader("X-Employee-Id") String eid,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        int me = Integer.parseInt(eid);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "approvalDate"));
        return service.myTodo(me, pageable);
    }

    // 삭제 (작성자 or 관리자)
    @DeleteMapping("/{docId}")
    public void delete(@PathVariable String docId,
                       @RequestHeader(value = "X-Employee-Id", required = false) String eid) {
        Integer me = parseIntOrNull(eid);
        service.delete(docId, me);
    }

    // 첨부 다운로드
    @GetMapping("/{docId}/file")
    public ResponseEntity<Resource> download(@PathVariable String docId) {
        ApprovalService.DownloadableFile file = service.getDownloadableFile(docId);
        if (file == null || file.resource() == null) {
            return ResponseEntity.notFound().build();
        }

        String filename = file.originalName() != null ? file.originalName() : "download";
        MediaType mediaType;
        try {
            mediaType = file.contentType() != null
                    ? MediaType.parseMediaType(file.contentType())
                    : MediaType.APPLICATION_OCTET_STREAM;
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(filename, StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .body(file.resource());
    }

    // -------- util --------
    private Integer parseIntOrNull(String s) {
        try { return s == null ? null : Integer.parseInt(s); }
        catch (Exception e) { return null; }
    }
    private int parseIntOrDefault(String s, int def) {
        try { return Integer.parseInt(s); } catch (Exception e) { return def; }
    }
}
