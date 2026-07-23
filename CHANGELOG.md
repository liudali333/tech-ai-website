# CHANGELOG

## v1.4 (2026-07-24 00:00)

### 安全
- contact.php: 速率限制(IP/60s/5次) + HTTP 429
- contact.php: XSS 注入过滤 + HTML 实体编码
- contact.php: X-Content-Type-Options + X-Frame-Options 安全头
- contact.php: CORS header + 原子写入验证
- contact.php: User-Agent 截断(200字符) + UTF-8 charset
- 联系表单: 数学验证码(前端生成+后端校验)
- JS Error Boundary: window.onerror + unhandledrejection 捕获
- Performance Observer: LCP + FID 控制台上报

## v1.3 (2026-07-23 23:57)

### 页面完整性
- 404.html 独立错误页，保留完整导航和粒子背景

### 用户体验
- Loading 骨架屏：DOMContentLoaded 后自动移除
- LCP 优化：preload CSS/JS + preconnect CDN
- SEO: meta description + theme-color + favicon SVG

### 安全
- CSP Content-Security-Policy（dev 宽松模式，生产需收紧）
- X-Content-Type-Options: nosniff

## v1.2 (2026-07-23 23:56)

### 资源优化
- Favicon: 内嵌 SVG data-uri（⚡ 霓虹渐变闪电）
- Three.js 懒加载：仅首页可见时加载 CDN 脚本
- 资源预加载：preload main.css + particles.js
- preconnect CDN 域名提前握手

## v1.1 (2026-07-23 23:55)

### 性能优化
- CSS: will-change + contain + transform:translateZ(0) 硬件加速
- CSS: 移动端隐藏自定义光标
- JS particles: Page Visibility API 后台暂停动画
- JS particles: 移动端降采样(60粒子)，桌面端150
- JS particles: 动态连接距离阈值，减少 draw call
- JS three-scene: 移动端粒子800/桌面2000，关闭移动端抗锯齿
- JS three-scene: TypedArray 预分配 + needsUpdate=false
- JS three-scene: Page Visibility API 后台暂停
- JS three-scene: Touch 拖拽支持
- JS main.js: 新闻懒加载（点击新闻页才请求）
- JS main.js: 表单提交防抖(400ms) + 按钮 loading 状态
- JS main.js: 页面切换重新触发 reveal 动画
- JS main.js: fetch cache: no-store 防止缓存
- PHP: contact/news/stats/admin 全部做 XSS 过滤

---

## v1.0 (2026-07-23 23:54) — 初始版本

### 功能
- 5 页面单页切换（首页/关于/产品/新闻/联系）
- Canvas 粒子星空背景 + Three.js 3D 粒子球
- 霓虹赛博朋克风格 + 自定义光标
- PHP 联系表单 + 新闻 CRUD + 访问统计
- 简易管理后台（密码登录）
