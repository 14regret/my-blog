# 🌸 Mxj 的全栈个人博客系统

> 一个基于 React 18 + Spring Boot 3 开发的现代化、高颜值、功能完备的全栈个人博客系统。采用前后端分离架构，配备炫酷的赛博朋克/二次元暗黑毛玻璃（Glassmorphism）UI，兼具硬核技术与极致视觉体验。

<!-- ====== 项目徽章区 ====== -->
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
- **网络请求**：Axios（全局拦截器统一处理 Token 与 401 状态）
- **富文本/代码**：`@uiw/react-md-editor` (编辑器), `react-markdown` (渲染), 代码块高亮
- **搜索/算法**：`fuse.js` (前端高性能模糊搜索，支持错别字容错)
- **UI/交互**：纯 CSS3 实现（暗黑毛玻璃、瀑布流、粒子/落叶/流星特效、打字机动画、全屏弹幕）

### 后端 (Backend)
- **核心框架**：Spring Boot 3.x
- **持久层**：Spring Data JPA + H2 Database (兼容 MySQL)
- **安全鉴权**：JWT (JSON Web Token) + Spring Interceptor
- **定时任务**：Spring Task (实现文章定时发布)
- **工具库**：Lombok, JJWT

## ✨ 核心功能

### 🎨 前台展示端
- **沉浸式阅读**：支持顶部阅读进度条、字号动态调节（持久化）、一键进入/退出“沉浸阅读模式”。
- **强大的编辑器**：文章详情支持 Markdown 渲染、代码高亮、图片点击放大预览。
- **互动社区**：
  - **树形评论**：支持多级嵌套回复，@提及用户。
  - **留言板弹幕**：结合全屏落叶特效，游客发送的留言以实时弹幕形式滚动。
  - **点赞与收藏**：登录用户可点赞/收藏文章，并在个人中心查看。
- **内容发现**：
  - **前端模糊搜索**：基于 Fuse.js 的秒级全文检索。
  - **动态标签云**：根据文章数量动态调整标签大小。
  - **相关推荐**：基于分类自动推荐相似文章。
  - **随机漫游**：一键随机跳转老文章。
  - **分类/归档**：支持按分类筛选、按时间线归档。
- **极客体验**：左下角悬浮多曲目黑胶唱片机、动态网页标题（SEO）、RSS 订阅。

### 🔐 后台管理端
- **数据看板**：可视化统计站点总访问量、总点赞、文章及评论数。
- **文章管理**：
  - **草稿自动保存**：前端每 30s 静默保存草稿，防止内容丢失。
  - **定时发布**：支持设定未来时间，后端定时任务自动发布。
  - **版本历史**：每次修改自动快照，支持一键回滚至历史版本。
- **权限控制 (RBAC)**：超级管理员可管理全站内容，普通用户仅能管理自己的文章。

## 🚀 本地运行指南

1. 克隆项目到本地
   ```bash
   git clone https://github.com/14regret/my-blog.git

2.启动后端：
使用 VSCode 或 IDEA 打开 blog-server 目录，运行 BlogServerApplication.java。默认端口 8080。

3.启动前端：

bash
cd blog-web
npm install
npm run dev

4.默认管理员账号：admin / 123456