package com.pj.springboot.chat.controller;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.pj.springboot.chat.ChatMessage;
import com.pj.springboot.chat.ChatRoom;
import com.pj.springboot.chat.repository.ChatRoomRepository;
import com.pj.springboot.chat.repository.ChatUsersRepository;
import com.pj.springboot.chat.service.ChatService;
import com.pj.springboot.chat.service.DirectRoomService;
import com.pj.springboot.chat.service.GroupRoomService;
import com.pj.springboot.auth.repository.EmployeeRepository;   // 👈 직원 레포만 주입 (서비스 변경 없음)
import com.pj.springboot.auth.EmployeeEntity;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * /api/chat 하위 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" }, allowCredentials = "true")
public class ChatController {

    private final DirectRoomService directRoomService;
    private final GroupRoomService groupRoomService;
    private final ChatService chatService;
    private final ChatUsersRepository usersRepo;
    private final ChatRoomRepository roomRepo;

    // 👇 직원 서비스는 건드리지 않고 Repository만 읽기용 주입
    private final EmployeeRepository employeeRepository;

    /* ----------------------------
       1) 1:1 방 생성/획득
       POST /api/chat/rooms/direct?userA=1001&userB=2002
       ---------------------------- */
    @PostMapping("/rooms/direct")
    public ResponseEntity<DirectRoomResponse> direct(
            @RequestParam(name = "userA") int userA,   // ★ name 명시
            @RequestParam(name = "userB") int userB    // ★ name 명시
    ) {
        ChatRoom r = directRoomService.getOrCreate(userA, userB);

        // 호출자가 userA(= me)라고 가정 → 상대는 userB
        String peerName = findEmployeeName(userB);

        return ResponseEntity.ok(new DirectRoomResponse(
                r.getId(),
                r.getChatKey(),
                r.getName(),
                r.getType() != null ? r.getType().name() : null,
                r.getTime(),
                userB,
                peerName      // 👈 상대 이름 포함
        ));
    }

    /* ----------------------------
       2) 그룹방 생성
       POST /api/chat/rooms/group
       body: { "name":"프로젝트A", "memberIds":[20250002, 20250001] }
       ---------------------------- */
    @PostMapping("/rooms/group")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupReq req) {
        try {
            if (req == null || req.memberIds() == null || req.memberIds().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "memberIds는 필수입니다."));
            }
            ChatRoom room = groupRoomService.create(
                    (req.name() == null || req.name().isBlank()) ? "그룹 채팅방" : req.name().trim(),
                    req.memberIds()
            );
            String typeStr = room.getType() != null ? room.getType().name() : "GROUP";
            LocalDateTime createdAt = room.getTime();
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("roomId", room.getId());
            body.put("name", room.getName());
            body.put("type", typeStr);
            body.put("createdAt", createdAt);
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "서버 오류"));
        }
    }

    /* ----------------------------
       3) 내 방 목록
       GET /api/chat/rooms/my?me=1001
       반환: [{ roomId, peerId, peerName, name, type }]
       ---------------------------- */
    @GetMapping("/rooms/my")
    public List<MyRoom> myRooms(@RequestParam(name = "me") int me) { // ★ name 명시
        var my = usersRepo.findAllByUser(me);
        List<MyRoom> out = new ArrayList<>(my.size());
        for (var cu : my) {
            int roomId = cu.getId().getRoomId();

            // 표시용 peer(첫 번째 상대)
            var peers = usersRepo.findPeerIds(roomId, me);
            Integer peerId = peers.isEmpty() ? null : peers.get(0);

            // 방 메타 정보
            ChatRoom room = roomRepo.findById(roomId).orElse(null);
            String name = room != null ? room.getName() : null;
            String type = (room != null && room.getType() != null) ? room.getType().name() : null;

            // DIRECT면 상대 이름 조회
            String peerName = (peerId != null && "DIRECT".equals(type)) ? findEmployeeName(peerId) : null;

            out.add(new MyRoom(roomId, peerId, peerName, name, type));
        }
        return out;
    }

    /* ----------------------------
       4) 메시지 전송(REST; 기본은 STOMP 사용)
       POST /api/chat/messages?roomId=1&senderId=1001&content=안녕
       ---------------------------- */
    @PostMapping("/messages")
    public ResponseEntity<?> send(
            @RequestParam(name = "roomId") Integer roomId,     // ★ name 명시
            @RequestParam(name = "senderId") Integer senderId, // ★ name 명시
            @RequestParam(name = "content") String content     // ★ name 명시
    ) {
        try {
            return ResponseEntity.ok(chatService.send(roomId, senderId, content));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /* ----------------------------
       5) 히스토리 (최신→과거, 커서)
       GET /api/chat/rooms/{roomId}/messages?beforeId=&size=50
       ---------------------------- */
    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessage> history(
            @PathVariable(name = "roomId") Integer roomId,           // ★ name 명시
            @RequestParam(name = "beforeId", required = false) Integer beforeId, // ★ name 명시
            @RequestParam(name = "size", defaultValue = "50") Integer size       // ★ name 명시
    ) {
        return chatService.history(roomId, beforeId, size);
    }

    /* ----------------------------
       6) 방 나가기
       ---------------------------- */
    @DeleteMapping("/rooms/{roomId}/leave")
    public Map<String, Object> leave(
            @PathVariable(name = "roomId") Integer roomId, // ★ name 명시
            @RequestParam(name = "me") int me              // ★ name 명시
    ) {
        boolean roomRemoved = chatService.leaveRoom(roomId, me);
        return Map.of("left", true, "roomRemoved", roomRemoved);
    }

    /* ----------------------------
       7) 방 참여(방번호로 참가)
       ---------------------------- */
    @PostMapping("/rooms/{roomId}/join")
    public Map<String, Object> join(
            @PathVariable(name = "roomId") Integer roomId,  // ★ name 명시
            @RequestParam(name = "me") Integer me           // ★ name 명시 (기존 value → name 통일)
    ) {
        groupRoomService.addMembers(roomId, List.of(me));
        return Map.of("joined", true);
    }

    /* ----------------------------
       8) 초대(다수 사용자 추가)
       ---------------------------- */
    @PostMapping("/rooms/{roomId}/invite")
    public Map<String, Object> invite(
            @PathVariable(name = "roomId") Integer roomId,  // ★ name 명시
            @RequestBody InviteReq req
    ) {
        var ids = (req == null || req.memberIds() == null) ? List.<Integer>of() : req.memberIds();
        groupRoomService.addMembers(roomId, ids);
        return Map.of("invited", ids.size());
    }

    /* ===== 내부 유틸 ===== */
    private String findEmployeeName(Integer employeeId) {
        if (employeeId == null) return null;
        return employeeRepository.findById(employeeId)
                .map(EmployeeEntity::getName)
                .orElse(null);
    }

    /* ===== DTO ===== */
    public record CreateGroupReq(String name, List<Integer> memberIds) {}
    public record InviteReq(List<Integer> memberIds) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record DirectRoomResponse(
            Integer roomId,
            String chatKey,
            String name,       // DB상의 방 이름: "DM a-b"
            String type,       // "DIRECT" | "GROUP"
            LocalDateTime createdAt,
            Integer peerId,    // 상대 사번
            String peerName    // 👈 상대 이름
    ) {}

    // 👇 peerName 추가
    public record MyRoom(Integer roomId, Integer peerId, String peerName, String name, String type) {}
}
