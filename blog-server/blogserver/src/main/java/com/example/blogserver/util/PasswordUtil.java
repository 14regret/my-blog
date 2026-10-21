package com.example.blogserver.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordUtil {
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public static String hashPassword(String password) {
        return encoder.encode(password);
    }

    // 校验密码
    public static boolean checkPassword(String rawPassword, String hashedPassword) {
        if (hashedPassword == null || hashedPassword.isEmpty() || rawPassword == null) {
            return false;
        }
        try {
            // 兼容旧的 SHA-256 密码（长度 64 位）
            if (hashedPassword.length() == 64) {
                return oldSha256(rawPassword).equals(hashedPassword);
            }
            // 校验新的 BCrypt 密码
            return encoder.matches(rawPassword, hashedPassword);
        } catch (Exception e) {
            System.err.println("密码校验异常: " + e.getMessage());
            return false;
        }
    }

    private static String oldSha256(String password) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "";
        }
    }
}