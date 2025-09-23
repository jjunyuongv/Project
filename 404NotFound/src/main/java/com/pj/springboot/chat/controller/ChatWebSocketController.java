package com.pj.springboot.chat.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.pj.springboot.chat.ChatMessage;
import com.pj.springboot.chat.repository.ChatUsersRepository;
import com.pj.springboot.chat.service.ChatService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final ChatUsersRepository usersRepo;
    private final SimpMessagingTemplate messagingTemplate;

    private int requireMeFromHeaders(SimpMessageHeaderAccessor headers) {
        Map<String, Object> attrs = headers.getSessionAttributes();
        if (attrs == null) throw new IllegalStateException("세션이 없습니다. 로그인 필요");
        Object v = attrs.get("employeeId");
        if (v instanceof Integer i) return i;
        if (v instanceof String s) return Integer.parseInt(s);
        throw new IllegalStateException("세션에 employeeId가 없습니다.");
    }

    @MessageMapping("/rooms/{roomId}/send")
    public void sendToRoom(@DestinationVariable("roomId") Integer roomId,
                           @Payload WsSendMessage payload,
                           SimpMessageHeaderAccessor headers) {

        int me = requireMeFromHeaders(headers);
        ChatMessage saved = chatService.send(roomId, me, payload.content());

        // 1) 방 토픽으로 메시지 브로드캐스트
        WsMessage dto = WsMessage.from(saved);
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId, dto);

        // 2) 사용자 알림 (보낸 사람 제외)
        List<Integer> peers = usersRepo.findPeerIds(roomId, me);
        Alert alert = new Alert("NEW_MESSAGE", roomId, me, snippet(saved.getContent(), 60), saved.getTime());
        for (Integer uid : peers) {
            messagingTemplate.convertAndSend("/topic/users/" + uid + "/alerts", alert);
        }
    }

    public record WsSendMessage(String content) {}

    public record WsMessage(Integer id, Integer roomId, Integer senderId, String content, LocalDateTime time) {
        static WsMessage from(ChatMessage m) {
            return new WsMessage(m.getId(), m.getRoomId(), m.getSenderId(), m.getContent(), m.getTime());
        }
    }

    public record Alert(String type, Integer roomId, Integer fromUserId, String preview, LocalDateTime time) {}

    private static String snippet(String s, int len) {
        if (s == null) return "";
        s = s.trim();
        return s.length() <= len ? s : s.substring(0, len) + "…";
    }
}
