package com.example.blogserver.controller;

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

    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};

    @PostMapping
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, String> result = new HashMap<>();
        
        try {
            if (file.isEmpty()) {
                result.put("message", "文件不能为空");
                return result;
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                result.put("message", "文件大小不能超过 5MB");
                return result;
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                result.put("message", "文件名无效");
                return result;
            }

            String suffix = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            boolean isAllowed = false;
            for (String ext : ALLOWED_EXTENSIONS) {
                if (ext.equals(suffix)) {
                    isAllowed = true;
                    break;
                }
            }
            if (!isAllowed) {
                result.put("message", "只允许上传图片格式：" + String.join(", ", ALLOWED_EXTENSIONS));
                return result;
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                result.put("message", "非法文件类型，必须是图片");
                return result;
            }

            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String newFileName = UUID.randomUUID().toString() + suffix;
            File dest = new File(uploadDir + newFileName);
            file.transferTo(dest);

            String url = "http://localhost:8080/uploads/" + newFileName;
            result.put("url", url);
            result.put("message", "上传成功");
            
        } catch (IOException e) {
            e.printStackTrace();
            result.put("message", "上传失败");
        }
        
        return result;
    }
}