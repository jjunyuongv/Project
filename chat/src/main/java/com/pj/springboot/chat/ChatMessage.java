package com.pj.springboot.chat;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

/** chat_message 매핑 (메시지 한 건) */
@Data
@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // ← AUTO_INCREMENT 대응
    @Column(name = "message_id")
    private Integer id;

    @Column(name = "message_room_id", nullable = false)
    private Integer roomId;

    @Column(name = "message_sender_id", nullable = false)
    private Integer senderId;

    @Lob                                          // TEXT와 호환(Hibernate는 LONGTEXT로 취급해도 쓰기 OK)
    @Column(name = "message_content", nullable = false)
    private String content;

    @Column(name = "message_time", nullable = false, updatable = false, insertable = false)
    private LocalDateTime time;                   // DB DEFAULT CURRENT_TIMESTAMP 사용
}
