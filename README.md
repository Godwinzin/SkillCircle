# SkillCircle

A community Q&A site where people learning web development, graphic design, networking, cybersecurity and more ask questions and help each other.

## Features

- Sign up and log in with email, Google or GitHub
- Questions in categories, with search, sorting and filters
- Answers, accepted answers, upvotes and comments
- Markdown with syntax-highlighted code (with live preview)
- Profiles with avatar, bio and skill level
- Responsive layout (sidebar on wide screens, drawer on phones), dark mode, offline notice

## Tech stack

- **Frontend:** React (Vite), React Router, react-markdown
- **Backend:** Supabase (Postgres, Auth, Storage). There is no custom server.

## Project structure

```
skillcircle/
├── frontend/             React app
│   └── src/
│       ├── components/   reusable pieces (PostCard, Comments, Sidebar…)
│       ├── pages/        one file per page
│       ├── hooks/        useAuth, useNow, useOnlineStatus…
│       ├── context/      auth state
│       └── lib/          Supabase client and helpers
└── supabase/
    └── migrations/       SQL for the database, run in filename order
```

## Getting started

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run every file in `supabase/migrations/` **in filename order**.
   The avatars migration contains the project's web address. Change it to your own project's address first.
3. In Supabase → Authentication → URL Configuration, set Site URL to `http://localhost:5173` and add `http://localhost:5173/**` to Redirect URLs.
4. Optional: enable Google and GitHub under Authentication → Providers.
5. Create `frontend/.env`:
```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-public-key
```
6. Run it:
```bash
   cd frontend
   npm install
   npm run dev
```


## How the database is protected

- **Row Level Security** is on for every table: anyone can read, only logged-in members can write, and only to their own rows.
- **Column permissions** stop members changing fields they shouldn't (`is_solved`, `vote_count`, `answer_count`, `created_at`…).
- **Triggers and functions** keep counters correct and handle accepting an answer.
- The public key in the frontend is safe to expose. The `service_role` key must **never** go in frontend code or Git.

## Data model

`profiles` · `categories` · `posts` · `answers` · `answer_votes` · `comments` · storage bucket `avatars`

