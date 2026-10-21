package com.example.blogserver.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "site_configs")
public class SiteConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 当前生效的公告内容，如果为空就不显示横幅
    @Column(columnDefinition = "TEXT")
    private String announcement;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAnnouncement() { return announcement; }
    public void setAnnouncement(String announcement) { this.announcement = announcement; }
}