# AI Mini Travel Planner (AI迷你旅行规划师)

面向大学生的 AI 旅行规划服务。用户输入预算、时间、目的地偏好、出发地和兴趣后，系统自动生成完整旅行方案，包括路线、住宿建议、景点安排、预算分析和行程时间表。

## 项目概述

AI Mini Travel Planner 是一款基于 AI 的智能旅行规划工具，专为大学生群体设计。通过简单的输入，即可获得个性化的旅行方案，帮助用户节省规划时间，提升旅行体验。

### 产品定位

- **目标用户**：大学生、研究生、交换生
- **使用场景**：节假日、周末、寒暑假
- **平台支持**：Web 平台（PC/移动端）

## 功能特性

### MVP 功能

- ✅ 用户注册与登录
- ✅ AI 智能生成旅行行程
- ✅ 预算分析与规划
- ✅ 旅行计划保存、编辑、删除
- ✅ 导出旅行计划为 PDF
- ✅ 响应式设计，支持移动端

### 核心功能模块

| 模块 | 功能描述 |
|------|----------|
| 注册/登录 | 邮箱注册、密码登录、忘记密码 |
| Dashboard | 用户主页，展示旅行计划列表 |
| 创建计划 | 输入目的地、日期、预算、兴趣等 |
| AI 生成 | 基于用户偏好自动生成完整行程 |
| 行程详情 | 查看每日行程、景点、餐饮推荐 |
| 预算分析 | 费用明细与预算分配 |
| 用户中心 | 个人信息管理、历史行程 |

## 技术栈

### 前端

- **框架**：Next.js 15
- **语言**：TypeScript
- **样式**：TailwindCSS
- **UI 组件**：ShadCN UI (Radix UI)
- **状态管理**：Zustand
- **地图**：Leaflet
- **PDF 导出**：@react-pdf/renderer

### 后端

- **API**：Next.js Route Handler
- **数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Auth (JWT)
- **存储**：Supabase Storage

### 部署

- **代码托管**：GitHub
- **部署平台**：Vercel

## 快速开始

### 前置要求

- Node.js >= 18
- npm 或 yarn
- Supabase 账号

### 安装步骤

1. 克隆项目

```bash
git clone https://github.com/626849376-collab/AI-TRIP.git
cd AI-TRIP
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填写以下配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 初始化数据库

在 Supabase SQL 编辑器中执行 `supabase_schema.sql` 创建数据表。

5. 启动开发服务器

```bash
npm run dev
```

6. 打开浏览器访问

```
http://localhost:3000
```

### 可用脚本

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 代码检查
```

## 项目结构

```
src/
├── app/           # Next.js 页面路由
│   ├── auth/      # 认证相关页面
│   ├── dashboard/ # 用户主页
│   ├── trip/      # 旅行计划页面
│   ├── profile/   # 用户中心
│   └── admin/     # 管理后台
├── components/    # 可复用组件
├── hooks/         # 自定义 Hooks
├── lib/           # 工具库
├── services/      # API 服务
├── store/         # 状态管理
├── types/         # TypeScript 类型定义
└── utils/         # 工具函数
```

## 页面结构

| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/auth/login` | 登录 |
| `/auth/register` | 注册 |
| `/auth/forgot-password` | 忘记密码 |
| `/dashboard` | 用户主页 |
| `/trip/create` | 创建旅行计划 |
| `/trip/[id]` | 行程详情 |
| `/profile` | 用户中心 |
| `/admin` | 管理后台 |
| `/admin/users` | 用户管理 |
| `/admin/statistics` | 数据统计 |

## 数据库设计

### 主要数据表

- **user_profiles** - 用户信息
- **trip_plans** - 旅行计划
- **trip_details** - 行程详情

详细数据库结构请参考 `supabase_schema.sql`。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/trip/generate` | AI 生成行程 |
| GET | `/api/trip/[id]` | 获取行程详情 |
| PUT | `/api/trip/[id]` | 更新行程 |
| DELETE | `/api/trip/[id]` | 删除行程 |

## 非功能需求

### 性能指标

- 页面加载时间 < 2秒
- AI 生成时间 < 10秒

### 安全要求

- HTTPS 加密传输
- JWT 认证
- Row Level Security (RLS) 权限控制

### 浏览器兼容

- Chrome
- Edge
- Safari
- Mobile Browser

## 许可证

本项目仅供学习交流使用。