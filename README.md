# AI 广告素材生成平台

基于 PRD V1.0 的全栈 MVP，包含真实 AI API 对接、在线编辑器、后端服务与合规/批量模块。

## 技术栈

- **前端**: Next.js 15 · React 19 · Tailwind CSS · Fabric.js
- **后端**: Next.js API Routes · Prisma · SQLite
- **AI**: OpenAI DALL-E 3（文生图）· Replicate（图文转视频）· Mock 降级

## 快速开始

```bash
cd ai-ad-creative-platform
cp .env.example .env
npm install
npm run db:push
npm run dev
```

访问 http://localhost:3000 ，首次打开自动登录演示账号。

## 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | SQLite 路径，默认 `file:./dev.db` |
| `JWT_SECRET` | JWT 签名密钥 |
| `OPENAI_API_KEY` | OpenAI Key，启用真实文生图 |
| `REPLICATE_API_TOKEN` | Replicate Token，启用真实图文转视频 |
| `STORAGE_DIR` | 素材文件存储目录 |

未配置 AI Key 时自动使用 Mock Provider（生成 SVG 占位图）。

## 已实现能力

### 1. AI API 对接
- `POST /api/ai/image/generate` — 文生广告图（OpenAI / Mock）
- `POST /api/ai/video/generate` — 图文转视频（Replicate / Mock）
- 生成结果自动入库至素材库

### 2. 在线编辑器
- **图片**: Fabric.js Canvas 编辑器（添加文案、色块、拖拽、导出）
- **视频**: 时间轴编辑器（片段排序、时长调整、分割/删除）

### 3. 后端服务
- 用户认证（注册/登录/演示账号/JWT Cookie）
- Prisma + SQLite 数据持久化
- 异步任务队列（内存调度 + DB 状态追踪）
- 本地文件存储 + `/api/files/*` 静态访问

### 4. 业务模块
- **合规检测**: 极限词/违禁词/版权提示，`POST /api/compliance/check`
- **批量生成**: Excel 模板下载、解析校验、批量提交，`/api/batch/*`

## API 概览

```
/api/auth/register|login|demo|me
/api/ai/image/generate
/api/ai/video/generate
/api/compliance/check
/api/batch/parse|submit
/api/tasks|/tasks/[id]
/api/materials
/api/files/[...path]
```

## 演示账号

- 邮箱: `demo@ad-creative.local`
- 密码: `demo123456`

或通过 `POST /api/auth/demo` 一键登录。
