# Product Marketing Automation Tool

AI-powered automation tool for transforming product images into professional marketing content for Arabic/Muslim markets.

## 🚀 Features

- **AI Image Processing**: Automatic background removal and generation
- **Multi-language Content**: Generate marketing copy in English and Arabic
- **Video Generation**: Create engaging product videos with customizable settings
- **Product Library**: Build your own AI-powered product knowledge base
- **User Management**: Email verification and daily usage limits
- **Admin Dashboard**: Centralized API key management and testing

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth)
- **File Storage**: Cloudflare R2
- **Task Queue**: Inngest
- **AI APIs**:
  - OpenAI GPT-4 Vision (Product Recognition)
  - OpenAI GPT-4o (Copy Generation)
  - Remove.bg (Background Removal)
  - Stability AI (Background Generation)
  - Shotstack (Video Generation)

## 📋 Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Enable email auth in Supabase dashboard
4. Update your project settings:
   - Enable email confirmations (or disable for testing)
   - Set up email templates

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your credentials:

\`\`\`env
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Inngest (create account at inngest.com)
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Cloudflare R2 (create at cloudflare.com/r2)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=product-ai
R2_PUBLIC_URL=https://your-bucket.r2.dev

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
DAILY_USAGE_LIMIT=5
\`\`\`

### 4. Create First Admin User

1. Sign up through the app
2. Go to your Supabase SQL Editor
3. Run:
   \`\`\`sql
   UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
   \`\`\`

### 5. Configure API Keys (Admin Only)

1. Login as admin
2. Go to Dashboard > Admin
3. Add your API keys:
   - OpenAI API Key
   - Remove.bg API Key
   - Stability AI API Key
   - Shotstack API Key
4. Test each API connection

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment to Vercel

### Prerequisites

- Vercel account
- All environment variables ready
- Supabase project configured

### Steps

1. **Push to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   \`\`\`

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add all environment variables from `.env.local`
   - Deploy!

3. **Post-Deployment Setup**
   - Update Supabase redirect URLs:
     - Go to Supabase Dashboard > Authentication > URL Configuration
     - Add your Vercel URL to "Site URL"
     - Add `https://your-app.vercel.app/auth/callback` to "Redirect URLs"
   - Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to your deployment URL

### Vercel Limitations (Free Tier)

- 10-second function timeout (may affect video generation)
- Consider upgrading to Pro ($20/month) for 60-second timeout
- Or use Inngest for long-running tasks (recommended)

## 🏗️ Project Structure

\`\`\`
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── dashboard/
│   │   ├── page.tsx        # Main creation interface
│   │   ├── projects/       # Project history
│   │   ├── products/       # Product library
│   │   └── admin/          # Admin panel
│   ├── api/
│   │   ├── upload/         # Image upload endpoint
│   │   ├── process/        # Image processing
│   │   ├── generate/       # Content generation
│   │   └── inngest/        # Inngest webhook
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── dashboard-nav.tsx   # Dashboard navigation
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── ai/                # AI service integrations
│   ├── storage/           # R2 storage utilities
│   └── database.types.ts  # Database types
├── supabase/
│   └── migrations/        # Database migrations
└── inngest/               # Background job functions
\`\`\`

## 🔑 API Keys Required

Purchase these API keys before deployment:

1. **OpenAI** - [platform.openai.com](https://platform.openai.com)
   - GPT-4 Vision for product recognition
   - GPT-4o for copy generation
   - Estimated cost: $0.01-0.05 per image

2. **Remove.bg** - [remove.bg/api](https://www.remove.bg/api)
   - Background removal
   - Pay-as-you-go or subscription
   - Estimated cost: $0.20 per image (or bulk discounts)

3. **Stability AI** - [stability.ai](https://stability.ai)
   - Background generation with SDXL
   - Estimated cost: $0.02-0.05 per image

4. **Shotstack** - [shotstack.io](https://shotstack.io)
   - Video generation from images
   - Estimated cost: $0.05-0.30 per video

## 📱 Usage Flow

1. **User uploads product image**
2. **AI identifies product** (GPT-4 Vision)
3. **Query product library** (if exists)
4. **User selects settings**:
   - Background style (or AI auto-select)
   - Video duration
   - Music preference
   - Language (EN/AR or both)
5. **Background tasks process**:
   - Remove background
   - Generate new background
   - Create marketing copy
   - Generate video
6. **User downloads package**:
   - Original & processed images
   - Marketing copy (TXT files)
   - Video file

## 🎯 Daily Usage Limits

- Free users: 5 generations per day
- Limit resets every 24 hours
- Configurable via `DAILY_USAGE_LIMIT` env var
- Admin users: Unlimited

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User data isolated by user ID
- Admin-only access to API keys (encrypted in database)
- Email verification required
- Secure file uploads to R2

## 🚧 Current Development Status

✅ Completed:
- Project setup and configuration
- Supabase database schema
- User authentication system
- Admin panel structure
- UI components

🚧 In Progress:
- Image upload and processing
- AI integrations
- Product library
- Video generation
- Download functionality

## 📞 Support

For issues or questions:
- Check the GitHub Issues
- Review Supabase logs
- Check Vercel deployment logs
- Review Inngest function logs

## 📄 License

Private - All rights reserved
