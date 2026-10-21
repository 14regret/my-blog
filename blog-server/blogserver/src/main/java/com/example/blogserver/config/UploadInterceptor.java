package com.example.blogserver.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class UploadInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String referer = request.getHeader("Referer");
        String serverName = request.getServerName();
        
        // 允许直接访问、本站访问、本地开发访问
        if (referer == null || referer.contains(serverName) || referer.contains("localhost") || referer.contains("127.0.0.1")) {
            return true;
        }
        
        // 盗链拒绝
        response.setStatus(403);
        return false;
    }
}