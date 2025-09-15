package com.pj.springboot.common;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

// REST 컨트롤러(@RestController)에서 발생한 예외만 JSON으로 처리
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(annotations = RestController.class)
public class GlobalExceptionHandler {

    private ResponseEntity<Map<String, Object>> json(HttpStatus status, String code, String message, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", code);
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("path", req.getRequestURI());
        body.put("message", message);
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String,Object>> badJson(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return json(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMostSpecificCause().getMessage(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> beanValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .findFirst().map(e -> e.getField() + ": " + e.getDefaultMessage())
                .orElse("Validation failed");
        return json(HttpStatus.BAD_REQUEST, "BAD_REQUEST", msg, req);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String,Object>> methodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return json(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", ex.getMessage(), req);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String,Object>> db(DataAccessException ex, HttpServletRequest req) {
        return json(HttpStatus.INTERNAL_SERVER_ERROR, "DB_ERROR", ex.getMostSpecificCause().getMessage(), req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> any(Exception ex, HttpServletRequest req) {
        return json(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", ex.getMessage(), req);
    }
}
