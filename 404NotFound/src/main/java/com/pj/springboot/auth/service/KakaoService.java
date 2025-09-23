package com.pj.springboot.auth.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.pj.springboot.auth.EmployeeEntity;
import com.pj.springboot.auth.dto.EmployeeDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KakaoService {

    private final EmployeeService employeeService;

    @Value("${kakao.rest-api-key}")
    private String REST_API_KEY;

    @Value("${kakao.redirect-uri}")
    private String REDIRECT_URI;

    private static int kakaoEmailCounter = 1;  

    public EmployeeDTO getUserInfo(String code) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        // 1. 카카오 토큰 요청
        String tokenUrl = "https://kauth.kakao.com/oauth/token";
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", REST_API_KEY);
        params.add("redirect_uri", REDIRECT_URI);
        params.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUrl, request, Map.class);
        if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
            throw new Exception("카카오 토큰 요청 실패");
        }
        String accessToken = (String) tokenResponse.get("access_token");

        // 2. 사용자 정보 요청
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        HttpEntity<String> userRequest = new HttpEntity<>(userHeaders);

        Map<String, Object> kakaoUser = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET,
                userRequest,
                Map.class
        ).getBody();

        if (kakaoUser == null) throw new Exception("카카오 사용자 정보 요청 실패");

        Map<String, Object> kakaoAccount = (Map<String, Object>) kakaoUser.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

        String email = (String) kakaoAccount.get("email"); // 이메일을 가져옵니다.
        if (email == null) {
            email = generateKakaoEmail();  // 이메일이 없으면 더미 이메일 생성
        } else {
            // 카카오 이메일이 null이 아니라면 중복된 이메일을 처리하기 위해 더미 이메일로 바꿔줍니다.
            email = generateUniqueEmail(email);  // 이메일 중복 체크 및 유니크 이메일 생성
        }

        String name = (String) profile.get("nickname");
        String kakaoId = String.valueOf(kakaoUser.get("id")); // 필수

        // 3. kakaoId 기준으로 DB 조회
        EmployeeEntity user = employeeService.findByKakaoId(kakaoId);
        if (user == null) {
            user = EmployeeEntity.builder()
                    .employeeId(Integer.parseInt(employeeService.generateEmployeeId()))
                    .kakaoId(kakaoId)
                    .loginId("kakao_" + kakaoId)
                    .name(name)      // 이름 저장
                    .email(email)    // 이메일 저장
                    .password("")    
                    .createDate(LocalDateTime.now())
                    .role("USER")
                    .build();
            employeeService.save(user);
        }

        // 4. DTO 반환
        return EmployeeDTO.builder()
                .employeeId(String.valueOf(user.getEmployeeId()))
                .name(user.getName())
                .loginId(user.getLoginId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // 유니크한 이메일을 생성하는 메서드
    private String generateUniqueEmail(String kakaoEmail) {
        String uniqueEmail = kakaoEmail;
        while (employeeService.findByEmail(uniqueEmail) != null) {
            uniqueEmail = generateKakaoEmail(); // 이메일 중복되면 새로 생성
        }
        return uniqueEmail;
    }

    // 카카오 이메일 생성 메서드 (홀수 이메일 생성)
    private static String generateKakaoEmail() {
        String email = "noemail" + (kakaoEmailCounter * 2 - 1) + "@example.com"; // 홀수 번호로 이메일 생성
        kakaoEmailCounter++;  // 카운터 증가
        return email;
    }
}

