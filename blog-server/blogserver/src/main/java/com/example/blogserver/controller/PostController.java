package com.example.blogserver.controller;

import com.example.blogserver.entity.Post;
import com.example.blogserver.repository.PostRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;

    public PostController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @GetMapping
    public Page<Post> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String keyword) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (keyword != null && !keyword.trim().isEmpty()) {
            return postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseAndIsDraftIsNullOrIsDraftFalse(keyword, keyword, pageRequest);
        } else if (category != null && !category.isEmpty()) {
            return postRepository.findByCategoryAndIsDraftIsNullOrIsDraftFalse(category, pageRequest);
        } else if (tag != null && !tag.isEmpty()) {
            return postRepository.findByTagsContainingAndIsDraftIsNullOrIsDraftFalse(tag, pageRequest);
        } else {
            return postRepository.findByIsDraftIsNullOrIsDraftFalse(pageRequest); // 默认查非草稿
        }
    }

    @GetMapping("/{id}")
    public Post getPostById(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElse(null);
        if (post != null && !Boolean.TRUE.equals(post.getIsDraft())) {
            post.setViews(post.getViews() + 1); // 草稿不计阅读量
            postRepository.save(post);
        }
        return post;
    }

    @PutMapping("/{id}/like")
    public Post likePost(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElse(null);
        if (post != null) {
            post.setLikes(post.getLikes() + 1);
            return postRepository.save(post);
        }
        return null;
    }

    @PostMapping
    public Post createPost(@RequestBody Post post, HttpServletRequest request) {
        String currentUsername = (String) request.getAttribute("currentUsername");
        post.setAuthor(currentUsername);
        return postRepository.save(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Post postDetails, HttpServletRequest request) {
        Post post = postRepository.findById(id).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();

        String currentUsername = (String) request.getAttribute("currentUsername");
        if (!"admin".equals(currentUsername) && !currentUsername.equals(post.getAuthor())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("无权修改他人的文章！");
        }

        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        post.setCategory(postDetails.getCategory());
        post.setTags(postDetails.getTags());
        post.setIsDraft(postDetails.getIsDraft()); // 更新草稿状态
        return ResponseEntity.ok(postRepository.save(post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, HttpServletRequest request) {
        Post post = postRepository.findById(id).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();

        String currentUsername = (String) request.getAttribute("currentUsername");
        if (!"admin".equals(currentUsername) && !currentUsername.equals(post.getAuthor())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("无权删除他人的文章！");
        }

        postRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}