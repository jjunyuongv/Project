package com.pj.springboot.chat;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/** chat_room 매핑 (채팅방) */
@Data
@Entity
@Table(name = "chat_room")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← AUTO_INCREMENT 대응
    @Column(name = "chat_id")
    private Integer id;

    @Column(name = "chat_name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "chat_type", nullable = false, length = 10) // 'DIRECT' | 'GROUP'
    private ChatType type;

    @Column(name = "chat_key", length = 100)             // 1:1 중복방 방지 키 (ex: "1001#2002")
    private String chatKey;

    @Column(name = "chat_time", nullable = false, updatable = false, insertable = false)
    private LocalDateTime time;                           // DB DEFAULT CURRENT_TIMESTAMP 사용
}
