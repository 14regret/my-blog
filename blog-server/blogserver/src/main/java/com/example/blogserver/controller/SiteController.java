package com.example.blogserver.controller;

import com.example.blogserver.entity.SiteConfig;
import com.example.blogserver.entity.User;
import com.example.blogserver.repository.SiteConfigRepository;
import com.example.blogserver.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SiteController {

    private final SiteConfigRepository configRepository;
    private final UserRepository userRepository;

    public SiteController(SiteConfigRepository configRepository, UserRepository userRepository) {
        this.configRepository = configRepository;
        this.userRepository = userRepository;
    }

    // 获取公告
    @GetMapping("/config/announcement")
    public Map<String, String> getAnnouncement() {
        SiteConfig config = configRepository.findAll().stream().findFirst().orElse(new SiteConfig());
        Map<String, String> res = new HashMap<>();
        res.put("announcement", config.getAnnouncement() == null ? "" : config.getAnnouncement());
        return res;
    }

    // 修改公告 (仅管理员)
    @PostMapping("/config/announcement")
    public Map<String, String> updateAnnouncement(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        if (!"admin".equals(username)) throw new RuntimeException("无权操作");
        
        SiteConfig config = configRepository.findAll().stream().findFirst().orElse(new SiteConfig());
        config.setAnnouncement(body.get("announcement"));
        configRepository.save(config);
        return body;
    }

    // 获取用户资料
    @GetMapping("/users/{username}/profile")
    public Map<String, Object> getUserProfile(@PathVariable String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("用户不存在"));
        Map<String, Object> res = new HashMap<>();
        res.put("username", user.getUsername());
        res.put("avatar", user.getAvatar());
        res.put("bio", user.getBio());
        res.put("createdAt", user.getCreatedAt());
        return res;
    }

    // 更新当前用户资料
    @PostMapping("/users/profile")
    public void updateProfile(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        User user = userRepository.findByUsername(username).orElseThrow();
        user.setAvatar(body.get("avatar"));
        user.setBio(body.get("bio"));
        userRepository.save(user);
    }
}