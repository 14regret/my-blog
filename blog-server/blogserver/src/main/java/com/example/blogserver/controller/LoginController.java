package com.example.blogserver.controller;

import com.example.blogserver.entity.User;
import com.example.blogserver.repository.UserRepository;
import com.example.blogserver.util.JwtUtil;
import com.example.blogserver.util.PasswordUtil;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

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

        if (userRepository.findByUsername(username).isPresent()) {
            result.put("message", "用户名已存在，请换一个");
            return result;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(PasswordUtil.hashPassword(password)); // 使用 BCrypt 加密
        userRepository.save(user);

        result.put("message", "注册成功");
        return result;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        Map<String, String> result = new HashMap<>();

        Optional<User> userOpt = userRepository.findByUsername(username);
        
        // 使用 PasswordUtil.checkPassword 进行校验
        if (userOpt.isPresent() && PasswordUtil.checkPassword(password, userOpt.get().getPassword())) {
            String token = jwtUtil.generateToken(username);
            result.put("token", token);
            result.put("message", "登录成功");
            result.put("username", username);
        } else {
            result.put("message", "账号或密码错误");
        }
        return result;
    }
}