package com.pj.springboot.chat;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 테이블 chat_users 매핑 (복합 PK = ChatUserId) */
@Data
@Entity
@Table(name = "chat_users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)   // ✅ JPA용 기본 생성자
@AllArgsConstructor                                  // 편의 생성자( new ChatUsers(new ChatUserId(...)) )
public class ChatUsers {

    @EmbeddedId
    private ChatUserId id;

    /** 가독성 좋은 팩토리 메서드(선택) */
    public static ChatUsers of(Integer roomId, Integer userId) {
        return new ChatUsers(new ChatUserId(roomId, userId));
    }
}
