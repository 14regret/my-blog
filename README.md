# 🌸 Mxj 的全栈个人博客系统 (Next-Gen Blog)

> 一个基于 **React 18 + Spring Boot 3 + MySQL 8.0** 开发的现代化、高颜值、企业级安全标准的全栈个人博客系统。前端采用赛博朋克/二次元暗黑毛玻璃（Glassmorphism）UI，后端采用工业级鉴权与防御架构，兼具极致视觉体验与坚如磐石的代码质量。

<!-- ====== 项目徽章区 ====== -->
<div align="left">

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v3.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

![GitHub last commit](https://img.shields.io/github/last-commit/14regret/my-blog?style=flat-square&color=ff6b9e)
![GitHub repo size](https://img.shields.io/github/repo-size/14regret/my-blog?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 项目简介

本项目不仅仅是简单的增删改查，更是一套**完整的社区化内容管理系统 (CMS)**。它不仅拥有极佳的阅读交互体验，还在后端实现了**参数校验、全局异常处理、接口限流、密码加密、防越权、防盗链**等企业级安全防御机制，并通过了严格的代码安全审计。

---

## ✨ 核心功能

### 🎨 前台展示端 (用户端)
- **沉浸式体验**：文章阅读进度条、沉浸阅读模式、全局字号动态调节。
- **高级编辑器**：支持 Markdown 实时预览、代码高亮、图片点击放大预览。
- **社区化互动**：
  - **评论系统**：支持多级嵌套回复、Emoji 表情输入、基于 IP 的防刷限流。
  - **消息通知**：被回复或被评论时，站内小铃铛实时红点提醒。
  - **个性化**：文章点赞、收藏夹、动态标签云、相关文章推荐、随机漫游。
  - **留言板**：赛博朋克全屏落叶特效 + 实时滚动弹幕。
- **内容检索**：基于 `Fuse.js` 的前端全文检索，支持错别字容错，毫秒级响应。
- **极客功能**：多曲目黑胶唱片背景音乐播放器、RSS 订阅、友链存活状态自动检测。

### 🔐 后台管理端 (博主端)
- **数据看板**：全站浏览量、点赞数、评论数、文章数可视化管理。
- **文章管理**：支持**草稿自动静默保存**、**定时发布任务**、**历史版本时光机（一键回滚）**。
- **审核管理**：一键清理评论、留言、友链。
- **全站动态配置**：无需改代码，后台直接修改站点名称、副标题、公告、备案号。

---

## 🛡️ 企业级安全架构 (Security)

本项目完成了多项深度安全加固，可抵御常见的 Web 攻击：
1. **密码安全**：废弃明文与普通哈希，采用 **BCrypt** 加盐慢哈希算法。
2. **鉴权与越权防御**：基于 JWT 无状态鉴权；所有增删改接口均校验“管理员/作者”身份（防水平越权 IDOR）。
3. **账号防爆破**：连续输错密码 5 次，自动锁定账号 15 分钟。
4. **接口限流**：自定义拦截器 + 内存时间窗口，有效防止评论、登录接口被恶意刷量。
5. **文件上传校验**：白名单限制后缀（防木马）、校验 MIME 类型、UUID 重命名防路径穿越。
6. **防 XSS 注入**：前端自定义 Markdown 渲染规则，拦截 `javascript:` 伪协议。
7. **防盗链**：针对 `/uploads/**` 静态资源进行 Referer 校验。
8. **数据脱敏**：`User` 实体通过 `@JsonProperty` 隐藏密码序列化，杜绝响应泄露。
9. **审计与拦截**：全局异常统一处理（防堆栈信息泄露）、后台敏感操作记录 `AdminLog`。

---

## 🛠️ 技术栈

### 前端 (Frontend)
- **核心框架**：React 18 + Vite
- **路由管理**：React Router DOM v6
- **网络请求**：Axios（全局拦截器，统一处理 Token 注入与 401 响应）
- **富文本/代码**：`@uiw/react-md-editor`, `react-markdown`, `rehype-highlight`
- **搜索/算法**：`fuse.js` (前端模糊搜索)
- **UI/交互**：纯 CSS3 实现（暗黑毛玻璃、瀑布流、粒子/落叶/流星特效、打字机动画、全屏弹幕）

### 后端 (Backend)
- **核心框架**：Spring Boot 3.x
- **持久层**：Spring Data JPA + MySQL 8.0 (utf8mb4)
- **安全鉴权**：Spring Security Crypto (BCrypt) + JWT + Spring Interceptor
- **定时任务**：Spring Task (定时发布、友链存活探测)
- **工具库**：Lombok, JJWT, Validation

---

## 🚀 本地运行指南

### 1. 环境准备
- Node.js (v16+)
- JDK 17+
- MySQL 8.0

### 2. 数据库初始化
打开 MySQL 客户端，创建数据库（务必使用 `utf8mb4` 支持 Emoji 表情）：
```sql
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

3. 后端配置与启动
进入 blog-server 目录。

修改 src/main/resources/application.yml，填入你的 MySQL 账号和密码：

yaml
username: root
password: 你的密码
启动 BlogServerApplication.java。启动后，系统会自动建表并生成默认管理员账号：admin / 123456。

4. 前端启动
进入 blog-web 目录。

安装依赖并启动：

bash
npm install
npm run dev
访问 http://localhost:5173。

📦 生产环境打包 (部署)
本项目支持前后端一体化打包，最终生成一个独立的 .jar 文件即可运行：

在 blog-web 目录下执行 npm run build，生成 dist 文件夹。

将 dist 内的所有文件复制到 blog-server/src/main/resources/static/ 下。

在 blog-server 目录下执行 mvn clean package -DskipTests。

运行 java -jar target/blog-server-0.0.1-SNAPSHOT.jar 即可同时启动前后端。

