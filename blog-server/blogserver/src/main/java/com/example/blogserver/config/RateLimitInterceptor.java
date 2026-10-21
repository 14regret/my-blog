package com.example.blogserver.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Deque;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // 记录 IP 的访问时间戳
    private final Map<String, Deque<Long>> requestCounts = new ConcurrentHashMap<>();
    
    // 限制规则：每 60 秒最多 5 次
    private static final int MAX_REQUESTS = 5; 
    private static final long TIME_WINDOW = 60 * 1000; 

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String ip = request.getRemoteAddr();
        String uri = request.getRequestURI();
        String method = request.getMethod();

        // 重点防御：登录接口、提交评论、提交留言
        if (uri.contains("/login") || 
           (uri.contains("/comments") && "POST".equals(method)) || 
           (uri.contains("/messages") && "POST".equals(method))) {
                
            String key = ip + ":" + uri;
            long now = System.currentTimeMillis();
            
            // 获取或创建该 IP 的访问记录队列
            Deque<Long> timestamps = requestCounts.computeIfAbsent(key, k -> new LinkedList<>());

            synchronized (timestamps) {
                // 清除时间窗口之前的记录
                while (!timestamps.isEmpty() && now - timestamps.peekFirst() > TIME_WINDOW) {
                    timestamps.pollFirst();
                }
                // 如果超过限制，拒绝请求
                if (timestamps.size() >= MAX_REQUESTS) {
                    response.setStatus(429);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"message\": \"操作过于频繁，请一分钟后再试！\"}");
                    return false;
                }
                // 记录本次请求时间
                timestamps.addLast(now);
            }
        }
        return true;
    }
}