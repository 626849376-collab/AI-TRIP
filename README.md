# AI Mini Travel Planner (AI迷你旅行规划师)

面向大学生的 AI 旅行规划服务。用户输入预算、时间、目的地偏好、出发地和兴趣后，系统自动生成完整旅行方案，包括路线、住宿建议、景点安排、预算分析和行程时间表。

An AI-powered travel planning service designed for college students. Users input their budget, time, destination preferences, departure location, and interests, and the system automatically generates a complete travel plan, including routes, accommodation suggestions, attraction arrangements, budget analysis, and itinerary schedules.

---

## 项目概述 / Project Overview

AI Mini Travel Planner 是一款基于 AI 的智能旅行规划工具，专为大学生群体设计。通过简单的输入，即可获得个性化的旅行方案，帮助用户节省规划时间，提升旅行体验。

AI Mini Travel Planner is an AI-based intelligent travel planning tool designed specifically for college students. With simple inputs, users can receive personalized travel plans, helping them save planning time and enhance their travel experience.

### 产品定位 / Product Positioning

| 中文 | English |
|------|---------|
| **目标用户**：大学生、研究生、交换生 | **Target Users**: College students, graduate students, exchange students |
| **使用场景**：节假日、周末、寒暑假 | **Use Cases**: Holidays, weekends, winter/summer breaks |
| **平台支持**：Web 平台（PC/移动端） | **Platform Support**: Web (PC/Mobile) |

---

## 功能特性 / Features

### MVP 功能 / MVP Features

- ✅ 用户注册与登录 / User Registration & Login
- ✅ AI 智能生成旅行行程 / AI-Powered Travel Itinerary Generation
- ✅ 预算分析与规划 / Budget Analysis & Planning
- ✅ 旅行计划保存、编辑、删除 / Save, Edit, Delete Travel Plans
- ✅ 导出旅行计划为 PDF / Export Travel Plans as PDF
- ✅ 响应式设计，支持移动端 / Responsive Design (Mobile Support)

### 核心功能模块 / Core Feature Modules

| 模块 (Module) | 功能描述 (Description) |
|---------------|------------------------|
| 注册/登录 (Registration/Login) | 邮箱注册、密码登录、忘记密码 / Email registration, password login, forgot password |
| Dashboard | 用户主页，展示旅行计划列表 / User homepage displaying travel plan list |
| 创建计划 (Create Plan) | 输入目的地、日期、预算、兴趣等 / Input destination, dates, budget, interests, etc. |
| AI 生成 (AI Generation) | 基于用户偏好自动生成完整行程 / Automatically generates complete itinerary based on user preferences |
| 行程详情 (Trip Details) | 查看每日行程、景点、餐饮推荐 / View daily itinerary, attractions, dining recommendations |
| 预算分析 (Budget Analysis) | 费用明细与预算分配 / Expense breakdown and budget allocation |
| 用户中心 (User Center) | 个人信息管理、历史行程 / Personal information management, trip history |

---

## 技术栈 / Tech Stack

### 前端 / Frontend

- **框架 (Framework)**：Next.js 15
- **语言 (Language)**：TypeScript
- **样式 (Styling)**：TailwindCSS
- **UI 组件 (UI Components)**：ShadCN UI (Radix UI)
- **状态管理 (State Management)**：Zustand
- **地图 (Maps)**：Leaflet
- **PDF 导出 (PDF Export)**：@react-pdf/renderer

### 后端 / Backend

- **API**：Next.js Route Handler
- **数据库 (Database)**：Supabase (PostgreSQL)
- **认证 (Authentication)**：Supabase Auth (JWT)
- **存储 (Storage)**：Supabase Storage

### 部署 / Deployment

- **代码托管 (Code Hosting)**：GitHub
- **部署平台 (Deployment Platform)**：Vercel

---

## 快速开始 / Quick Start

### 前置要求 / Prerequisites

- Node.js >= 18
- npm 或 yarn
- Supabase 账号 / Supabase account

### 安装步骤 / Installation Steps

1. **克隆项目 / Clone the repository**

