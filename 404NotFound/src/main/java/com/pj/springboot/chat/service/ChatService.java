package com.pj.springboot.chat.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pj.springboot.chat.ChatMessage;
import com.pj.springboot.chat.ChatUserId;
import com.pj.springboot.chat.repository.ChatMessageRepository;
import com.pj.springboot.chat.repository.ChatRoomRepository;
import com.pj.springboot.chat.repository.ChatUsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService
{
    private final ChatUsersRepository usersRepo;
    private final ChatMessageRepository msgRepo;
    private final ChatRoomRepository roomRepo;

    /** 방 멤버만 메시지 전송 가능 */
    @Transactional
    public ChatMessage send(Integer roomId, Integer senderId, String content) {
        if (!usersRepo.isMember(roomId, senderId)) {
            throw new IllegalArgumentException("방 멤버가 아닙니다.");
        }
        ChatMessage m = new ChatMessage();
        m.setRoomId(roomId);
        m.setSenderId(senderId);
        m.setContent(content);
        return msgRepo.save(m);
    }

    /** 최신 → 과거 히스토리 */
    @Transactional(readOnly = true)
    public List<ChatMessage> history(Integer roomId, Integer beforeId, int size) {
        return msgRepo.pageHistory(roomId, beforeId, PageRequest.of(0, Math.min(size, 200)))
                      .getContent();
    }

    /**
     * 방 나가기.
     * - chat_users 에서 내 멤버십 제거
     * - 남은 멤버가 0명이면 메시지/방 삭제
     * @return 방 자체가 삭제되었는지 여부
     */
    @Transactional
    public boolean leaveRoom(int roomId, int me) {
        if (!usersRepo.isMember(roomId, me)) {
            // 이미 나간 경우에도 호출될 수 있으니, 사용자 경험상 200 처리하려면 false만 반환해도 됨
            return false;
        }

        usersRepo.deleteById(new ChatUserId(roomId, me));

        long left = usersRepo.countMembers(roomId);
        if (left == 0) {
            // 멤버가 없으면 방 정리
            msgRepo.deleteByRoomId(roomId);
            roomRepo.deleteById(roomId);
            return true;
        }
        return false;
    }
}
