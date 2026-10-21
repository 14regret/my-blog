package com.example.blogserver.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "site_configs")
public class SiteConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String announcement;

    // 【新增】站点基本配置
    private String siteName;
    private String siteSubtitle;
    private String siteFooter; // 页脚版权信息
    private String siteRecord; // 备案号

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAnnouncement() { return announcement; }
    public void setAnnouncement(String announcement) { this.announcement = announcement; }
    
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public String getSiteSubtitle() { return siteSubtitle; }
    public void setSiteSubtitle(String siteSubtitle) { this.siteSubtitle = siteSubtitle; }
    public String getSiteFooter() { return siteFooter; }
    public void setSiteFooter(String siteFooter) { this.siteFooter = siteFooter; }
    public String getSiteRecord() { return siteRecord; }
    public void setSiteRecord(String siteRecord) { this.siteRecord = siteRecord; }
}