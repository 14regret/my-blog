package com.example.blogserver.controller;

import com.example.blogserver.entity.User;
import com.example.blogserver.repository.UserRepository;
import com.example.blogserver.util.JwtUtil;
import com.example.blogserver.util.PasswordUtil;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    // 记录登录失败次数 {username: {count: 次数, lockTime: 锁定时间戳}}
    private final Map<String, Map<String, Long>> loginAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_TIME = 15 * 60 * 1000; // 锁定 15 分钟

    public LoginController(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> registerData) {
        String username = registerData.get("username");
        String password = registerData.get("password");
        Map<String, String> result = new HashMap<>();

        if (username == null || password == null || username.trim().isEmpty() || password.trim().isEmpty()) {
            result.put("message", "用户名和密码不能为空");
            return result;
        }
        // 【防弱口令】校验密码强度（至少8位，包含字母和数字）
        if (password.length() < 8 || !password.matches(".*[a-zA-Z].*") || !password.matches(".*\\d.*")) {
            result.put("message", "密码太弱，必须至少8位且包含字母和数字");
            return result;
        }

        if (userRepository.findByUsername(username).isPresent()) {
            result.put("message", "用户名已存在，请换一个");
            return result;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(PasswordUtil.hashPassword(password));
        userRepository.save(user);

        result.put("message", "注册成功");
        return result;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        Map<String, String> result = new HashMap<>();

        // 【防爆破】检查是否已被锁定
        Map<String, Long> attemptInfo = loginAttempts.getOrDefault(username, new HashMap<>());
        long count = attemptInfo.getOrDefault("count", 0L);
        long lockTime = attemptInfo.getOrDefault("lockTime", 0L);
        
        if (count >= MAX_ATTEMPTS) {
            if (System.currentTimeMillis() - lockTime < LOCK_TIME) {
                long remaining = (LOCK_TIME - (System.currentTimeMillis() - lockTime)) / 60000;
                result.put("message", "账号已被锁定，请 " + remaining + " 分钟后再试");
                return result;
            } else {
                loginAttempts.remove(username); // 解锁
            }
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent() && PasswordUtil.checkPassword(password, userOpt.get().getPassword())) {
            loginAttempts.remove(username); // 登录成功清空记录
            String token = jwtUtil.generateToken(username);
            result.put("token", token);
            result.put("message", "登录成功");
            result.put("username", username);
        } else {
            // 记录失败次数
            count++;
            Map<String, Long> newInfo = new HashMap<>();
            newInfo.put("count", count);
            newInfo.put("lockTime", System.currentTimeMillis());
            loginAttempts.put(username, newInfo);
            
            result.put("message", "账号或密码错误，还有 " + (MAX_ATTEMPTS - count) + " 次机会");
        }
        return result;
    }
}