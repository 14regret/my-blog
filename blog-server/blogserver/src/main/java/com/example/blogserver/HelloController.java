package com.example.blogserver;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        return Map.of(
            "message", "后端启动成功 🎉",
            "time", LocalDateTime.now().toString()
        );
    }
}