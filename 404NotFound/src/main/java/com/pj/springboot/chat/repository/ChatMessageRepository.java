package com.pj.springboot.chat.repository;

import com.pj.springboot.chat.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer>
{
    // 최신 → 과거 커서 페이징
    @Query("""
           select m from ChatMessage m
            where m.roomId = :roomId
              and (:beforeId is null or m.id < :beforeId)
            order by m.id desc
           """)
    Page<ChatMessage> pageHistory(@Param("roomId") Integer roomId,
                                  @Param("beforeId") Integer beforeId,
                                  Pageable pageable);

    // 방의 모든 메시지 삭제
    void deleteByRoomId(Integer roomId);
}
