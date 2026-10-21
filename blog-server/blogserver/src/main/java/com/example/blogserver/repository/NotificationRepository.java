package com.example.blogserver.repository;

import com.example.blogserver.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // 查询当前用户的所有通知，按时间倒序
    List<Notification> findByReceiverOrderByCreatedAtDesc(String receiver);
    
    // 统计未读数量
    long countByReceiverAndIsReadFalse(String receiver);
}