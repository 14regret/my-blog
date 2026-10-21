package com.example.blogserver.controller;

import com.example.blogserver.entity.Notification;
import com.example.blogserver.repository.NotificationRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<Notification> getMyNotifications(HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        return notificationRepository.findByReceiverOrderByCreatedAtDesc(username);
    }

    // 获取未读消息数量
    @GetMapping("/unread-count")
    public long getUnreadCount(HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        return notificationRepository.countByReceiverAndIsReadFalse(username);
    }

    // 标记为已读
    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        Notification noti = notificationRepository.findById(id).orElse(null);
        if (noti != null) {
            noti.setIsRead(true);
            notificationRepository.save(noti);
        }
    }

    // 全部标记已读
    @PutMapping("/read-all")
    public void markAllAsRead(HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        List<Notification> unreads = notificationRepository.findByReceiverOrderByCreatedAtDesc(username);
        unreads.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreads);
    }
}