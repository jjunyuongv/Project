package com.pj.springboot.approval;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileUpload {

    private final Path root;

    public FileUpload(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("업로드 디렉토리 생성 실패: " + root, e);
        }
    }

    /** 저장 결과 정보 (ApprovalService 기대 순서) */
    public static record Saved(String originalName, String savedName, String contentType) {}

    /** 파일 저장 */
    public Saved save(MultipartFile file, String prefix) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("빈 파일입니다.");
        }

        String original = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "file" : file.getOriginalFilename()
        );

        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) ext = original.substring(dot);

        String safePrefix = (prefix == null || prefix.isBlank()) ? "" : (prefix + "_");
        String saved = safePrefix + System.currentTimeMillis() + ext;

        Path dest = root.resolve(saved).normalize();
        try {
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }

        return new Saved(original, saved, file.getContentType());
    }

    /** 저장된 파일을 Spring Resource로 로드 */
    public Resource loadAsResource(String savedName) {
        if (savedName == null || savedName.isBlank()) return null;
        try {
            Path p = root.resolve(savedName).normalize();
            Resource res = new UrlResource(p.toUri());
            return (res.exists() && res.isReadable()) ? res : null;
        } catch (Exception e) {
            return null;
        }
    }

    /** 조용히 삭제 */
    public void deleteQuietly(String savedName) {
        if (savedName == null || savedName.isBlank()) return;
        try {
            Files.deleteIfExists(root.resolve(savedName).normalize());
        } catch (IOException ignore) {}
    }
}
