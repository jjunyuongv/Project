package com.pj.springboot.location.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    // ✅ 브라우저와 서버에서 "같은" 키 사용 (Google 콘솔에서 API 제한: Maps JS / Places / Geocoding)
    private static final String API_KEY = "AIzaSyApetvzgAYf9QGbz9grSQRsnFfcJT9IWrY";

    private final RestClient http = RestClient.builder()
            .baseUrl("https://maps.googleapis.com")
            .build();

    // Nearby Search (초기: lat,lng,radius / 다음: pagetoken)
    @GetMapping("/nearby")
    public ResponseEntity<?> nearby(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Integer radius,      // meter
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, name = "openNow") Boolean openNow,
            @RequestParam(required = false, name = "pagetoken") String pageToken,
            HttpServletRequest request
    ) {
        boolean hasGeo = (lat != null && lng != null && radius != null);
        boolean hasToken = (pageToken != null && !pageToken.isBlank());

        if (!(hasGeo ^ hasToken)) {
            return badRequest(request, "INVALID_QUERY",
                    "다음 중 한 가지만 포함해 요청하세요: (1) lat,lng,radius  또는  (2) pagetoken");
        }

        var uriBuilder = UriComponentsBuilder
                .fromPath("/maps/api/place/nearbysearch/json")
                .queryParam("key", API_KEY);

        if (hasToken) {
            uriBuilder.queryParam("pagetoken", pageToken);
        } else {
            uriBuilder.queryParam("location", lat + "," + lng)
                      .queryParam("radius", radius);
            if (keyword != null && !keyword.isBlank()) uriBuilder.queryParam("keyword", keyword);
            if (type != null && !type.isBlank())       uriBuilder.queryParam("type", type);
            if (Boolean.TRUE.equals(openNow))          uriBuilder.queryParam("opennow", "true");
        }

        String body = http.get().uri(uriBuilder.build(true).toUri()).retrieve().body(String.class);
        return ResponseEntity.ok(body);
    }

    // Place Details
    @GetMapping("/details")
    public ResponseEntity<?> details(
            @RequestParam("placeId") String placeId,
            @RequestParam(required = false) String fields
    ) {
        var uriBuilder = UriComponentsBuilder
                .fromPath("/maps/api/place/details/json")
                .queryParam("place_id", placeId)
                .queryParam("key", API_KEY);
        if (fields != null && !fields.isBlank()) uriBuilder.queryParam("fields", fields);

        String body = http.get().uri(uriBuilder.build(true).toUri()).retrieve().body(String.class);
        return ResponseEntity.ok(body);
    }

    // Geocoding (address 또는 latlng 중 하나만)
    @GetMapping("/geocode")
    public ResponseEntity<?> geocode(
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String latlng,
            HttpServletRequest request
    ) {
        boolean hasAddress = (address != null && !address.isBlank());
        boolean hasLatLng  = (latlng != null && !latlng.isBlank());

        if (hasAddress == hasLatLng) {
            return badRequest(request, "INVALID_QUERY",
                    "address 또는 latlng 중 하나만 포함해 요청하세요.");
        }

        var uriBuilder = UriComponentsBuilder
                .fromPath("/maps/api/geocode/json")
                .queryParam("key", API_KEY);
        if (hasAddress) uriBuilder.queryParam("address", address);
        else            uriBuilder.queryParam("latlng", latlng);

        String body = http.get().uri(uriBuilder.build(true).toUri()).retrieve().body(String.class);
        return ResponseEntity.ok(body);
    }

    // Place Photo (바이트 그대로 반환)
    @GetMapping(value = "/photo", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> photo(
            @RequestParam("photoRef") String photoRef,
            @RequestParam(defaultValue = "600") int maxwidth
    ) {
        var uri = UriComponentsBuilder
                .fromPath("/maps/api/place/photo")
                .queryParam("photo_reference", photoRef)
                .queryParam("maxwidth", maxwidth)
                .queryParam("key", API_KEY)
                .build(true).toUri();

        byte[] bytes = http.get().uri(uri).retrieve().body(byte[].class);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(bytes);
    }

    // 공통 에러 포맷
    private ResponseEntity<ApiError> badRequest(HttpServletRequest req, String code, String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(HttpStatus.BAD_REQUEST, code, message, req.getRequestURI()));
    }

    private record ApiError(Instant timestamp, int status, String error, String code, String message, String path) {
        static ApiError of(HttpStatus status, String code, String message, String path) {
            return new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), code, message, path);
        }
    }
}
