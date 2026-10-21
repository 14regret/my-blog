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
        // 1. 放开 OPTIONS 预检请求
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }
        
        // 2. 【核心修复】不管是什么请求，只要带了 Token，先尝试解析并存入 request 域
        // 这样后面的 Controller 不管是 GET 还是 POST，都能拿到 currentUsername
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            String username = jwtUtil.parseToken(token);
            if (username != null) {
                request.setAttribute("currentUsername", username);
            }
        }

        String uri = request.getRequestURI();

        // 3. 如果是提交评论或提交留言，直接放行（允许游客操作）
        if ("POST".equals(request.getMethod()) && (uri.contains("/comments") || uri.contains("/messages"))) {
            return true;
        }

        // 4. 如果是 GET 请求（查文章、查评论、查留言、查通知），直接放行
        if ("GET".equals(request.getMethod())) {
            return true;
        }

        // 5. 其他请求（POST 发文章 / PUT 改文章 / DELETE 删文章）必须验证 Token
        if (request.getAttribute("currentUsername") != null) {
            return true; // 前面已经解析成功了，直接放行
        }

        // 6. Token 无效或没有
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\": \"未登录或登录已过期\"}");
        return false;
    }
}