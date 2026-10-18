package com.example.blogserver.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String author;
    private String category;
    private String tags;

    @Column(columnDefinition = "int default 0")
    private Integer views = 0;
    
    @Column(columnDefinition = "int default 0")
    private Integer likes = 0;

    // 【新增】是否是草稿：true为草稿，false或null为已发布
    private Boolean isDraft = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.views == null) this.views = 0;
        if (this.likes == null) this.likes = 0;
        if (this.isDraft == null) this.isDraft = false;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }
    public Integer getLikes() { return likes; }
    public void setLikes(Integer likes) { this.likes = likes; }
    public Boolean getIsDraft() { return isDraft; }
    public void setIsDraft(Boolean isDraft) { this.isDraft = isDraft; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}