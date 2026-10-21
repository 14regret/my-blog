package com.example.blogserver.controller;

import com.example.blogserver.entity.Post;
import com.example.blogserver.repository.PostRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
public class RssController {

    @Value("${app.domain}") // 【修复】注入域名配置
    private String domain;

    private final PostRepository postRepository;

    public RssController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @GetMapping(value = "/rss.xml", produces = "application/rss+xml;charset=UTF-8")
    public String getRssFeed() {
        PageRequest pageRequest = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Post> posts = postRepository.findByIsDraftIsNullOrIsDraftFalse(pageRequest).getContent();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n");
        xml.append("<rss version=\"2.0\">\n");
        xml.append("<channel>\n");
        xml.append("  <title>Mxj 的博客</title>\n");
        xml.append("  <link>").append(domain).append("</link>\n");
        xml.append("  <description>那些生死悲欢，你以为是人世一生，可月亮见得太多了，知道那只是沉埃一瞬。</description>\n");
        xml.append("  <language>zh-CN</language>\n");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss 'GMT'");

        for (Post post : posts) {
            xml.append("  <item>\n");
            xml.append("    <title>").append(escapeXml(post.getTitle())).append("</title>\n");
            xml.append("    <link>").append(domain).append("/post/").append(post.getId()).append("</link>\n");
            
            String plainText = post.getContent().replaceAll("!\\[.*?\\]\\(.*?\\)", "").replaceAll("[#*`>\\[\\]]", "").trim();
            if (plainText.length() > 150) plainText = plainText.substring(0, 150) + "...";
            
            xml.append("    <description>").append(escapeXml(plainText)).append("</description>\n");
            xml.append("    <pubDate>").append(post.getCreatedAt().format(formatter)).append("</pubDate>\n");
            xml.append("    <guid>").append(domain).append("/post/").append(post.getId()).append("</guid>\n");
            xml.append("  </item>\n");
        }

        xml.append("</channel>\n");
        xml.append("</rss>");
        return xml.toString();
    }

    private String escapeXml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&apos;");
    }
}