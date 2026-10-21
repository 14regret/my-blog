package com.example.blogserver.controller;

import com.example.blogserver.entity.Message;
import com.example.blogserver.repository.MessageRepository;
import com.example.blogserver.util.SensitiveWordUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageRepository messageRepository;
    
    public MessageController(MessageRepository messageRepository) { 
        this.messageRepository = messageRepository; 
    }

    @GetMapping
    public List<Message> getAllMessages() {
        return messageRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @PostMapping
    public Message addMessage(@Valid @RequestBody Message message) {
        message.setContent(SensitiveWordUtil.filter(message.getContent()));
        message.setAuthor(SensitiveWordUtil.filter(message.getAuthor()));
        return messageRepository.save(message);
    }

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable Long id, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        Message message = messageRepository.findById(id).orElse(null);
        
        if (message == null) return;
        // 【越权修复】只有管理员能删留言
        if (!"admin".equals(username)) {
            throw new RuntimeException("无权删除留言！");
        }
        messageRepository.deleteById(id);
    }
}