package com.example.blogserver.repository;

import com.example.blogserver.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // 根据文章 ID 查评论，并按时间倒序排列
    List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);

    // 【新增】根据父级 ID 查子回复，用于级联删除
    List<Comment> findByParentId(Long parentId);
}