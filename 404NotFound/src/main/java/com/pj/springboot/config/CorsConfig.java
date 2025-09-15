/*
 * package com.pj.springboot.config;
 * 
 * import org.springframework.context.annotation.Configuration; import
 * org.springframework.web.servlet.config.annotation.CorsRegistry; import
 * org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
 * 
 * @Configuration public class CorsConfig implements WebMvcConfigurer {
 * 
 * @Override public void addCorsMappings(CorsRegistry registry) {
 * registry.addMapping("/**") // 모든 엔드포인트에 적용
 * .allowedOrigins("http://localhost:5173") // ✅ 프론트엔드 주소 .allowedMethods("GET",
 * "POST", "PUT", "DELETE") // 허용할 HTTP 메서드 .allowedHeaders("*") // 모든 헤더 허용
 * .allowCredentials(true); // 쿠키와 같은 인증 정보 허용 } }
 */