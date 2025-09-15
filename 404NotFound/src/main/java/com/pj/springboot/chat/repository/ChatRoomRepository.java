package com.pj.springboot.chat.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pj.springboot.chat.ChatRoom;
import com.pj.springboot.chat.ChatType;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer>
{
	//dmKey로 DIRECT 방 조회 (파생 메서드)
    Optional<ChatRoom> findByTypeAndChatKey(ChatType type, String chatKey);

    //이름 LIKE 검색 + 정렬은 Pageable의 Sort로 (스샷 패턴)
    @Query("""
           select r from ChatRoom r
           where (:q is null or r.name like concat('%', :q, '%'))
           """)
    Page<ChatRoom> searchRooms(@Param("q") String keyword, Pageable pageable);

    //네이티브 예시: 최근 생성 방 N개 (테이블/컬럼 이름 사용)
    @Query(value = """
           select * from chat_room
           order by chat_time desc
           """, nativeQuery = true)
    Page<ChatRoom> findRecentRooms(Pageable pageable);
}
