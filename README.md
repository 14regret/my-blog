# 🌸 Mxj 的全栈个人博客系统

> 一个基于 React 18 + Spring Boot 3 开发的现代化、高颜值全栈博客系统。采用前后端分离架构，配备炫酷的赛博朋克/二次元暗黑毛玻璃（Glassmorphism）UI，兼具实用性与视觉冲击力。

<!-- ====== 项目徽章区（高手进阶版） ====== -->
<div align="left">

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v3.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![H2 Database](https://img.shields.io/badge/H2_Database-latest-0074B7?style=flat-square&logo=h2database&logoColor=white)](https://www.h2database.com/)

![GitHub last commit](https://img.shields.io/github/last-commit/14regret/my-blog?style=flat-square&color=ff6b9e)
![GitHub repo size](https://img.shields.io/github/repo-size/14regret/my-blog?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## 🛠️ 技术栈

### 前端 (Frontend)
- **核心框架**：React 18 + Vite
- **路由管理**：React Router DOM v6
- **网络请求**：Axios（配置了全局请求/响应拦截器，统一处理 Token 注入与 401 错误）
- **Markdown**：`react-markdown` (渲染), `@uiw/react-md-editor` (编辑器)
- **UI/动画**：纯 CSS3 实现（毛玻璃特效、打字机效果、波浪文字动画、响应式 Grid 瀑布流布局）

### 后端 (Backend)
- **核心框架**：Spring Boot 3.x
- **持久层**：Spring Data JPA + H2 Database (支持无缝切换 MySQL)
- **安全鉴权**：JWT (JSON Web Token) + 自定义拦截器 (HandlerInterceptor)
- **工具库**：Lombok, JJWT

## ✨ 核心功能

### 🎨 前台展示端
- **动态首页**：波浪跳动文字欢迎语、打字机副标题、响应式瀑布流卡片布局。
- **文章检索**：支持关键词模糊搜索（标题/内容）、按分类筛选、按标签筛选、分页加载。
- **沉浸阅读**：支持 Markdown 渲染、代码高亮、文章图片自适应。记录文章阅读量与点赞数。
- **互动模块**：游客无需登录即可发表评论（支持管理员后台删除）；独立的公共留言板。
- **文章归档**：按年月时间轴归档展示全站文章。
- **背景音乐**：左下角悬浮黑胶唱片播放器，支持全局音乐播放。

### 🔐 后台管理端
- **安全认证**：登录/注册功能，密码采用 SHA-256 加盐哈希存储。
- **权限控制 (RBAC)**：普通用户仅能管理自己的文章，超级管理员 (`admin`) 可管理全站文章及评论。
- **文章管理**：支持草稿箱功能（存为草稿/立即发布）、修改与删除。
- **数据面板**：可视化表格展示所有文章与评论，一键快速清理。

## 🚀 本地运行指南

1. 克隆项目到本地
   ```bash
   git clone https://github.com/14regret/my-blog.git