package com.example.blogserver.config;

import com.example.blogserver.entity.FriendLink;
import com.example.blogserver.entity.Post;
import com.example.blogserver.repository.FriendLinkRepository;
import com.example.blogserver.repository.PostRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class ScheduledTask {

    private final PostRepository postRepository;
    private final FriendLinkRepository friendLinkRepository;

    public ScheduledTask(PostRepository postRepository, FriendLinkRepository friendLinkRepository) {
        this.postRepository = postRepository;
        this.friendLinkRepository = friendLinkRepository;
    }

    // 每 60 秒发布一次定时文章
    @Scheduled(fixedRate = 60000)
    public void publishScheduledPosts() {
        LocalDateTime now = LocalDateTime.now();
        List<Post> readyPosts = postRepository.findByIsDraftTrueAndScheduledTimeBefore(now);
        if (!readyPosts.isEmpty()) {
            for (Post post : readyPosts) {
                post.setIsDraft(false);
                post.setScheduledTime(null);
                postRepository.save(post);
                System.out.println("⏰ 定时任务：文章 [" + post.getTitle() + "] 已自动发布！");
            }
        }
    }

    // 【新增】每小时检测一次友链是否存活
    @Scheduled(fixedRate = 3600000) 
    public void checkFriendLinks() {
        List<FriendLink> links = friendLinkRepository.findAll();
        for (FriendLink link : links) {
            try {
                URL url = new URL(link.getUrl());
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("HEAD");
                connection.setConnectTimeout(3000);
                connection.setReadTimeout(3000);
                int responseCode = connection.getResponseCode();
                // 如果是 200-399 的状态码，说明网站正常
                link.setIsOnline(responseCode >= 200 && responseCode < 400);
            } catch (Exception e) {
                link.setIsOnline(false);
            }
            friendLinkRepository.save(link);
        }
        System.out.println("🔗 友链自动检测完成");
    }
}