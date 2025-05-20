## Project Structure

- `/app`: Next.js App Router pages and API routes
- `/components`: Reusable UI components
- `/lib`: Utility functions, hooks, and store definitions
- `/public`: Static assets
- `/styles`: Global CSS styles

## API Routes

- `/api/memory`: Search for memories based on query and filters
- `/api/files`: Manage file uploads and listings
- `/api/files/[id]`: Manage individual file operations
- `/api/files/[id]/favorite`: Toggle favorite status
- `/api/albums`: Manage albums
- `/api/albums/[id]/files`: Manage files within albums

## Tech Stack

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **Component Library**: Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Animation & Motion**: Framer Motion
- **AI**: Google Gemini models via AI SDK
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
