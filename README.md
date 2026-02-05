# AI Team Project Tracker

A project management application for the Netcore Cloud AI Adoption Team. Built with Next.js 16, featuring Kanban boards, task management with checklists, and team collaboration.

## Features

- **Authentication**: User registration and login with role-based access
- **Project Management**: Create and organize projects by type (Client, Internal, Feature Request)
- **Kanban Board**: Drag-and-drop task management with customizable columns
- **Task Cards**: 
  - Title and description
  - Checklists with progress tracking
  - Assignees and due dates
  - Priority levels (High/Medium/Low)
  - Labels/Tags
  - Comments for discussion
  - File attachments
- **Multiple Views**: Switch between Kanban board and List/Table view
- **Filtering**: Search and filter tasks by assignee, priority, and due date

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Drag & Drop**: @hello-pangea/dnd

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm
- A Neon database (or local PostgreSQL for development)

### Local Development

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
   
   **Note:** If you encounter certificate issues during installation (common with corporate proxies), run:
   ```bash
   npm install --ignore-scripts
   $env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx prisma generate
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your database credentials:
   - For local development, you can use a local PostgreSQL instance
   - Or create a free Neon database at [console.neon.tech](https://console.neon.tech)

4. Push the database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Steps

1. Register a new account at `/register`
2. Login at `/login`
3. Create your first project using the + button in the sidebar
4. Add tasks to your Kanban board
5. Organize with checklists, labels, and assignees

## Deployment to Vercel

### 1. Set Up Neon Database

1. Create a new project at [console.neon.tech](https://console.neon.tech)
2. Copy your connection strings from the Neon dashboard:
   - **Pooled connection** (for `DATABASE_URL`): `postgresql://...@ep-xxx-pooler.region.aws.neon.tech/neondb`
   - **Direct connection** (for `DIRECT_URL`): `postgresql://...@ep-xxx.region.aws.neon.tech/neondb`

### 2. Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com/new)
3. Add the following environment variables in Vercel:
   - `DATABASE_URL` - Your Neon pooled connection string
   - `DIRECT_URL` - Your Neon direct connection string  
   - `AUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `AUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

4. Deploy! Vercel will automatically:
   - Install dependencies
   - Run `prisma generate` (via postinstall script)
   - Build the Next.js application

### 3. Initialize the Database

After your first deployment, push the schema to your Neon database:

```bash
# Set your environment variables locally
export DATABASE_URL="your-pooled-connection-string"
export DIRECT_URL="your-direct-connection-string"

# Push the schema
npx prisma db push
```

Or use the Vercel CLI:
```bash
vercel env pull .env.local
npx prisma db push
```

## Project Structure

```
project-tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login and register pages
│   │   ├── (dashboard)/     # Main app with sidebar
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── board/           # Kanban and list view
│   │   ├── task/            # Task modal, checklists
│   │   └── layout/          # Sidebar
│   └── lib/                 # Prisma and auth config
├── prisma/
│   └── schema.prisma        # Database schema
└── public/
    └── uploads/             # File attachments
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon pooled connection string (used at runtime) |
| `DIRECT_URL` | Neon direct connection string (used for migrations) |
| `AUTH_SECRET` | Secret key for NextAuth.js session encryption |
| `AUTH_URL` | Base URL for authentication callbacks |

## Database Commands

```bash
# Push schema changes to database (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open Prisma Studio to view/edit data
npm run db:studio
```

## Important Notes for Production

### File Attachments
The current implementation stores file attachments in the local filesystem (`public/uploads/`). This **will not work on Vercel** as the filesystem is read-only. For production, consider integrating:
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) - Simple file storage by Vercel
- [Cloudinary](https://cloudinary.com) - Image and file management
- [AWS S3](https://aws.amazon.com/s3/) - Scalable cloud storage
- [Uploadthing](https://uploadthing.com) - Easy file uploads for Next.js

### Database Migrations
For production deployments, use `prisma db push` for initial setup. For subsequent schema changes, consider using proper migrations with `prisma migrate deploy`.

## License

Private - Netcore Cloud AI Adoption Team
