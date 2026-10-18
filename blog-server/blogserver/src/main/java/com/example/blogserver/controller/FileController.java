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

    @PostMapping
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, String> result = new HashMap<>();
        
        try {
            // 获取项目根目录下的 uploads 文件夹
            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs(); // 文件夹不存在就创建
            }

            // 获取原文件名后缀
            String originalFilename = file.getOriginalFilename();
            String suffix = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            
            // 生成随机文件名，防止重名覆盖
            String newFileName = UUID.randomUUID().toString() + suffix;

            // 保存文件到本地
            File dest = new File(uploadDir + newFileName);
            file.transferTo(dest);

            // 返回给前端的图片访问 URL
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