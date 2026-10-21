package com.example.blogserver.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secretString;

    // 过期时间：24小时
    private static final long EXPIRATION_TIME = 86400000;

    // 获取密钥
    private Key getKey() {
        return Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String parseToken(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(getKey()).build()
                    .parseClaimsJws(token).getBody().getSubject();
        } catch (Exception e) {
            return null; // 解析失败（过期或被篡改）
        }
    }
}