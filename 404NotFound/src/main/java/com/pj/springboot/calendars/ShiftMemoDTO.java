package com.pj.springboot.calendars;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ShiftMemoDTO {
    private Integer memoId;
    private Integer shiftEmployeeId;
    private LocalDate memoDate;
    private String teamName;
    private String content;
}
