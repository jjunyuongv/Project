package com.pj.springboot.chat.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pj.springboot.chat.ChatRoom;
import com.pj.springboot.chat.ChatType;
import com.pj.springboot.chat.ChatUserId;
import com.pj.springboot.chat.ChatUsers;
import com.pj.springboot.chat.repository.ChatRoomRepository;
import com.pj.springboot.chat.repository.ChatUsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupRoomService {

    private final ChatRoomRepository roomRepo;
    private final ChatUsersRepository usersRepo;

    /** 그룹방 생성: name, 멤버들 등록(중복 제거) */
    @Transactional
    public ChatRoom create(String name, List<Integer> memberIds) {
        if (memberIds == null || memberIds.size() < 2) {
            throw new IllegalArgumentException("그룹 멤버는 2명 이상이어야 합니다.");
        }

        ChatRoom r = new ChatRoom();
        r.setName((name == null || name.isBlank()) ? "그룹 채팅방" : name.trim());
        r.setType(ChatType.GROUP);

        // 🔑 그룹도 고유 chatKey 부여 (스키마가 NOT NULL/UNIQUE여도 안전)
        String key = "G-" + System.currentTimeMillis() + "-" + (int) (Math.random() * 100000);
        r.setChatKey(key);

        ChatRoom saved = roomRepo.save(r);

        addMembersInternal(saved.getId(), memberIds);
        return saved;
    }

    /** 외부 공개: 방에 멤버 추가(초대/참여) */
    @Transactional
    public void addMembers(Integer roomId, List<Integer> memberIds) {
        addMembersInternal(roomId, memberIds);
    }

    /** 실제 멤버 추가 로직 (중복 저장은 무시) */
    private void addMembersInternal(Integer roomId, List<Integer> memberIds) {
        if (roomId == null || memberIds == null || memberIds.isEmpty()) return;

        // 중복 제거 + 입력 순서 유지
        Set<Integer> uniq = new LinkedHashSet<>(memberIds);
        for (Integer uid : uniq) {
            if (uid == null) continue;
            try {
                usersRepo.save(new ChatUsers(new ChatUserId(roomId, uid)));
            } catch (DataIntegrityViolationException ignore) {
                // 이미 존재/동시성은 무시
            }
        }
    }
}
	