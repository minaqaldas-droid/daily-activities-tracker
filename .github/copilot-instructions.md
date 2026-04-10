# Daily Activities Tracker - Project Instructions

## Project Overview

This is a full-stack React application for tracking daily work activities with complete CRUD functionality. It uses React with TypeScript, Vite as the build tool, Supabase for the database, and deploys to Netlify.

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Netlify
- **Styling:** CSS3 (vanilla, responsive)
- **Package Manager:** npm

## Key Files

- `src/App.tsx` - Main application component with CRUD logic
- `src/components/ActivityForm.tsx` - Form for creating/editing activities
- `src/components/ActivityList.tsx` - Component for displaying activities
- `src/supabaseClient.ts` - Supabase client and database functions
- `.env.local` - Environment variables (requires Supabase credentials)
- `netlify.toml` - Netlify deployment configuration
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick setup guide

## Database Schema

The application uses a Supabase PostgreSQL database with an `activities` table containing:
- `id` (UUID, primary key)
- `date` (DATE)
- `performer` (TEXT)
- `problem` (TEXT)
- `action` (TEXT)
- `comments` (TEXT, optional)
- `created_at` (TIMESTAMP)

## Setup Requirements

1. Node.js 18+
2. npm or yarn
3. Supabase account (free tier available)
4. Netlify account (free tier available)

## Development Workflow

```bash
# Install dependencies
npm install

# Configure .env.local with Supabase credentials
# (Copy from .env.example)

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The application is configured for Netlify deployment:

1. Push code to GitHub
2. Connect repository to Netlify
3. Netlify will automatically build with `npm run build`
4. Set environment variables in Netlify dashboard
5. Site will be live at `your-site.netlify.app`

## Features

- ✅ Full CRUD operations for activities
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time database updates via Supabase
- ✅ Form validation
- ✅ User feedback with success/error messages
- ✅ Beautiful modern UI with animations

## Customization Notes

- Global styles in `src/index.css`
- Color scheme uses purple gradient (#667eea to #764ba2)
- Grid layout for activity cards (responsive)
- All components are functional React components with TypeScript

## Environment Variables

Required in `.env.local`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Troubleshooting

- **Import errors:** Make sure all dependencies are installed with `npm install`
- **Database connection errors:** Verify Supabase credentials in `.env.local`
- **Port already in use:** Vite will use next available port automatically
- **Build errors:** Delete `node_modules` and `dist`, then run `npm install` again

## Further Documentation

See [README.md](../README.md) for comprehensive documentation and [QUICKSTART.md](../QUICKSTART.md) for quick setup guide.
