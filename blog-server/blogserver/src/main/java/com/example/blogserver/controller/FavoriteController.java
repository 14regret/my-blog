package com.example.blogserver.controller;

import com.example.blogserver.entity.Favorite;
import com.example.blogserver.repository.FavoriteRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;

    public FavoriteController(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    // 获取当前登录用户的收藏列表
    @GetMapping
    public List<Favorite> getMyFavorites(HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        return favoriteRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    // 检查是否已收藏
    @GetMapping("/{postId}/check")
    public boolean checkFavorite(@PathVariable Long postId, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        return favoriteRepository.findByPostIdAndUsername(postId, username).isPresent();
    }

    // 切换收藏状态
    @PostMapping("/{postId}")
    public boolean toggleFavorite(@PathVariable Long postId, HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUsername");
        
        // 【修复】去掉 var，改成明确的 Optional<Favorite> 类型
        Optional<Favorite> existing = favoriteRepository.findByPostIdAndUsername(postId, username);
        
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return false; // 取消收藏
        } else {
            Favorite fav = new Favorite();
            fav.setPostId(postId);
            fav.setUsername(username);
            favoriteRepository.save(fav);
            return true; // 已收藏
        }
    }
}