# AI Team Project Tracker

A project management application for the Netcore Cloud AI Adoption Team. Built with Next.js 14, featuring Kanban boards, task management with checklists, and team collaboration.

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

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Drag & Drop**: @hello-pangea/dnd

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Install dependencies:
   ```bash
   cd project-tracker
   npm install
   ```

2. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Steps

1. Register a new account at `/register`
2. Login at `/login`
3. Create your first project using the + button in the sidebar
4. Add tasks to your Kanban board
5. Organize with checklists, labels, and assignees

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

Create a `.env` file with:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"
```

## License

Private - Netcore Cloud AI Adoption Team
