package com.example.blogserver.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    // 密钥（实际项目要放在配置文件里，这里为了方便直接写死）
    private static final Key KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    // 过期时间：24小时
    private static final long EXPIRATION_TIME = 86400000;

    // 生成 Token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(KEY)
                .compact();
    }

    // 解析 Token，如果无效会抛出异常
    public String parseToken(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(KEY).build()
                    .parseClaimsJws(token).getBody().getSubject();
        } catch (Exception e) {
            return null; // 解析失败（过期或被篡改）
        }
    }
}