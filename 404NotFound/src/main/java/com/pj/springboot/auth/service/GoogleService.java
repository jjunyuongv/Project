package com.pj.springboot.auth.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.pj.springboot.auth.EmployeeEntity;
import com.pj.springboot.auth.dto.EmployeeDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoogleService {

    private final EmployeeService employeeService;

    @Value("${google.client-id}")
    private String CLIENT_ID;

    @Value("${google.client-secret}")
    private String CLIENT_SECRET;

    @Value("${google.redirect-uri}")
    private String REDIRECT_URI;

    public EmployeeDTO getUserInfo(String code) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        // 1. 구글 토큰 요청
        String tokenUrl = "https://oauth2.googleapis.com/token";
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", CLIENT_ID);
        params.add("client_secret", CLIENT_SECRET);
        params.add("redirect_uri", REDIRECT_URI);
        params.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUrl, request, Map.class);
        if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
            throw new Exception("구글 토큰 요청 실패");
        }
        String accessToken = (String) tokenResponse.get("access_token");

        // 2. 사용자 정보 요청
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        HttpEntity<String> userRequest = new HttpEntity<>(userHeaders);

        Map<String, Object> googleUser = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                HttpMethod.GET,
                userRequest,
                Map.class
        ).getBody();

        if (googleUser == null) throw new Exception("구글 사용자 정보 요청 실패");

        String googleId = (String) googleUser.get("id");      // 필수
        String email = (String) googleUser.get("email");      // 대부분 제공
        String name = (String) googleUser.get("name");        // 이름

        // 3. DB 조회
        EmployeeEntity user = employeeService.findByGoogleId(googleId);
        if (user == null) {
            user = EmployeeEntity.builder()
                    .employeeId(Integer.parseInt(employeeService.generateEmployeeId()))
                    .googleId(googleId)
                    .loginId("google_" + googleId)
                    .name(name != null ? name : "구글사용자")
                    .email(email != null ? email : "noemail@example.com")
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
}
