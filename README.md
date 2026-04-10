# Daily Activities Tracker

A modern React web application for tracking daily work activities with complete CRUD functionality. Built with React, TypeScript, Supabase, and hosted on Cloudflare Pages.

## Features

✨ **Core Features:**
- ➕ **Create** - Add new daily activities with date, performer, problem, action, and comments
- 📖 **Read** - View all activities in a beautiful grid layout
- ✏️ **Update** - Edit existing activities
- 🗑️ **Delete** - Remove activities with confirmation
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful gradient background with smooth animations

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Database:** Supabase (PostgreSQL)
- **Styling:** CSS3 with responsive design
- **Deployment:** Cloudflare Pages
- **Environment:** Node.js 18+

## Prerequisites

Before getting started, ensure you have:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account (free tier available)
- A [Cloudflare](https://www.cloudflare.com/) account (free tier available)
- Git installed

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project & Database

1. Go to [Supabase](https://supabase.com/) and sign up/login
2. Create a new project
3. Once the project is created, go to the SQL Editor
4. Run the following SQL to create the `activities` table:

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  performer TEXT NOT NULL,
  problem TEXT NOT NULL,
  action TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create an index for better query performance
CREATE INDEX idx_activities_date ON activities(date DESC);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all authenticated users to read
CREATE POLICY "Allow all authenticated users to read activities"
  ON activities FOR SELECT
  USING (true);

-- Create a policy to allow all authenticated users to insert
CREATE POLICY "Allow all authenticated users to insert activities"
  ON activities FOR INSERT
  WITH CHECK (true);

-- Create a policy to allow all authenticated users to update
CREATE POLICY "Allow all authenticated users to update activities"
  ON activities FOR UPDATE
  USING (true);

-- Create a policy to allow all authenticated users to delete
CREATE POLICY "Allow all authenticated users to delete activities"
  ON activities FOR DELETE
  USING (true);
```

### 3. Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy your **Project URL** and **Anon Key**

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 5. Run Locally

Start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Building for Production

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment to Cloudflare Pages

### Option 1: Using Wrangler CLI

1. Install Wrangler CLI:
   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Deploy:
   ```bash
   wrangler pages deploy dist
   ```

### Option 2: Connect GitHub Repository (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/daily_activities_tracker
   git push -u origin main
   ```

2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Navigate to **Workers & Pages** → **Pages**
4. Click **Create application** → **Connect to Git**
5. Select your GitHub repository
6. Set Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
7. Add environment variables:
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
8. Click **Save and Deploy**

Your site will be live at `your-project-name.pages.dev`

## Project Structure

```
daily-activities-tracker/
├── src/
│   ├── components/
│   │   ├── ActivityForm.tsx      # Form for creating/editing activities
│   │   └── ActivityList.tsx      # Display list of activities
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # React entry point
│   ├── index.css                 # Global styles
│   └── supabaseClient.ts         # Supabase configuration
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── package.json                  # Dependencies
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── wrangler.toml                # Cloudflare deployment config
├── _redirects                   # SPA routing configuration
├── CLOUDFLARE_SETUP.md          # Cloudflare deployment guide
├── .env.example                 # Environment variables template
└── .gitignore                   # Git ignore rules
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Database Schema

The `activities` table has the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `date` | DATE | Date of the activity |
| `performer` | TEXT | Name of the person performing the activity |
| `problem` | TEXT | Description of the problem |
| `action` | TEXT | Description of the action taken |
| `comments` | TEXT | Additional comments (optional) |
| `created_at` | TIMESTAMP | Timestamp of record creation |

## CRUD Operations

### Create
- Fill in the form with activity details
- Click "Add Activity"
- Activity is saved to Supabase immediately

### Read
- All activities are displayed in a card grid
- Activities are sorted by most recent first
- Click on any activity card to view its details

### Update
- Click the "Edit" button on an activity card
- Form will be populated with activity data
- Modify the details and click "Update Activity"

### Delete
- Click the "Delete" button on an activity card
- Confirm deletion in the popup dialog
- Activity is permanently removed from the database

## Features in Detail

### Responsive Design
The application is fully responsive and works on:
- Desktop (1200px and above)
- Tablet (768px to 1199px)
- Mobile (below 768px)

### Form Validation
- All required fields are marked with asterisks (*)
- Date picker ensures valid dates
- Form prevents submission with empty required fields
- Real-time feedback on form submissions

### User Feedback
- Success messages when operations complete
- Error messages if operations fail
- Loading states on buttons during API calls
- Auto-dismissing notification messages

## Troubleshooting

### "Failed to load activities" Error
- Check that Supabase credentials are correct in `.env.local`
- Verify the `activities` table exists in your Supabase database
- Check Row Level Security policies are configured

### Build Errors
- Delete `node_modules` and `dist` folders
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

### Vite Dev Server Issues
- Port 3000 might be in use. Vite will use the next available port
- Check console output for the actual port being used

### Netlify Deployment Issues
- Ensure environment variables are set in Netlify settings
- Check build logs in Netlify dashboard for specific errors
- Verify `dist` folder is created after running `npm run build`

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check Netlify documentation: https://docs.netlify.com/

## Roadmap

Future enhancements:
- User authentication and authorization
- Search and filter activities
- Export activities to CSV/PDF
- Activity statistics and analytics
- Dark mode theme
- Activity categories/tags
- Bulk edit/delete operations

---

Made with ❤️ using React, Supabase, and Netlify
