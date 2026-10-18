package com.example.blogserver.repository;

import com.example.blogserver.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // 前台查询一律只查：isDraft 为 null（旧数据） 或者 isDraft 为 false（新发布的文章）
    Page<Post> findByIsDraftIsNullOrIsDraftFalse(Pageable pageable);
    
    Page<Post> findByCategoryAndIsDraftIsNullOrIsDraftFalse(String category, Pageable pageable);
    
    Page<Post> findByTagsContainingAndIsDraftIsNullOrIsDraftFalse(String tag, Pageable pageable);
    
    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseAndIsDraftIsNullOrIsDraftFalse(String title, String content, Pageable pageable);
    
    // 后台查询草稿
    Page<Post> findByIsDraftTrue(Pageable pageable);
}