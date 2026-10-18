package com.example.blogserver.config;

import com.example.blogserver.entity.Post;
import com.example.blogserver.entity.User;
import com.example.blogserver.repository.PostRepository;
import com.example.blogserver.repository.UserRepository;
import com.example.blogserver.util.PasswordUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(PostRepository repository, UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(PasswordUtil.hashPassword("123456"));
                userRepository.save(admin);
            }

            if (repository.count() == 0) {
                Post p1 = new Post();
                p1.setTitle("我的第一篇博客");
                p1.setContent("这是我的第一篇测试文章，Spring Boot 后端搭建成功！");
                p1.setAuthor("Admin");
                p1.setCategory("生活随笔"); // 初始化分类
                p1.setTags("日常,折腾");  // 初始化标签
                repository.save(p1);

                Post p2 = new Post();
                p2.setTitle("React 学习笔记");
                p2.setContent("前端页面也快搭好了，期待前后端联调。");
                p2.setAuthor("Admin");
                p2.setCategory("技术分享");
                p2.setTags("React,前端");
                repository.save(p2);
            }
        };
    }
}