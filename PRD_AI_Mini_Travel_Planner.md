# PRD - AI迷你旅行规划师（AI Mini Travel Planner）

## 1. 项目概述

### 产品名称
AI Mini Travel Planner

### 产品定位
面向大学生的 AI 旅行规划服务。用户输入预算、时间、目的地偏好、出发地和兴趣后，系统自动生成完整旅行方案，包括路线、住宿建议、景点安排、预算分析和行程时间表。

---

# 2. 5W1H 分析

| 项目 | 内容 |
|--------|--------|
| What | AI 自动生成个性化旅行规划 |
| Why | 降低大学生旅行规划时间成本 |
| Who | 大学生、研究生、交换生 |
| When | 节假日、周末、寒暑假 |
| Where | Web 平台（PC/移动端） |
| How | AI + 用户偏好分析 + 行程生成引擎 |

---

# 3. 产品目标

## MVP目标

用户能够：

1. 注册账号
2. 登录系统
3. 创建旅行计划
4. 使用AI生成行程
5. 查看预算分析
6. 保存旅行计划
7. 编辑旅行计划
8. 删除旅行计划
9. 导出旅行计划

---

# 4. 用户角色

## 普通用户（大学生）

权限：

- 注册
- 登录
- 创建行程
- 查看行程
- 编辑行程
- 删除行程
- 导出PDF

## 管理员

权限：

- 用户管理
- 数据统计
- 内容审核
- 系统配置

---

# 5. 功能详细定义

# 5.1 注册模块

## 页面

/auth/register

## UI字段

| 字段 | 类型 | 必填 |
|--------|--------|--------|
| 姓名 | Text | 是 |
| 邮箱 | Email | 是 |
| 密码 | Password | 是 |
| 确认密码 | Password | 是 |

## 验证规则

- 邮箱唯一
- 密码长度 ≥ 8
- 必须包含数字
- 必须包含英文

## Supabase Auth

调用：

```ts
supabase.auth.signUp()
```

## 成功逻辑

创建用户记录

user_profiles

```sql
id uuid
email text
name text
created_at timestamp
```

---

# 5.2 登录模块

## 页面

/auth/login

## UI字段

| 字段 | 类型 |
|--------|--------|
| Email | Email |
| Password | Password |

## API

```ts
supabase.auth.signInWithPassword()
```

## 成功后

跳转：

/dashboard

---

# 5.3 忘记密码

页面：

/auth/forgot-password

流程：

1. 输入邮箱
2. 发送重置邮件
3. 点击邮件链接
4. 重设密码

API

```ts
supabase.auth.resetPasswordForEmail()
```

---

# 5.4 用户主页 Dashboard

页面：

/dashboard

功能：

- 用户信息
- 我的旅行计划
- 创建新计划按钮
- 最近使用记录

---

# 5.5 创建旅行计划

页面：

/trip/create

## 输入项

| 字段 | 类型 |
|--------|--------|
| 出发城市 | Text |
| 目的地 | Text |
| 出发日期 | Date |
| 返回日期 | Date |
| 预算 | Number |
| 兴趣标签 | Multi Select |
| 交通偏好 | Select |
| 住宿偏好 | Select |

兴趣标签：

- 美食
- 自然
- 摄影
- 购物
- 历史
- 动漫
- 夜景
- 咖啡馆

---

# 5.6 AI行程生成

## AI Prompt

输入：

- 用户资料
- 预算
- 日期
- 兴趣

输出：

```json
{
  "day1":[],
  "day2":[],
  "hotel":"",
  "budget":{},
  "tips":[]
}
```

## 生成内容

### 行程安排

按天生成

### 景点推荐

每日至少3个

### 餐饮推荐

早餐
午餐
晚餐

### 预算分析

交通

住宿

餐饮

门票

总预算

---

# 5.7 行程详情页

页面：

/trip/[id]

功能：

- 时间轴展示
- 地图展示
- 预算展示
- 行程编辑

---

# 5.8 保存行程

数据库表：

trip_plans

```sql
id uuid
user_id uuid
title text
destination text
start_date date
end_date date
budget integer
created_at timestamp
```

---

# 5.9 行程内容表

trip_details

```sql
id uuid
trip_id uuid
day_number integer
content jsonb
```

---

# 5.10 编辑行程

支持：

- 修改日期
- 修改预算
- 删除景点
- 新增景点
- AI重新生成

---

# 5.11 删除行程

逻辑删除

```sql
is_deleted boolean
```

---

# 5.12 PDF导出

按钮：

Export PDF

内容：

- 行程表
- 景点清单
- 预算表
- 旅行建议

技术：

react-pdf

---

# 5.13 用户中心

页面

/profile

功能：

- 修改头像
- 修改昵称
- 修改密码
- 查看历史行程

---

# 6. UX Flow

## 注册流程

访客

→ 注册

→ 邮箱验证

→ 登录

→ Dashboard

## 创建旅行流程

Dashboard

→ 创建计划

→ 填写信息

→ AI生成

→ 预览

→ 保存

→ 查看详情

## 导出流程

详情页

→ 导出PDF

→ 下载

---

# 7. 数据库设计

## user_profiles

```sql
create table user_profiles (
id uuid primary key,
email text,
name text,
avatar_url text,
created_at timestamp
);
```

## trip_plans

```sql
create table trip_plans (
id uuid primary key,
user_id uuid,
title text,
destination text,
start_date date,
end_date date,
budget integer,
is_deleted boolean default false,
created_at timestamp
);
```

## trip_details

```sql
create table trip_details (
id uuid primary key,
trip_id uuid,
day_number integer,
content jsonb
);
```

---

# 8. API设计

## POST

/api/trip/generate

功能：

AI生成行程

Request

```json
{
 "destination":"Tokyo",
 "budget":1000
}
```

Response

```json
{
 "success":true,
 "data":{}
}
```

## GET

/api/trip/[id]

获取行程

## PUT

/api/trip/[id]

更新行程

## DELETE

/api/trip/[id]

删除行程

---

# 9. 技术架构

## Frontend

- Next.js 15
- TypeScript
- TailwindCSS
- ShadCN UI

## Backend

- Next.js Route Handler
- Supabase

## Auth

- Supabase Auth
- JWT

## Storage

- Supabase Storage

## Deployment

- GitHub
- Vercel

---

# 10. 页面结构

```text
/
/auth/login
/auth/register
/auth/forgot-password

/dashboard

/trip/create
/trip/[id]

/profile

/admin
/admin/users
/admin/statistics
```

---

# 11. GitHub结构

```text
src/
 ├─ app/
 ├─ components/
 ├─ lib/
 ├─ hooks/
 ├─ services/
 ├─ types/
 ├─ store/
 └─ utils/
```

---

# 12. 非功能需求

性能：

- 页面加载 < 2秒
- AI生成 < 10秒

安全：

- HTTPS
- JWT认证
- RLS权限控制

兼容性：

- Chrome
- Edge
- Safari
- Mobile Browser

---

# 13. MVP验收标准

- 用户可注册
- 用户可登录
- 用户可创建旅行计划
- AI可生成完整行程
- 行程可保存
- 行程可编辑
- 行程可删除
- 行程可导出PDF
- 数据持久化成功
- Vercel部署成功
