package com.pj.springboot.calendars;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}