package com.pj.springboot.calendars.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pj.springboot.calendars.ShiftMemo;
import com.pj.springboot.calendars.repository.ShiftMemoRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftMemoService {

    private final ShiftMemoRepository repo;

    @Transactional(readOnly = true)
    public List<ShiftMemo> list(Integer employeeId, LocalDate start, LocalDate end, String teamName) {
        if (employeeId == null) throw new IllegalArgumentException("employeeId는 필수입니다.");
        if (start == null || end == null) throw new IllegalArgumentException("start/end는 필수입니다.");
        if (end.isBefore(start)) throw new IllegalArgumentException("end가 start보다 앞일 수 없습니다.");

        if (teamName == null || teamName.isBlank()) {
            return repo.findRange(employeeId, start, end);
        }
        return repo.findRangeByTeam(employeeId, start, end, teamName);
    }

    @Transactional(readOnly = true)
    public ShiftMemo getOne(Integer memoId) {
        if (memoId == null) throw new IllegalArgumentException("memoId는 필수입니다.");
        return repo.findById(memoId)
                .orElseThrow(() -> new IllegalArgumentException("해당 메모가 없습니다. id=" + memoId));
    }

    @Transactional
    public ShiftMemo upsert(Integer employeeId, LocalDate memoDate, String teamName, String content) {
        if (employeeId == null) throw new IllegalArgumentException("employeeId는 필수입니다.");
        if (memoDate == null) throw new IllegalArgumentException("memoDate는 필수입니다.");
        if (teamName == null || teamName.isBlank())
            throw new IllegalArgumentException("teamName은 필수입니다. (예: A조/B조/C조/D조)");

        String safeContent = (content == null) ? "" : content;

        ShiftMemo memo = repo.findOneByComposite(employeeId, memoDate, teamName)
                .orElseGet(ShiftMemo::new);

        if (memo.getMemoId() == null) {
            memo.setShiftEmployeeId(employeeId);
            memo.setMemoDate(memoDate);
            memo.setTeamName(teamName);
        }
        memo.setContent(safeContent);

        return repo.save(memo);
    }

    /** ✅ 삭제는 아이템포턴트: 없어도, 예외가 떠도 204 처리를 위해 삼켜줌 */
    @Transactional
    public void delete(Integer memoId) {
        if (memoId == null) return;
        try {
            repo.deleteById(memoId);
        } catch (EmptyResultDataAccessException ignored) {
            // 이미 없으면 그대로 성공처럼 처리
        } catch (DataAccessException ex) {
            // DB 레벨 기타 예외도 204로 마무리하고 싶다면 그냥 로그만 남김
            // log.warn("delete memo failed (id={}) but ignoring: {}", memoId, ex.getMessage());
        }
    }
}
