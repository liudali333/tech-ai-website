# NexaAI 科技官网

赛博朋克风格科技/AI 公司官网，纯前端 + PHP 轻量后端，无需数据库。

## 目录结构

```
/www/wwwroot/nexaai/          ← 上传到云服务器此目录
├── index.html                ← 首页（含 about/products/news/contact 单页切换）
├── assets/
│   ├── css/main.css          ← 全局样式 + 赛博朋克主题
│   └── js/
│       ├── particles.js      ← Canvas 粒子星空
│       ├── three-scene.js    ← Three.js 3D 粒子球
│       ├── neon-effects.js   ← 霓虹 hover 特效
│       ├── cursor.js         ← 自定义光标
│       └── main.js           ← 页面路由 / 表单 / 统计
├── api/
│   ├── contact.php           ← 联系表单接收（写 contacts.json）
│   ├── news.php              ← 新闻 CRUD（密码保护 POST）
│   ├── stats.php             ← 无感访问统计（PV/UV）
│   └── admin.php             ← 简易管理后台（密码登录）
├── data/
│   ├── contacts.json         ← 留言数据
│   ├── news.json             ← 新闻数据
│   ├── stats.json            ← 统计数据
│   └── .htaccess             ← 禁止外部直接读取 JSON
└── admin/
    └── index.html            ← （预留，当前 api/admin.php 已包含）
```

## 部署要求

| 环境 | 版本 |
|---|---|
| PHP | 8.1+ |
| Nginx / Apache | 任意 |
| 写入权限 | `data/` 目录需 755/777 |

## 快速部署

1. 将 `tech-ai-website/` 上传到服务器站点根目录（如 `/www/wwwroot/nexaai/`）
2. 确保 `data/` 目录可写：`chmod 755 data/`
3. Nginx/Apache 站点根目录指向 `index.html`
4. 浏览器访问站点

## 管理后台

访问 `/api/admin.php`，默认密码 `Admin@2026`（上线后请修改）。

## 安全提示

- 生产环境建议将 `api/news.php` 的 token 改为随机字符串
- `data/.htaccess` 保护 JSON 数据文件不被直接读取
- 建议开启 HTTPS
