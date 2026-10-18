package com.example.blogserver.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    public WebConfig(JwtInterceptor jwtInterceptor) {
        this.jwtInterceptor = jwtInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String path = System.getProperty("user.dir") + "/uploads/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + path);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 拦截所有 /api/ 开头的请求
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/**")
                // 【关键】放行登录接口！否则登录请求没带 Token 会被直接拦截报 401
                .excludePathPatterns("/api/auth/**"); 
    }
}