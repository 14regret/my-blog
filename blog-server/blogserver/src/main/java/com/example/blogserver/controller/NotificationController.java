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

    @GetMapping("/unread-count")
    public long getUnreadCount(HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        return notificationRepository.countByReceiverAndIsReadFalse(username);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        Notification noti = notificationRepository.findById(id).orElse(null);
        // 【越权修复】只能操作自己的消息
        if (noti != null && noti.getReceiver().equals(username)) {
            noti.setIsRead(true);
            notificationRepository.save(noti);
        }
    }

    @PutMapping("/read-all")
    public void markAllAsRead(HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        List<Notification> unreads = notificationRepository.findByReceiverOrderByCreatedAtDesc(username);
        unreads.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreads);
    }
}