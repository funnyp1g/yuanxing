# Yuanxing - Axure RP 原型在线预览平台

> 自建 Axure 云替代方案，将 .rp 文件转换为可在浏览器中预览的 HTML 原型

## 功能特性

- **一键上传**: 支持 Axure RP 9/10 的 .rp 文件，拖拽即可上传
- **自动转换**: 智能解析 RP 文件结构，生成高保真 HTML 原型
- **交互支持**: 支持页面跳转、显示/隐藏、动态面板切换等交互
- **链接分享**: 生成预览链接，团队成员随时查看
- **多设备预览**: 支持桌面、平板、手机多种视图

## 技术架构

```
yuanxing/
├── backend/          # Node.js 后端服务
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── services/     # 核心业务逻辑
│   │   │   ├── rpParser.js      # RP 文件解析器
│   │   │   ├── htmlConverter.js # HTML 转换器
│   │   │   └── store.js         # 项目存储
│   │   └── index.js      # 服务入口
│   ├── uploads/      # 上传文件临时目录
│   └── output/       # 生成的 HTML 输出目录
├── frontend/         # React 前端应用
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 通用组件
│   │   └── styles/       # 样式文件
│   └── public/       # 静态资源
├── Dockerfile        # Docker 构建文件
└── docker-compose.yml # Docker Compose 配置
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/funnyp1g/yuanxing.git
   cd yuanxing
   ```

2. **安装后端依赖**
   ```bash
   cd backend
   npm install
   ```

3. **启动后端服务**
   ```bash
   npm run dev
   # 服务运行在 http://localhost:3001
   ```

4. **安装前端依赖**
   ```bash
   cd ../frontend
   npm install
   ```

5. **启动前端开发服务器**
   ```bash
   npm run dev
   # 服务运行在 http://localhost:5173
   ```

### Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## API 接口

### 上传并转换 RP 文件
```
POST /api/upload
Content-Type: multipart/form-data

Body:
  - rpFile: .rp 文件

Response:
{
  "success": true,
  "project": {
    "id": "uuid",
    "url": "/previews/{id}/index.html",
    "pageCount": 5,
    "pages": [...],
    "previewUrl": "/previews/{id}/index.html"
  }
}
```

### 获取项目列表
```
GET /api/projects

Response:
{
  "success": true,
  "projects": [...]
}
```

### 获取项目详情
```
GET /api/projects/:projectId

Response:
{
  "success": true,
  "project": {...}
}
```

### 删除项目
```
DELETE /api/projects/:projectId

Response:
{
  "success": true,
  "message": "Project deleted"
}
```

### 获取分享链接
```
GET /api/preview/:projectId/share

Response:
{
  "success": true,
  "shareUrl": "http://localhost:3001/previews/{id}/index.html",
  "embedUrl": "http://localhost:3001/previews/{id}/index.html",
  "projectId": "uuid"
}
```

## RP 文件转换说明

### 支持转换的元素

| Axure 元素 | HTML 输出 |
|-----------|----------|
| 矩形/按钮 | `<div>` / `<button>` |
| 文本/标签 | `<p>` / `<h1>`-`<h3>` |
| 图片 | `<img>` |
| 文本框 | `<input type="text">` |
| 多行文本 | `<textarea>` |
| 复选框 | `<input type="checkbox">` |
| 单选按钮 | `<input type="radio">` |
| 下拉框 | `<select>` |
| 动态面板 | `<div>` + 状态切换 JS |
| 中继器 | `<div>` + 数据渲染 |
| 内联框架 | `<iframe>` |
| 热区 | `<div class="hotspot">` |
| 表格 | `<table>` |
| 水平线/垂直线 | `<hr>` / `<div>` |

### 支持的交互

- 点击跳转页面
- 显示/隐藏元素
- 动态面板状态切换
- 设置变量值

## 部署到自有服务器

1. 在服务器上安装 Docker
2. 克隆仓库到服务器
3. 运行 `docker-compose up -d`
4. 配置 Nginx 反向代理（可选）
5. 配置域名和 SSL（可选）

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件大小限制
    client_max_body_size 100M;
}
```

## 后续规划

- [ ] 用户认证和权限管理
- [ ] 团队协作功能（评论、标注）
- [ ] 版本管理（对比不同版本）
- [ ] 更多 Axure 交互支持
- [ ] 自适应视图完整支持
- [ ] 全局变量和函数支持
- [ ] 导出为离线 HTML 包

## License

MIT
