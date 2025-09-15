package com.pj.springboot.chat.repository;

import com.pj.springboot.chat.ChatUsers;
import com.pj.springboot.chat.ChatUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatUsersRepository extends JpaRepository<ChatUsers, ChatUserId> {

    // 내가 속한 모든 방
    @Query("select cu from ChatUsers cu where cu.id.userId = :userId")
    List<ChatUsers> findAllByUser(@Param("userId") int userId);

    // 방 멤버 여부
    @Query("select case when count(cu)>0 then true else false end " +
           "from ChatUsers cu where cu.id.roomId=:roomId and cu.id.userId=:userId")
    boolean isMember(@Param("roomId") int roomId, @Param("userId") int userId);

    // 방의 다른 멤버들
    @Query("select cu.id.userId from ChatUsers cu where cu.id.roomId = :roomId and cu.id.userId <> :me")
    List<Integer> findPeerIds(@Param("roomId") int roomId, @Param("me") int me);

    // 방의 현재 멤버 수
    @Query("select count(cu) from ChatUsers cu where cu.id.roomId = :roomId")
    long countMembers(@Param("roomId") int roomId);

    // ✅ 방의 모든 멤버 ID (알림 발송용)
    @Query("select cu.id.userId from ChatUsers cu where cu.id.roomId = :roomId")
    List<Integer> findUserIdsByRoom(@Param("roomId") int roomId);
}
