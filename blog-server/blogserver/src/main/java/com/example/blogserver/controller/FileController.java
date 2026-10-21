package com.example.blogserver.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileController {

    @Value("${app.domain}")
    private String domain; // 【修复】注入域名配置

    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};

    @PostMapping
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, String> result = new HashMap<>();
        try {
            if (file.isEmpty()) return msgResult(result, "文件不能为空");
            if (file.getSize() > 5 * 1024 * 1024) return msgResult(result, "文件大小不能超过 5MB");

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) return msgResult(result, "文件名无效");

            String suffix = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            boolean isAllowed = false;
            for (String ext : ALLOWED_EXTENSIONS) {
                if (ext.equals(suffix)) { isAllowed = true; break; }
            }
            if (!isAllowed) return msgResult(result, "只允许上传图片格式");

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) return msgResult(result, "非法文件类型");

            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String newFileName = UUID.randomUUID().toString() + suffix;
            File dest = new File(uploadDir + newFileName);
            file.transferTo(dest);

            // 【修复】使用配置的域名拼装地址
            String url = domain + "/uploads/" + newFileName;
            result.put("url", url);
            result.put("message", "上传成功");
        } catch (IOException e) {
            e.printStackTrace();
            result.put("message", "上传失败");
        }
        return result;
    }

    private Map<String, String> msgResult(Map<String, String> map, String msg) {
        map.put("message", msg);
        return map;
    }
}