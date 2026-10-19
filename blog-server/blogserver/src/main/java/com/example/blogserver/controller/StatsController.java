package com.example.blogserver.controller;

import com.example.blogserver.repository.CommentRepository;
import com.example.blogserver.repository.PostRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public StatsController(PostRepository postRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    @GetMapping
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalPosts = postRepository.count();
        long totalComments = commentRepository.count();
        
        // 计算总阅读量和总点赞量（使用 stream 遍历）
        int totalViews = postRepository.findAll().stream()
                .mapToInt(post -> post.getViews() == null ? 0 : post.getViews()).sum();
        int totalLikes = postRepository.findAll().stream()
                .mapToInt(post -> post.getLikes() == null ? 0 : post.getLikes()).sum();

        stats.put("totalPosts", totalPosts);
        stats.put("totalComments", totalComments);
        stats.put("totalViews", totalViews);
        stats.put("totalLikes", totalLikes);

        return stats;
    }
}