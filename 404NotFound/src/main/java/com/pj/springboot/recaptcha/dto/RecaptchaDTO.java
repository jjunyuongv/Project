package com.pj.springboot.recaptcha.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * reCAPTCHA v2 siteverify 응답 DTO
 */
public class RecaptchaDTO {

    public static record VerifyResponse(
            boolean success,
            @JsonProperty("challenge_ts") String challengeTs,
            String hostname,
            @JsonProperty("error-codes") List<String> errorCodes
    ) {}
}
