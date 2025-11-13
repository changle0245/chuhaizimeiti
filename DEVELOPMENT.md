# 开发指南 / Development Guide

本地开发环境设置指南

---

## 🛠️ 本地开发设置

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/product-marketing-automation.git
cd product-marketing-automation
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 并填入你的配置：
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Inngest (本地开发可以使用dev模式)
INNGEST_EVENT_KEY=test
INNGEST_SIGNING_KEY=test

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
R2_PUBLIC_URL=your_public_url

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
DAILY_USAGE_LIMIT=5
```

### 4. 设置Supabase本地数据库（可选）

如果想在本地开发：
```bash
# 安装Supabase CLI
npm install -g supabase

# 初始化Supabase
supabase init

# 启动本地Supabase
supabase start

# 运行迁移
supabase db reset
```

或直接连接到远程Supabase项目（推荐用于快速开发）。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 📁 项目结构

```
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证相关页面
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # 主应用
│   │   ├── page.tsx         # 创建项目
│   │   ├── projects/        # 项目管理
│   │   ├── products/        # 产品库
│   │   └── admin/           # 管理员面板
│   ├── api/                 # API路由
│   │   ├── upload/          # 文件上传
│   │   ├── projects/        # 项目CRUD
│   │   ├── products/        # 产品库CRUD
│   │   ├── admin/           # 管理员API
│   │   └── inngest/         # Inngest webhook
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/              # React组件
│   ├── ui/                  # UI基础组件
│   ├── create-project.tsx   # 项目创建
│   ├── project-detail.tsx   # 项目详情
│   ├── product-library.tsx  # 产品库
│   └── admin-panel.tsx      # 管理员面板
├── lib/                     # 工具库
│   ├── supabase/            # Supabase客户端
│   ├── ai/                  # AI服务集成
│   │   ├── openai.ts        # OpenAI API
│   │   ├── removebg.ts      # Remove.bg API
│   │   ├── stability.ts     # Stability AI
│   │   └── shotstack.ts     # Shotstack API
│   ├── storage/             # 文件存储
│   │   └── r2.ts            # Cloudflare R2
│   ├── database.types.ts    # 数据库类型
│   └── utils.ts             # 工具函数
├── inngest/                 # Inngest配置
│   ├── client.ts            # Inngest客户端
│   └── functions.ts         # 后台任务函数
├── supabase/                # Supabase配置
│   └── migrations/          # 数据库迁移
└── public/                  # 静态文件
```

---

## 🔧 关键技术栈

### 前端
- **Next.js 14**: React框架（App Router）
- **TypeScript**: 类型安全
- **TailwindCSS**: 样式
- **shadcn/ui**: UI组件库
- **Radix UI**: 无头UI组件
- **React Dropzone**: 文件上传

### 后端
- **Next.js API Routes**: 服务端API
- **Supabase**: 数据库 + 认证
- **Inngest**: 后台任务队列
- **Cloudflare R2**: 对象存储（S3兼容）

### AI服务
- **OpenAI GPT-4/GPT-4o**: 产品识别和文案生成
- **Remove.bg**: 背景移除
- **Stability AI**: 背景生成
- **Shotstack**: 视频生成

---

## 🧪 开发工作流

### 添加新功能
1. 创建功能分支：`git checkout -b feature/your-feature`
2. 开发并测试
3. 提交代码：`git commit -m "Add: your feature"`
4. 推送并创建PR

### 数据库变更
1. 创建新的迁移文件：`supabase/migrations/00X_description.sql`
2. 在Supabase SQL Editor中测试
3. 更新类型定义：`npm run db:types`

### API集成
所有API集成代码在 `lib/ai/` 目录下，每个服务一个文件。

---

## 🐛 调试

### 查看日志
- **Vercel**: Vercel Dashboard > Functions > Logs
- **Supabase**: Supabase Dashboard > Database > Logs
- **Inngest**: Inngest Dashboard > Runs

### 本地调试Inngest
```bash
# 安装Inngest CLI
npm install -g inngest-cli

# 启动Inngest Dev Server
inngest dev
```

这将启动本地Inngest服务器，可以查看和调试后台任务。

---

## 📦 构建和部署

### 本地构建
```bash
npm run build
```

### 本地预览生产版本
```bash
npm run start
```

---

## 🧪 测试

### 测试流程
1. 注册账户
2. 设置管理员权限
3. 配置API Keys
4. 上传测试图片
5. 验证所有AI功能
6. 测试下载功能

### API测试
使用管理员面板的"Test All APIs"功能验证所有API连接。

---

## 💡 开发技巧

### 1. 减少API成本
开发时可以：
- 使用较小的测试图片
- 限制视频时长
- 使用Mock数据（需自行实现）

### 2. 加快开发速度
- 使用远程Supabase（而非本地）
- 热重载自动刷新
- 使用React DevTools

### 3. 代码质量
- 运行 `npm run lint` 检查代码
- 使用TypeScript严格模式
- 遵循组件化原则

---

## 🎓 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [TailwindCSS 文档](https://tailwindcss.com/docs)
- [Inngest 文档](https://www.inngest.com/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)

---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 推送到分支
5. 创建Pull Request

---

祝开发愉快！🚀
