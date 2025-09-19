package com.pj.springboot.recaptcha.service;

import com.pj.springboot.recaptcha.dto.RecaptchaDTO.VerifyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

/**
 * reCAPTCHA v2 토큰 서버 검증 서비스
 */
@Service
@RequiredArgsConstructor
public class RecaptchaService {

    private final RestTemplate restTemplate;

    @Value("${recaptcha.secret}")
    private String secret;

    @Value("${recaptcha.verify-url}")
    private String verifyUrl;

    public boolean verify(String token, String remoteIp) {
        if (token == null || token.isBlank()) return false;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("secret", secret);
        form.add("response", token);
        if (remoteIp != null && !remoteIp.isBlank()) form.add("remoteip", remoteIp);

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(form, headers);

        VerifyResponse res = restTemplate.postForObject(verifyUrl, entity, VerifyResponse.class);
        return res != null && res.success();
    }
}
