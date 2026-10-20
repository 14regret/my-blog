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

    @GetMapping("/posts/{postId}/comments")
    public List<Comment> getComments(@PathVariable Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    @GetMapping("/comments")
    public List<Comment> getAllComments() {
        return commentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @PostMapping("/posts/{postId}/comments")
    public Comment addComment(@PathVariable Long postId, @RequestBody Comment comment) {
        comment.setPostId(postId);
        // parentId 会自动通过 @RequestBody 绑定，无需手动处理
        return commentRepository.save(comment);
    }

    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable Long id) {
        // 如果删除了主评论，顺便把子回复也删了
        List<Comment> children = commentRepository.findByParentId(id);
        if (!children.isEmpty()) {
            commentRepository.deleteAll(children);
        }
        commentRepository.deleteById(id);
    }
}