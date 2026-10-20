package com.example.blogserver.config;

import com.example.blogserver.entity.Post;
import com.example.blogserver.repository.PostRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ScheduledTask {

    private final PostRepository postRepository;

    public ScheduledTask(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // 每 60 秒（1分钟）执行一次扫描
    @Scheduled(fixedRate = 60000)
    public void publishScheduledPosts() {
        LocalDateTime now = LocalDateTime.now();
        List<Post> readyPosts = postRepository.findByIsDraftTrueAndScheduledTimeBefore(now);
        
        if (!readyPosts.isEmpty()) {
            for (Post post : readyPosts) {
                post.setIsDraft(false); // 将状态改为已发布
                post.setScheduledTime(null); // 清空定时时间
                postRepository.save(post);
                System.out.println("⏰ 定时任务：文章 [" + post.getTitle() + "] 已自动发布！");
            }
        }
    }
}