package com.example.blogserver.controller;

import com.example.blogserver.entity.Comment;
import com.example.blogserver.entity.Notification;
import com.example.blogserver.entity.Post;
import com.example.blogserver.repository.CommentRepository;
import com.example.blogserver.repository.NotificationRepository;
import com.example.blogserver.repository.PostRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final NotificationRepository notificationRepository;

    public CommentController(CommentRepository commentRepository, PostRepository postRepository, NotificationRepository notificationRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.notificationRepository = notificationRepository;
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
        Comment saved = commentRepository.save(comment);

        // 【核心业务】发送通知逻辑
        try {
            Post post = postRepository.findById(postId).orElse(null);
            if (post != null) {
                String postAuthor = post.getAuthor();
                String commenter = saved.getAuthor();

                // 1. 如果是回复别人的评论（有 parentId）
                if (saved.getParentId() != null) {
                    Comment parentComment = commentRepository.findById(saved.getParentId()).orElse(null);
                    if (parentComment != null && !parentComment.getAuthor().equals(commenter)) {
                        Notification noti = new Notification();
                        noti.setReceiver(parentComment.getAuthor());
                        noti.setSender(commenter);
                        noti.setContent("在文章《" + post.getTitle() + "》中回复了你的评论：" + saved.getContent());
                        noti.setPostId(postId);
                        notificationRepository.save(noti);
                    }
                } 
                // 2. 如果是直接评论文章（并且评论者不是作者本人）
                else if (!postAuthor.equals(commenter)) {
                    Notification noti = new Notification();
                    noti.setReceiver(postAuthor);
                    noti.setSender(commenter);
                    noti.setContent("评论了你的文章《" + post.getTitle() + "》：" + saved.getContent());
                    noti.setPostId(postId);
                    notificationRepository.save(noti);
                }
            }
        } catch (Exception e) {
            System.err.println("发送通知失败: " + e.getMessage());
        }

        return saved;
    }

    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable Long id) {
        List<Comment> children = commentRepository.findByParentId(id);
        if (!children.isEmpty()) {
            commentRepository.deleteAll(children);
        }
        commentRepository.deleteById(id);
    }
}