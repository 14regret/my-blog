package com.example.blogserver.repository;

import com.example.blogserver.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUsernameOrderByCreatedAtDesc(String username);
    Optional<Favorite> findByPostIdAndUsername(Long postId, String username);
    void deleteByPostIdAndUsername(Long postId, String username);
}