package com.pj.springboot.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.pj.springboot.chat.repository.ChatUsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class ChatController {

    private final DirectRoomService directRoomService;
    private final ChatService chatService;
    private final ChatUsersRepository usersRepo;

    /* ----------------------------
       1) 1:1 방 생성/획득
       POST /api/chat/rooms/direct?userA=1001&userB=2002
       반환: { roomId, chatKey, name, type, createdAt, peerId }
       ---------------------------- */
    @PostMapping("/rooms/direct")
    public ResponseEntity<DirectRoomResponse> direct(@RequestParam int userA,
                                                     @RequestParam int userB) {
        ChatRoom r = directRoomService.getOrCreate(userA, userB);
        return ResponseEntity.ok(new DirectRoomResponse(
                r.getId(),
                r.getChatKey(),
                r.getName(),
                r.getType() != null ? r.getType().name() : null,
                r.getTime(),
                userB // 호출을 (me, other)로 하므로 peerId = userB
        ));
    }

    /* ----------------------------
       2) 내 방 목록
       GET /api/chat/rooms/my?me=1001
       반환: [{ roomId, peerId }]
       ---------------------------- */
    @GetMapping("/rooms/my")
    public List<MyRoom> myRooms(@RequestParam int me) {
        var my = usersRepo.findAllByUser(me);
        List<MyRoom> out = new ArrayList<>(my.size());
        for (var cu : my) {
            int roomId = cu.getId().getRoomId();
            // DM이면 1명, GROUP이면 여러 명이므로 첫 사람만 사용(표시용)
            var peers = usersRepo.findPeerIds(roomId, me);
            Integer peerId = peers.isEmpty() ? null : peers.get(0);
            out.add(new MyRoom(roomId, peerId));
        }
        return out;
    }

    /* ----------------------------
       3) 메시지 전송(REST; 기본은 STOMP 사용)
       POST /api/chat/messages?roomId=1&senderId=1001&content=안녕
       ---------------------------- */
    @PostMapping("/messages")
    public ResponseEntity<?> send(@RequestParam Integer roomId,
                                  @RequestParam Integer senderId,
                                  @RequestParam String content) {
        try {
            return ResponseEntity.ok(chatService.send(roomId, senderId, content));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /* ----------------------------
       4) 히스토리 (최신→과거, 커서)
       GET /api/chat/rooms/{roomId}/messages?beforeId=&size=50
       ---------------------------- */
    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessage> history(@PathVariable Integer roomId,
                                     @RequestParam(required = false) Integer beforeId,
                                     @RequestParam(defaultValue = "50") Integer size) {
        return chatService.history(roomId, beforeId, size);
    }

    /* ----------------------------
       5) 방 나가기
       DELETE /api/chat/rooms/{roomId}/leave?me=1001
       반환: { left: true, roomRemoved: boolean }
       - chat_users에서 내 멤버십 삭제
       - 남은 멤버 0명이면 메시지/방까지 삭제
       ---------------------------- */
    @DeleteMapping("/rooms/{roomId}/leave")
    public Map<String, Object> leave(@PathVariable Integer roomId,
                                     @RequestParam int me) {
        boolean roomRemoved = chatService.leaveRoom(roomId, me);
        return Map.of(
                "left", true,
                "roomRemoved", roomRemoved
        );
    }

    /* ===== DTO ===== */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record DirectRoomResponse(
            Integer roomId,
            String chatKey,
            String name,
            String type,
            LocalDateTime createdAt,
            Integer peerId
    ) {}

    public record MyRoom(Integer roomId, Integer peerId) {}
}