```bash
git clone https://github.com/626849376-collab/AI-TRIP.git
cd AI-TRIP
```

2. **安装依赖 / Install dependencies**

```bash
npm install
```

3. **配置环境变量 / Configure environment variables**

复制 `.env.example` 为 `.env.local`，并填写以下配置：

Copy `.env.example` to `.env.local` and fill in the following configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **初始化数据库 / Initialize the database**

在 Supabase SQL 编辑器中执行 `supabase_schema.sql` 创建数据表。

Execute `supabase_schema.sql` in the Supabase SQL editor to create the database tables.

5. **启动开发服务器 / Start the development server**

```bash
npm run dev
```

6. **打开浏览器访问 / Open your browser and visit**

```
http://localhost:3000
```

### 可用脚本 / Available Scripts

```bash
npm run dev      # 启动开发服务器 / Start development server
npm run build    # 构建生产版本 / Build for production
npm run start    # 启动生产服务器 / Start production server
npm run lint     # 代码检查 / Run code linting
```

---

## 项目结构 / Project Structure

```
src/
├── app/           # Next.js 页面路由 / Next.js page routes
│   ├── auth/      # 认证相关页面 / Authentication pages
│   ├── dashboard/ # 用户主页 / User dashboard
│   ├── trip/      # 旅行计划页面 / Trip plan pages
│   ├── profile/   # 用户中心 / User center
│   └── admin/     # 管理后台 / Admin panel
├── components/    # 可复用组件 / Reusable components
├── hooks/         # 自定义 Hooks / Custom hooks
├── lib/           # 工具库 / Utility libraries
├── services/      # API 服务 / API services
├── store/         # 状态管理 / State management
├── types/         # TypeScript 类型定义 / TypeScript type definitions
└── utils/         # 工具函数 / Utility functions
```

---

## 页面结构 / Page Structure

| 路径 (Path) | 说明 (Description) |
|-------------|-------------------|
| `/` | 首页 / Home page |
| `/auth/login` | 登录 / Login |
| `/auth/register` | 注册 / Register |
| `/auth/forgot-password` | 忘记密码 / Forgot password |
| `/dashboard` | 用户主页 / User dashboard |
| `/trip/create` | 创建旅行计划 / Create travel plan |
| `/trip/[id]` | 行程详情 / Trip details |
| `/profile` | 用户中心 / User center |
| `/admin` | 管理后台 / Admin panel |
| `/admin/users` | 用户管理 / User management |
| `/admin/statistics` | 数据统计 / Statistics |

---

## 数据库设计 / Database Design

### 主要数据表 / Main Tables

- **user_profiles** - 用户信息 / User information
- **trip_plans** - 旅行计划 / Travel plans
- **trip_details** - 行程详情 / Trip details

详细数据库结构请参考 `supabase_schema.sql`。

For detailed database structure, please refer to `supabase_schema.sql`.

---

## API 接口 / API Endpoints

| 方法 (Method) | 路径 (Path) | 说明 (Description) |
|---------------|-------------|-------------------|
| POST | `/api/trip/generate` | AI 生成行程 / AI generate itinerary |
| GET | `/api/trip/[id]` | 获取行程详情 / Get trip details |
| PUT | `/api/trip/[id]` | 更新行程 / Update trip |
| DELETE | `/api/trip/[id]` | 删除行程 / Delete trip |

---

## 非功能需求 / Non-Functional Requirements

### 性能指标 / Performance Metrics

- 页面加载时间 < 2秒 / Page load time < 2 seconds
- AI 生成时间 < 10秒 / AI generation time < 10 seconds

### 安全要求 / Security Requirements

- HTTPS 加密传输 / HTTPS encrypted transmission
- JWT 认证 / JWT authentication
- Row Level Security (RLS) 权限控制 / Row Level Security (RLS) access control

### 浏览器兼容 / Browser Compatibility

- Chrome
- Edge
- Safari
- Mobile Browser

---

## 许可证 / License

本项目仅供学习交流使用。

This project is for learning and communication purposes only.