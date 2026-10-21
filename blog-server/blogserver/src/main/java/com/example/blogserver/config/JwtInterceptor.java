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
        // 【安全头修复】防止点击劫持和 MIME 嗅探
        response.setHeader("X-Frame-Options", "SAMEORIGIN");
        response.setHeader("X-Content-Type-Options", "nosniff");

        // 【防盗链修复】针对 /uploads/ 下的图片进行 Referer 校验
        String uri = request.getRequestURI();
        if (uri.startsWith("/uploads/")) {
            String referer = request.getHeader("Referer");
            // 如果是从其他网站直接引用图片（Referer不为空且不包含你的域名）
            if (referer != null && !referer.contains(request.getServerName())) {
                response.setStatus(403); // 拒绝访问，防盗链
                return false;
            }
        }

        if ("OPTIONS".equals(request.getMethod())) return true;
        
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            String username = jwtUtil.parseToken(token);
            if (username != null) {
                request.setAttribute("currentUsername", username);
            }
        }

        // 2. 如果是提交评论或提交留言，直接放行（允许游客操作）
        if ("POST".equals(request.getMethod()) && (uri.contains("/comments") || uri.contains("/messages"))) {
            return true;
        }

        // 3. 如果是 GET 请求直接放行
        if ("GET".equals(request.getMethod())) {
            return true;
        }

        // 4. 其他请求必须验证 Token
        if (request.getAttribute("currentUsername") != null) {
            return true;
        }

        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\": \"未登录或登录已过期\"}");
        return false;
    }
}