package com.example.blogserver.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;
    private final UploadInterceptor uploadInterceptor; // 新增

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    public WebConfig(JwtInterceptor jwtInterceptor, RateLimitInterceptor rateLimitInterceptor, UploadInterceptor uploadInterceptor) {
        this.jwtInterceptor = jwtInterceptor;
        this.rateLimitInterceptor = rateLimitInterceptor;
        this.uploadInterceptor = uploadInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOrigins.split(","))
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
        // 限流
        registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/api/**");
        
        // 鉴权
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**");

        // 防盗链
        registry.addInterceptor(uploadInterceptor).addPathPatterns("/uploads/**");
    }
}