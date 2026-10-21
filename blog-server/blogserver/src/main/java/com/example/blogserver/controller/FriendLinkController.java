package com.example.blogserver.controller;

import com.example.blogserver.entity.FriendLink;
import com.example.blogserver.repository.FriendLinkRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friend-links")
public class FriendLinkController {

    private final FriendLinkRepository friendLinkRepository;

    public FriendLinkController(FriendLinkRepository friendLinkRepository) {
        this.friendLinkRepository = friendLinkRepository;
    }

    @GetMapping
    public List<FriendLink> getAllLinks() {
        return friendLinkRepository.findAll();
    }

    @PostMapping
    public FriendLink addLink(@RequestBody FriendLink link, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        if (!"admin".equals(username)) throw new RuntimeException("无权操作");
        link.setIsOnline(true); // 默认在线
        return friendLinkRepository.save(link);
    }

    @DeleteMapping("/{id}")
    public void deleteLink(@PathVariable Long id, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        if (!"admin".equals(username)) throw new RuntimeException("无权操作");
        friendLinkRepository.deleteById(id);
    }
}