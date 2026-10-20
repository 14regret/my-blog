package com.example.blogserver.controller;

import com.example.blogserver.entity.ArticleRevision;
import com.example.blogserver.entity.Post;
import com.example.blogserver.repository.ArticleRevisionRepository;
import com.example.blogserver.repository.PostRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;
    private final ArticleRevisionRepository revisionRepository;

    public PostController(PostRepository postRepository, ArticleRevisionRepository revisionRepository) {
        this.postRepository = postRepository;
        this.revisionRepository = revisionRepository;
    }

    // ... (前面的代码保持原样，省略部分以节省空间，你直接粘贴全量)
    @GetMapping
    public Page<Post> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "false") boolean admin) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (admin) return postRepository.findAll(pageRequest);

        if (keyword != null && !keyword.trim().isEmpty()) {
            return postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseAndIsDraftIsNullOrIsDraftFalse(keyword, keyword, pageRequest);
        } else if (category != null && !category.isEmpty()) {
            return postRepository.findByCategoryAndIsDraftIsNullOrIsDraftFalse(category, pageRequest);
        } else if (tag != null && !tag.isEmpty()) {
            return postRepository.findByTagsContainingAndIsDraftIsNullOrIsDraftFalse(tag, pageRequest);
        } else {
            return postRepository.findByIsDraftIsNullOrIsDraftFalse(pageRequest); 
        }
    }

    @GetMapping("/{id}")
    public Post getPostById(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElse(null);
        if (post != null && !Boolean.TRUE.equals(post.getIsDraft())) {
            post.setViews(post.getViews() + 1);
            postRepository.save(post);
        }
        return post;
    }

    // 【新增】获取相关文章（基于分类）
    @GetMapping("/{id}/related")
    public List<Post> getRelatedPosts(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElse(null);
        if (post == null || post.getCategory() == null) return List.of();
        
        // 查询同分类的最新3篇文章（排除自己）
        PageRequest limit = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.findByCategoryAndIdNotAndIsDraftIsNullOrIsDraftFalse(post.getCategory(), id, limit);
    }

    // ... (点赞、新增、更新、删除等接口保持不变) ...
    @PutMapping("/{id}/like")
    public Post likePost(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElse(null);
        if (post != null) { post.setLikes(post.getLikes() + 1); return postRepository.save(post); }
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
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("无权修改！");
        }
        if (!Boolean.TRUE.equals(post.getIsDraft())) {
            ArticleRevision revision = new ArticleRevision();
            revision.setPostId(post.getId());
            revision.setTitle(post.getTitle());
            revision.setContent(post.getContent());
            revision.setCategory(post.getCategory());
            revision.setTags(post.getTags());
            revisionRepository.save(revision);
        }
        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        post.setCategory(postDetails.getCategory());
        post.setTags(postDetails.getTags());
        post.setIsDraft(postDetails.getIsDraft());
        post.setScheduledTime(postDetails.getScheduledTime()); 
        return ResponseEntity.ok(postRepository.save(post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, HttpServletRequest request) {
        Post post = postRepository.findById(id).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        String currentUsername = (String) request.getAttribute("currentUsername");
        if (!"admin".equals(currentUsername) && !currentUsername.equals(post.getAuthor())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("无权删除！");
        }
        postRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/revisions")
        // 【新增】获取随机一篇文章（用于随机漫游）
   
    public List<ArticleRevision> getRevisions(@PathVariable Long id) {
        return revisionRepository.findByPostIdOrderByCreatedAtDesc(id);
    }
        // 【新增】获取随机一篇文章（用于随机漫游）
    @GetMapping("/random")
    public ResponseEntity<?> getRandomPost() {
        Post post = postRepository.findRandomPost();
        if (post != null) {
            return ResponseEntity.ok(post);
        }
        return ResponseEntity.notFound().build();
    }
}