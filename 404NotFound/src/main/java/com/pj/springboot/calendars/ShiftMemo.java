package com.pj.springboot.calendars;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(
    name = "SHIFT_MEMOS",
    uniqueConstraints = @UniqueConstraint(
        name = "UQ_SHIFT_MEMO",
        columnNames = {"SHIFT_EMPLOYEE_ID","MEMO_DATE","TEAM_NAME"}
    )
)
@Getter
@Setter
public class ShiftMemo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MEMO_ID")
    private Integer memoId;

    @Column(name = "SHIFT_EMPLOYEE_ID", nullable = false)
    private Integer shiftEmployeeId;

    @Column(name = "MEMO_DATE", nullable = false)
    private LocalDate memoDate;

    @Column(name = "TEAM_NAME", nullable = false, length = 20)
    private String teamName;

    @Column(name = "CONTENT", nullable = false, columnDefinition = "TEXT")
    private String content;
}
