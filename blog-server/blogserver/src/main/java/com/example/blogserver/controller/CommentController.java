package com.example.blogserver.controller;

import com.example.blogserver.entity.AdminLog;
import com.example.blogserver.entity.Comment;
import com.example.blogserver.entity.Notification;
import com.example.blogserver.entity.Post;
import com.example.blogserver.repository.AdminLogRepository;
import com.example.blogserver.repository.CommentRepository;
import com.example.blogserver.repository.NotificationRepository;
import com.example.blogserver.repository.PostRepository;
import com.example.blogserver.util.SensitiveWordUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final NotificationRepository notificationRepository;
    private final AdminLogRepository adminLogRepository;

    public CommentController(CommentRepository commentRepository, PostRepository postRepository, NotificationRepository notificationRepository, AdminLogRepository adminLogRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.notificationRepository = notificationRepository;
        this.adminLogRepository = adminLogRepository;
    }

    // ... getComments / getAllComments 原样保留 ...

    @GetMapping("/posts/{postId}/comments")
    public List<Comment> getComments(@PathVariable Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    @GetMapping("/comments")
    public List<Comment> getAllComments() {
        return commentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @PostMapping("/posts/{postId}/comments")
    public Comment addComment(@PathVariable Long postId, @Valid @RequestBody Comment comment) {
        // ... 原样保留：过滤、保存、发通知 ...
        comment.setPostId(postId);
        comment.setContent(SensitiveWordUtil.filter(comment.getContent()));
        comment.setAuthor(SensitiveWordUtil.filter(comment.getAuthor()));
        Comment saved = commentRepository.save(comment);
        try {
            Post post = postRepository.findById(postId).orElse(null);
            if (post != null) {
                String postAuthor = post.getAuthor();
                String commenter = saved.getAuthor();
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
                } else if (!postAuthor.equals(commenter)) {
                    Notification noti = new Notification();
                    noti.setReceiver(postAuthor);
                    noti.setSender(commenter);
                    noti.setContent("评论了你的文章《" + post.getTitle() + "》：" + saved.getContent());
                    noti.setPostId(postId);
                    notificationRepository.save(noti);
                }
            }
        } catch (Exception e) { System.err.println("发送通知失败: " + e.getMessage()); }
        return saved;
    }

    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable Long id, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        Comment comment = commentRepository.findById(id).orElse(null);
        if (comment == null) return;

        // 【越权修复】只有管理员或评论作者本人能删
        if (!"admin".equals(username) && !username.equals(comment.getAuthor())) {
            throw new RuntimeException("无权删除他人的评论！");
        }

        // 记录审计日志
        AdminLog log = new AdminLog();
        log.setUsername(username);
        log.setAction("删除了评论(ID:" + id + ")，内容：" + comment.getContent());
        log.setIp(request.getRemoteAddr());
        adminLogRepository.save(log);

        List<Comment> children = commentRepository.findByParentId(id);
        if (!children.isEmpty()) {
            commentRepository.deleteAll(children);
        }
        commentRepository.deleteById(id);
    }
}