package com.pj.springboot.auth.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // CrossOrigin 제거

import com.pj.springboot.auth.dto.EmployeeDTO;
import com.pj.springboot.auth.dto.LoginDTO;
import com.pj.springboot.auth.dto.ResetPasswordRequestDTO;
import com.pj.springboot.auth.service.EmployeeService;
import com.pj.springboot.facilities.dto.FacilityEmployeeDTO;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    @Autowired
    private final EmployeeService employeeService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody EmployeeDTO dto) {
        try {
            employeeService.signup(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto, HttpSession session) {
        try {
            EmployeeDTO loggedInUser = employeeService.login(dto);
            session.setAttribute("employeeId", loggedInUser.getEmployeeId());
            session.setAttribute("employeeName", loggedInUser.getName());
            session.setAttribute("loggedInUser", loggedInUser);
            return ResponseEntity.ok(loggedInUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        try {
            employeeService.resetPassword(request);
            return ResponseEntity.ok("비밀번호가 성공적으로 재설정되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("비밀번호 재설정에 실패했습니다.");
        }
    }

    @PostMapping("/find-id")
    public ResponseEntity<Map<String, String>> findId(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String foundId = employeeService.findIdByNameAndEmail(name, email);

        Map<String, String> response = new HashMap<>();
        if (foundId != null) {
            response.put("foundId", foundId);
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "일치하는 아이디가 없습니다.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/session-check")
    public ResponseEntity<?> sessionCheck(HttpSession session) {
        Object loggedInUser = session.getAttribute("loggedInUser");
        if (loggedInUser != null) {
            return ResponseEntity.ok(loggedInUser);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("로그인 필요");
        }
    }

    // ===== 목록/검색/페이징 =====

    @GetMapping()
    public ResponseEntity<List<FacilityEmployeeDTO>> list() {
        return ResponseEntity.ok(employeeService.getList("FULL"));
    }

    @GetMapping("/modal")
    public ResponseEntity<List<FacilityEmployeeDTO>> listModal() {
        return ResponseEntity.ok(employeeService.getList("MODAL"));
    }

    @GetMapping("/{searchField}/{searchWord}")
    public ResponseEntity<List<FacilityEmployeeDTO>> listSearch(
            @PathVariable String searchField, @PathVariable String searchWord) {
        List<FacilityEmployeeDTO> list =
                employeeService.getListSearch(searchField, searchWord, "FULL");
        return ResponseEntity.ok(list);
    }

    @GetMapping("/modal/{searchField}/{searchWord}")
    public ResponseEntity<List<FacilityEmployeeDTO>> listSearchModal(
            @PathVariable String searchField, @PathVariable String searchWord) {
        List<FacilityEmployeeDTO> list =
                employeeService.getListSearch(searchField, searchWord, "MODAL");
        return ResponseEntity.ok(list);
    }

    @GetMapping("/page/{page}/{size}")
    public ResponseEntity<List<FacilityEmployeeDTO>> listWithPaging(
            @PathVariable int page, @PathVariable int size) {
        return ResponseEntity.ok(employeeService.getListWithPaging(page, size, "FULL"));
    }

    @GetMapping("/modal/page/{page}/{size}")
    public ResponseEntity<List<FacilityEmployeeDTO>> listWithPagingModal(
            @PathVariable int page, @PathVariable int size) {
        return ResponseEntity.ok(employeeService.getListWithPaging(page, size, "MODAL"));
    }

    @GetMapping("/count/{searchField}/{searchWord}")
    public Long searchCount(@PathVariable String searchField, @PathVariable String searchWord) {
        return employeeService.count(searchField, searchWord);
    }

    @GetMapping("/{searchField}/{searchWord}/page/{page}/{size}")
    public ResponseEntity<List<FacilityEmployeeDTO>> listSearchWithPaging(
            @PathVariable String searchField, @PathVariable String searchWord,
            @PathVariable int page, @PathVariable int size) {
        return ResponseEntity.ok(
                employeeService.getListSearchWithPaging(searchField, searchWord, page, size, "FULL"));
    }

    @GetMapping("/modal/{searchField}/{searchWord}/page/{page}/{size}")
    public ResponseEntity<List<FacilityEmployeeDTO>> listSearchWithPagingModal(
            @PathVariable String searchField, @PathVariable String searchWord,
            @PathVariable int page, @PathVariable int size) {
        return ResponseEntity.ok(
                employeeService.getListSearchWithPaging(searchField, searchWord, page, size, "MODAL"));
    }

    @GetMapping("/count")
    public Long count() {
        return employeeService.count();
    }
}
