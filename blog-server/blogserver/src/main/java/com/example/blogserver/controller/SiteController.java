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

    // 获取全站配置
    @GetMapping("/config")
    public SiteConfig getConfig() {
        SiteConfig config = configRepository.findAll().stream().findFirst().orElse(new SiteConfig());
        // 如果没有配置过，给一些默认值
        if (config.getSiteName() == null) config.setSiteName("Mxj 的博客");
        if (config.getSiteSubtitle() == null) config.setSiteSubtitle("那些生死悲欢，你以为是人世一生，可月亮见得太多了，知道那只是沉埃一瞬。");
        return config;
    }

    // 更新全站配置 (仅管理员)
    @PostMapping("/config")
    public SiteConfig updateConfig(@RequestBody SiteConfig newConfig, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        if (!"admin".equals(username)) throw new RuntimeException("无权操作");
        
        SiteConfig config = configRepository.findAll().stream().findFirst().orElse(new SiteConfig());
        
        config.setAnnouncement(newConfig.getAnnouncement());
        config.setSiteName(newConfig.getSiteName());
        config.setSiteSubtitle(newConfig.getSiteSubtitle());
        config.setSiteFooter(newConfig.getSiteFooter());
        config.setSiteRecord(newConfig.getSiteRecord());
        
        return configRepository.save(config);
    }

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

    @PostMapping("/users/profile")
    public void updateProfile(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        User user = userRepository.findByUsername(username).orElseThrow();
        user.setAvatar(body.get("avatar"));
        user.setBio(body.get("bio"));
        userRepository.save(user);
    }
}