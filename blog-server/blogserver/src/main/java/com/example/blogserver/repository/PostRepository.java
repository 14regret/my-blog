package com.example.blogserver.repository;

import com.example.blogserver.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByIsDraftIsNullOrIsDraftFalse(Pageable pageable);
    Page<Post> findByCategoryAndIsDraftIsNullOrIsDraftFalse(String category, Pageable pageable);
    Page<Post> findByTagsContainingAndIsDraftIsNullOrIsDraftFalse(String tag, Pageable pageable);
    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseAndIsDraftIsNullOrIsDraftFalse(String title, String content, Pageable pageable);
    Page<Post> findByIsDraftTrue(Pageable pageable);
    List<Post> findByIsDraftTrueAndScheduledTimeBefore(LocalDateTime time);
    List<Post> findByCategoryAndIdNotAndIsDraftIsNullOrIsDraftFalse(String category, Long id, Pageable pageable);

    // 【新增】随机获取一篇已发布的文章（基于 MySQL / H2 的随机函数）
    @Query(value = "SELECT * FROM posts WHERE is_draft = false OR is_draft IS NULL ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Post findRandomPost();
}