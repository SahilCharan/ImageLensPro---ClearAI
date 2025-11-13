# ImageLens Pro

An intelligent web-based image error detection and correction platform.

## Features

- 🔐 **User Authentication** - Secure login with Google OAuth
- 📤 **Image Upload** - Drag-and-drop interface for easy image uploads
- 🤖 **AI-Powered Detection** - Automatic error detection using AI
- 🎯 **Interactive Visualization** - Hover over errors to see details
- 🎨 **Color-Coded Errors** - Different colors for different error types
- 📊 **Dashboard** - View all your analyzed images
- 👨‍💼 **Admin Panel** - Manage users and view analytics

## Error Types

- 🔴 **Spelling** - Red highlights
- 🟠 **Grammatical** - Orange highlights  
- 🟡 **Space** - Yellow highlights
- 🔵 **Context** - Blue highlights
- 🟢 **Suggestions** - Green highlights

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm
- Supabase account

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ID=your_app_id
```

## Usage

1. **Login** - Sign in with your Google account
2. **Upload** - Upload an image for analysis
3. **Analyze** - Wait for AI to detect errors
4. **Review** - Hover over colored dots to see error details
5. **Export** - Download results or corrected version

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth (Google OAuth)

## Project Structure

```
src/
├── components/     # React components
│   ├── auth/      # Authentication components
│   ├── admin/     # Admin panel components
│   └── ui/        # shadcn/ui components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API services
├── db/            # Database utilities
└── types/         # TypeScript types
```

## License

MIT
