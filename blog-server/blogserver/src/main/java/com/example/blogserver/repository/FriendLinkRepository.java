package com.example.blogserver.repository;

import com.example.blogserver.entity.FriendLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendLinkRepository extends JpaRepository<FriendLink, Long> {
}