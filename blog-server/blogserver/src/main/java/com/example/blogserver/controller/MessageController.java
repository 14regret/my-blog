package com.example.blogserver.controller;

import com.example.blogserver.entity.Message;
import com.example.blogserver.repository.MessageRepository;
import com.example.blogserver.util.SensitiveWordUtil;
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
        // 敏感词过滤
        message.setContent(SensitiveWordUtil.filter(message.getContent()));
        message.setAuthor(SensitiveWordUtil.filter(message.getAuthor()));
        return messageRepository.save(message);
    }

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messageRepository.deleteById(id);
    }
}