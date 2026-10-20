package com.example.blogserver.repository;

import com.example.blogserver.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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

    // 【新增】查找所有状态为草稿，且定时发布时间已经过了的文章
    List<Post> findByIsDraftTrueAndScheduledTimeBefore(LocalDateTime time);
}