# ImageLens Pro

> An intelligent web-based image error detection and correction platform with AI-powered analysis

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🎯 Overview

ImageLens Pro is a production-ready web application that analyzes uploaded images, identifies various types of errors (spelling, grammar, spacing, context, and suggestions), and provides interactive visual feedback with hover effects and color-coded highlighting.

### Key Features

- 🔐 **Google SSO Authentication** - Secure login with Google accounts
- 📤 **Drag & Drop Upload** - Easy image upload with validation
- 🤖 **AI-Powered Detection** - Five types of error detection
- 🎨 **Interactive Visualization** - Color-coded markers with hover tooltips
- 👥 **User Management** - Admin panel for role management
- 📊 **Real-time Status** - Track analysis progress
- 🔄 **N8N Integration** - Webhook-based AI analysis
- 🎭 **Mock Mode** - Built-in testing with sample data

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account (already configured)

### Installation

```bash
# Clone the repository
cd /workspace/app-7dzvb2e20qgx

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Visit **http://localhost:5173** to see the application.

### First Login

1. Click "Sign In" button
2. Sign in with your Google account
3. **You automatically become the administrator** (first user)

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes
- **[User Guide](USER_GUIDE.md)** - Complete user documentation
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Webhook Integration](WEBHOOK_INTEGRATION.md)** - N8N setup guide
- **[Post-Deployment Setup](POST_DEPLOYMENT_SETUP.md)** - After deployment steps
- **[Project Summary](PROJECT_SUMMARY.md)** - Technical overview
- **[Implementation Checklist](IMPLEMENTATION_CHECKLIST.md)** - Feature status

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router v6
- **Icons**: Lucide React

### Backend & Database
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth with Google SSO

### Integration
- **Workflow**: N8N webhook integration
- **Error Detection**: AI-powered analysis

## 📁 Project Structure

```
/workspace/app-7dzvb2e20qgx/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Shared components
│   │   └── ui/            # shadcn/ui components
│   ├── db/
│   │   ├── api.ts         # API functions
│   │   └── supabase.ts    # Supabase client
│   ├── hooks/
│   │   └── useAuth.tsx    # Authentication hook
│   ├── pages/
│   │   ├── Login.tsx      # Login page
│   │   ├── Dashboard.tsx  # User dashboard
│   │   ├── Upload.tsx     # Image upload
│   │   ├── ImageAnalysis.tsx  # Error visualization
│   │   └── Admin.tsx      # Admin panel
│   ├── services/
│   │   └── webhookService.ts  # N8N integration
│   ├── types/
│   │   └── types.ts       # TypeScript types
│   ├── App.tsx            # Main app component
│   ├── routes.tsx         # Route configuration
│   └── index.css          # Global styles
├── supabase/
│   └── migrations/        # Database migrations
├── .env                   # Environment variables
└── [Documentation files]
```

## 🎨 Error Types & Colors

| Error Type | Color | Description |
|------------|-------|-------------|
| **Spelling** | 🔴 Red | Misspelled words and typos |
| **Grammatical** | 🟠 Orange | Grammar and syntax errors |
| **Space** | 🟡 Yellow | Spacing issues |
| **Context** | 🔵 Blue | Wrong word usage |
| **Suggestions** | 🟢 Green | Improvement recommendations |

## 🔧 Development

### Available Commands

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run linter
pnpm run lint

# Type check
pnpm run type-check
```

### Environment Variables

```env
VITE_LOGIN_TYPE=gmail
VITE_APP_ID=app-7dzvb2e20qgx
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_ENV=production
VITE_N8N_WEBHOOK_URL=your-webhook-url
```

## 🚢 Deployment

### Quick Deploy

**Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

**Netlify**
```bash
npm i -g netlify-cli
pnpm run build
netlify deploy --prod --dir=dist
```

See [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔐 Security

- ✅ Google SSO authentication
- ✅ Row Level Security (RLS)
- ✅ Role-based access control
- ✅ Secure file uploads
- ✅ Environment variable protection
- ✅ HTTPS ready

## 📊 Features Status

- ✅ User authentication with Google SSO
- ✅ Image upload and storage
- ✅ Error detection and analysis
- ✅ Interactive error visualization
- ✅ Admin panel for user management
- ✅ N8N webhook integration
- ✅ Mock mode for testing
- ✅ Responsive design
- ✅ Production ready

## 🤝 Contributing

This is a production application. For modifications:

1. Review the documentation
2. Test changes thoroughly
3. Update relevant documentation
4. Ensure linting passes
5. Test in production environment

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

### Resources
- [User Guide](USER_GUIDE.md) - For end users
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - For deployment
- [Quick Start](QUICKSTART.md) - Quick reference

### Getting Help
1. Check documentation
2. Review error logs
3. Check Supabase dashboard
4. Contact development team

## 🎉 Acknowledgments

- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: [Supabase](https://supabase.com/)
- **Workflow**: [N8N](https://n8n.io/)

## 📈 Version History

- **v1.0.0** (2025-11-07): Initial release
  - Complete authentication system
  - Image upload and management
  - Error detection and visualization
  - Admin panel
  - Full documentation

---

**Built with ❤️ using React, TypeScript, and Supabase**

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: 2025-11-07
