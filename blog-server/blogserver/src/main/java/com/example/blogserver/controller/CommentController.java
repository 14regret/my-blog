package com.example.blogserver.controller;

import com.example.blogserver.entity.Comment;
import com.example.blogserver.repository.CommentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentRepository commentRepository;

    public CommentController(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    // 获取某篇文章的评论 (前台用)
    @GetMapping("/posts/{postId}/comments")
    public List<Comment> getComments(@PathVariable Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    // 【新增】获取全站所有评论 (后台管理用)
    @GetMapping("/comments")
    public List<Comment> getAllComments() {
        return commentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // 游客发表评论
    @PostMapping("/posts/{postId}/comments")
    public Comment addComment(@PathVariable Long postId, @RequestBody Comment comment) {
        comment.setPostId(postId);
        return commentRepository.save(comment);
    }

    // 删除评论
    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable Long id) {
        commentRepository.deleteById(id);
    }
}