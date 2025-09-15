package com.pj.springboot.chat;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/** chat_users의 복합 PK */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ChatUserId implements Serializable {

    @Column(name = "chat_room_id", nullable = false)
    private Integer roomId;

    @Column(name = "chat_user_id", nullable = false)
    private Integer userId;
}
