package com.example.blogserver.repository;

import com.example.blogserver.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // 根据文章 ID 查评论，并按时间倒序排列
    List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);
}