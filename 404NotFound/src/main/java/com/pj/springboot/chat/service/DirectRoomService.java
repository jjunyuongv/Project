package com.pj.springboot.chat.service;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pj.springboot.chat.ChatRoom;
import com.pj.springboot.chat.ChatType;
import com.pj.springboot.chat.ChatUsers;
import com.pj.springboot.chat.repository.ChatRoomRepository;
import com.pj.springboot.chat.repository.ChatUsersRepository;

import lombok.RequiredArgsConstructor;

/**
 * 1:1(DIRECT) 채팅방 생성/조회 서비스.
 * - 중복 방 방지: chat_key = "작은ID#큰ID"
 * - 첫 생성 시 chat_users에 두 멤버를 함께 등록
 */
@Service
@RequiredArgsConstructor
public class DirectRoomService {

    private final ChatRoomRepository roomRepo;
    private final ChatUsersRepository usersRepo;

    /**
     * 두 사용자로 1:1 방을 가져오거나(존재하면) 생성한다.
     * 동시성 상황에서 UNIQUE(chat_key) 충돌이 나면 재조회하여 반환한다.
     */
    @Transactional
    public ChatRoom getOrCreate(int userA, int userB) {
        final int a = Math.min(userA, userB);
        final int b = Math.max(userA, userB);
        final String key = a + "#" + b;

        // 이미 있으면 바로 반환
        return roomRepo.findByTypeAndChatKey(ChatType.DIRECT, key)
                .orElseGet(() -> {
                    try {
                        // 새 방 생성
                        ChatRoom r = new ChatRoom();
                        r.setName("DM " + a + "-" + b);
                        r.setType(ChatType.DIRECT);
                        r.setChatKey(key);

                        ChatRoom saved = roomRepo.save(r);

                        // 멤버십 등록 (복합 PK: (roomId, userId))
                        // ChatUsers 엔티티에 기본 생성자(@NoArgsConstructor)가 반드시 있어야 함
                        try {
                            usersRepo.save(ChatUsers.of(saved.getId(), a));
                        } catch (DataIntegrityViolationException ignore) {
                            // 동시성으로 이미 들어간 경우 무시
                        }
                        try {
                            usersRepo.save(ChatUsers.of(saved.getId(), b));
                        } catch (DataIntegrityViolationException ignore) {
                            // 동시성으로 이미 들어간 경우 무시
                        }

                        return saved;

                    } catch (DataIntegrityViolationException e) {
                        // chat_key UNIQUE 충돌 → 누군가 먼저 만들었으니 재조회 후 반환
                        return roomRepo.findByTypeAndChatKey(ChatType.DIRECT, key)
                                .orElseThrow(() -> e);
                    }
                });
    }
}
