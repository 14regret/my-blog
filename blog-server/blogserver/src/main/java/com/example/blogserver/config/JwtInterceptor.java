package com.example.blogserver.config;

import com.example.blogserver.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    public JwtInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 安全头
        response.setHeader("X-Frame-Options", "SAMEORIGIN");
        response.setHeader("X-Content-Type-Options", "nosniff");

        if ("OPTIONS".equals(request.getMethod())) return true;
        
        String uri = request.getRequestURI();

        // 提取 Token
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            String username = jwtUtil.parseToken(token);
            if (username != null) {
                request.setAttribute("currentUsername", username);
            }
        }

        // 游客可直接评论、留言
        if ("POST".equals(request.getMethod()) && (uri.contains("/comments") || uri.contains("/messages"))) {
            return true;
        }

        // GET 请求放行（草稿越权问题在 Controller 解决）
        if ("GET".equals(request.getMethod())) {
            return true;
        }

        // 其他 POST/PUT/DELETE 必须验证 Token
        if (request.getAttribute("currentUsername") != null) {
            return true;
        }

        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\": \"未登录或登录已过期\"}");
        return false;
    }
}