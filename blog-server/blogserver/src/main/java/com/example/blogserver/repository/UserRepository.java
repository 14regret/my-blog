package com.example.blogserver.repository;

import com.example.blogserver.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // 根据用户名查找用户
    Optional<User> findByUsername(String username);
}