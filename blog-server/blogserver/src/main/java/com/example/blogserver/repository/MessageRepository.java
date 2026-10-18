package com.example.blogserver.repository;
import com.example.blogserver.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MessageRepository extends JpaRepository<Message, Long> {}