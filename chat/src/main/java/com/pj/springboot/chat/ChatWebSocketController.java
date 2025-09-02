package com.pj.springboot.chat;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController
{
	private final ChatService chatService;                 // 이미 만든 서비스 재사용
    private final SimpMessagingTemplate messagingTemplate; // 브로커로 발행

    // 클라이언트가 destination=/app/rooms/{roomId}/send 로 SEND하면 호출됨
    @MessageMapping("/rooms/{roomId}/send")
    public void sendToRoom(@DestinationVariable Integer roomId,
                           @Payload WsSendMessage payload) {
        // 1) 멤버 검증 + DB 저장 (서비스가 isMember 체크함)
        ChatMessage saved = chatService.send(roomId, payload.senderId(), payload.content());

        // 2) 방 구독자들에게 브로드캐스트
        WsMessage dto = WsMessage.from(saved);
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId, dto);
    }

    // 클라이언트 → 서버 전송 DTO
    public record WsSendMessage(Integer senderId, String content) {}

    // 서버 → 클라이언트 방송 DTO
    public record WsMessage(Integer id, Integer roomId, Integer senderId, String content,
                            java.time.LocalDateTime time) {
        static WsMessage from(ChatMessage m) {
            return new WsMessage(m.getId(), m.getRoomId(), m.getSenderId(), m.getContent(), m.getTime());
        }
    }
}
