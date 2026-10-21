package com.example.blogserver.repository;
import com.example.blogserver.entity.SiteConfig;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SiteConfigRepository extends JpaRepository<SiteConfig, Long> {}