package com.example.blogserver.repository;

import com.example.blogserver.entity.ArticleRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRevisionRepository extends JpaRepository<ArticleRevision, Long> {
    // 根据文章 ID 查询所有历史版本，按时间倒序
    List<ArticleRevision> findByPostIdOrderByCreatedAtDesc(Long postId);
}