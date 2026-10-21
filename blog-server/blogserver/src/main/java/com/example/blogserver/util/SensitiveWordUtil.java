package com.example.blogserver.util;

import java.util.Arrays;
import java.util.List;

public class SensitiveWordUtil {
    // 内置敏感词库，实际项目中可以放入数据库或文件
    private static final List<String> SENSITIVE_WORDS = Arrays.asList(
            "广告", "代刷", "傻逼", "fuck", "shit", "他妈", "加微信", "加qq", "博彩", "网赚"
    );

    public static String filter(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        String result = text;
        for (String word : SENSITIVE_WORDS) {
            if (result.contains(word)) {
                // 替换为等长的 *
                String stars = "*".repeat(word.length());
                result = result.replaceAll(word, stars);
            }
        }
        return result;
    }
}