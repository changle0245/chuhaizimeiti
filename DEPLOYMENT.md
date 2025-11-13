# 部署指南 / Deployment Guide

完整的生产环境部署指南 / Complete production deployment guide

---

## 📋 前置准备 / Prerequisites

在开始部署之前，请确保已准备好以下账户和服务：

### 1. **Supabase** (数据库和认证)
- 访问 [supabase.com](https://supabase.com)
- 创建新项目
- 记录以下信息：
  - `Project URL`
  - `anon/public key`
  - `service_role key`

### 2. **Cloudflare R2** (文件存储)
- 访问 [cloudflare.com/r2](https://www.cloudflare.com/products/r2/)
- 创建R2 bucket
- 生成API密钥
- 记录：
  - `Account ID`
  - `Access Key ID`
  - `Secret Access Key`
  - `Bucket Name`
  - 配置公开访问URL

### 3. **Inngest** (任务队列)
- 访问 [inngest.com](https://www.inngest.com/)
- 创建免费账户
- 记录：
  - `Event Key`
  - `Signing Key`

### 4. **AI API Keys** (管理员后台配置)
购买以下API密钥，部署后在管理员后台配置：
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Remove.bg**: [remove.bg/api](https://www.remove.bg/api)
- **Stability AI**: [platform.stability.ai/account/keys](https://platform.stability.ai/account/keys)
- **Shotstack**: [dashboard.shotstack.io/api-keys](https://dashboard.shotstack.io/api-keys)

### 5. **Vercel** (托管平台)
- 访问 [vercel.com](https://vercel.com)
- 准备GitHub账户

---

## 🚀 部署步骤 / Deployment Steps

### 第一步：设置Supabase数据库

1. **登录Supabase并创建项目**
   ```
   Project Name: product-marketing-automation
   Database Password: [设置强密码]
   Region: 选择距离目标用户最近的区域
   ```

2. **运行数据库迁移**
   - 进入项目的SQL Editor
   - 复制 `supabase/migrations/001_initial_schema.sql` 文件内容
   - 粘贴并执行

3. **配置认证**
   - 进入 `Authentication` > `Providers`
   - 启用 Email provider
   - 配置Email templates（可选，建议自定义）
   - 在 `URL Configuration` 中：
     - Site URL: `https://your-domain.vercel.app`
     - Redirect URLs: `https://your-domain.vercel.app/auth/callback`

4. **获取密钥**
   - 进入 `Settings` > `API`
   - 复制：
     - `Project URL`
     - `anon public` key
     - `service_role` key (仅后端使用)

---

### 第二步：配置Cloudflare R2

1. **创建R2 Bucket**
   ```
   Bucket Name: product-marketing-automation
   Region: Automatic
   ```

2. **配置CORS（重要）**
   在bucket设置中添加CORS规则：
   ```json
   [
     {
       "AllowedOrigins": ["https://your-domain.vercel.app"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

3. **生成API密钥**
   - 进入 `R2` > `Manage R2 API Tokens`
   - 创建新token，权限选择 `Edit`
   - 保存 Access Key ID 和 Secret Access Key

4. **配置公开访问（如需要）**
   - 绑定自定义域名或使用 `r2.dev` 子域
   - 记录公开访问URL

---

### 第三步：配置Inngest

1. **注册Inngest账户**
   - 访问 [inngest.com](https://www.inngest.com/)
   - 创建新应用: `product-marketing-automation`

2. **获取密钥**
   - Event Key: 用于发送事件
   - Signing Key: 用于验证webhook

---

### 第四步：推送代码到GitHub

```bash
# 1. 初始化Git仓库（如果还没有）
git init
git add .
git commit -m "Complete product marketing automation tool"

# 2. 创建GitHub仓库
# 访问 github.com/new 创建新仓库

# 3. 推送代码
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

---

### 第五步：部署到Vercel

1. **连接GitHub仓库**
   - 访问 [vercel.com/new](https://vercel.com/new)
   - 选择你的GitHub仓库
   - 框架选择: `Next.js`

2. **配置环境变量**

   在Vercel项目设置中添加以下环境变量：

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

   # Inngest
   INNGEST_EVENT_KEY=your_inngest_event_key
   INNGEST_SIGNING_KEY=signkey-prod-...

   # Cloudflare R2
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key_id
   R2_SECRET_ACCESS_KEY=your_secret_access_key
   R2_BUCKET_NAME=product-marketing-automation
   R2_PUBLIC_URL=https://your-bucket.r2.dev

   # App Config
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   DAILY_USAGE_LIMIT=5
   ```

3. **部署**
   - 点击 `Deploy`
   - 等待构建完成（约2-3分钟）

4. **验证部署**
   - 访问Vercel提供的URL
   - 测试注册功能
   - 检查邮箱验证是否正常

---

### 第六步：配置Inngest Webhook

部署完成后，需要让Inngest知道你的webhook URL：

1. 访问Inngest dashboard
2. 进入 `Apps` > `Endpoints`
3. 添加endpoint URL:
   ```
   https://your-domain.vercel.app/api/inngest
   ```
4. 测试连接

---

### 第七步：创建管理员账户并配置AI Keys

1. **注册第一个账户**
   - 访问 `https://your-domain.vercel.app/register`
   - 注册账户
   - 验证邮箱

2. **设置为管理员**
   在Supabase SQL Editor中运行：
   ```sql
   UPDATE profiles
   SET is_admin = TRUE
   WHERE email = 'your-admin-email@example.com';
   ```

3. **配置AI API Keys**
   - 登录应用
   - 访问 `Dashboard` > `Admin`
   - 依次添加并测试所有API keys:
     - OpenAI API Key
     - Remove.bg API Key
     - Stability AI API Key
     - Shotstack API Key

---

## ✅ 部署后检查清单

在正式使用前，请检查以下功能：

- [ ] 用户可以注册并收到验证邮件
- [ ] 用户可以登录
- [ ] 管理员可以访问Admin面板
- [ ] 所有API Keys测试通过
- [ ] 可以上传图片
- [ ] 图片可以成功保存到R2
- [ ] 创建项目后，Inngest任务正常执行
- [ ] 项目处理完成后可以查看结果
- [ ] 可以下载生成的内容
- [ ] 每日使用限额正常工作

---

## 🔧 常见问题 / Troubleshooting

### 1. **图片上传失败**
   - 检查R2 CORS配置
   - 验证R2 API密钥
   - 检查文件大小（限制10MB）

### 2. **Inngest任务不执行**
   - 验证webhook URL配置正确
   - 检查Inngest签名密钥
   - 查看Vercel函数日志

### 3. **API测试失败**
   - 确认API密钥正确
   - 检查API余额是否充足
   - 查看具体错误信息

### 4. **邮箱验证邮件未收到**
   - 检查垃圾邮件文件夹
   - 验证Supabase邮件配置
   - 考虑配置自定义SMTP

### 5. **视频生成超时（Vercel免费版）**
   - 升级到Vercel Pro（$20/月）获得60秒timeout
   - 或使用Inngest处理长时间任务（推荐）

---

## 📊 成本估算

### 固定成本（月）
- **Vercel Free**: $0
- **Vercel Pro**: $20（推荐，用于生产环境）
- **Supabase Free**: $0（包含数据库和认证）
- **Cloudflare R2**: ~$0.015/GB
- **Inngest Free**: $0（1000任务/月）

### 变动成本（按使用量）
假设每月生成100个项目：
- **OpenAI GPT-4**: ~$5-10
- **Remove.bg**: ~$20（100张图）
- **Stability AI**: ~$2-5（100张背景）
- **Shotstack**: ~$5-30（100个视频）

**月总成本估算**: $32-85（基于100个项目）

---

## 🚀 优化建议

### 性能优化
1. 启用Next.js Image Optimization
2. 配置CDN（Vercel自动提供）
3. 使用Vercel Edge Functions处理轻量级任务

### 安全优化
1. 启用Supabase Row Level Security（已配置）
2. 定期rotate API keys
3. 监控异常使用模式
4. 配置rate limiting

### 用户体验优化
1. 自定义邮件模板
2. 添加loading状态
3. 优化移动端体验
4. 添加错误重试机制

---

## 📞 支持

如遇到问题：
1. 检查Vercel部署日志
2. 查看Supabase日志
3. 检查Inngest函数执行状态
4. 查看浏览器控制台错误

---

## 🎉 恭喜！

你的产品营销自动化工具已成功部署！

现在你可以：
- ✅ 邀请团队成员注册使用
- ✅ 批量生成产品营销内容
- ✅ 下载并分享到社交媒体
- ✅ 持续监控使用情况和成本

祝你业务蒸蒸日上！🚀
