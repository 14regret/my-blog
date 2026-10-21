package com.example.blogserver.config;

import com.example.blogserver.entity.Post;
import com.example.blogserver.entity.User;
import com.example.blogserver.repository.PostRepository;
import com.example.blogserver.repository.UserRepository;
import com.example.blogserver.util.PasswordUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Optional;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(PostRepository repository, UserRepository userRepository) {
        return args -> {
            // 1. 强制修复 admin 账号
            Optional<User> adminOpt = userRepository.findByUsername("admin");
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                // 强行覆盖密码为 BCrypt 加密的 123456
                admin.setPassword(PasswordUtil.hashPassword("123456"));
                userRepository.save(admin);
                System.out.println("✅ 管理员密码已被强制重置为 (admin / 123456)");
            } else {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(PasswordUtil.hashPassword("123456"));
                userRepository.save(admin);
                System.out.println("✅ 默认管理员已创建 (admin / 123456)");
            }

            // 2. 初始化测试文章
            if (repository.count() == 0) {
                Post p1 = new Post();
                p1.setTitle("我的第一篇博客");
                p1.setContent("这是我的第一篇测试文章，Spring Boot 后端搭建成功！");
                p1.setAuthor("admin");
                p1.setCategory("生活随笔");
                p1.setTags("日常,折腾");
                repository.save(p1);
            }
        };
    }
}