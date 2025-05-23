# Slide Back: AI powered memory slider

![Slide Back Demo](public/slide-back.webp)

## Overview

Slide Back is a memory gallery and slideshow app designed to help users revisit their cherished memories using AI. The gallery organizes your media through an immersive experience. And the slider create a slide show of your memories focusing on returning the most accurate and meaningful memories by leveraging advanced AI to surface moments that truly match your prompts.

## How it works

Slide Back uses AI to organize, describe, and retrieve your photos and videos, making it easy to rediscover meaningful moments. The app works in two main modes:

### Slide

Describe the memories you want to revisit using natural language—for example, "happy dinners with my family" or "vacations at the beach." Slide Back leverages AI-powered semantic search to surface your most relevant photos and videos, creating a personalized slideshow experience. After the initial search, a large language model (LLM) reviews and refines the results through a process called Corrective Retrieval Augmented Generation (CRAG), ensuring your slideshow features only the most meaningful and accurate memories.

### Gallery

Upload your photos and videos to the gallery. AI automatically generates descriptions for your media, which are used for semantic search. You can also edit these descriptions to add your own keywords (e.g name of persons and places), improving future search results and giving you more control over how your memories are found.

## UI UX

Slid back is developed mainly for desktop experience with context menu for performing actions. Howwever its will also works fine on mobile experience also.

## Features

- **Memory Wizard**: Create personalized slideshows based on your memories

  - Describe the memory you want to revisit
  - Set date ranges to narrow down your search
  - Select albums to include in your search
  - Choose mood and style preferences
  - Configure additional options like AI review

- **Slideshow Player**: Immersive fullscreen experience

  - Smooth transitions between slides
  - Background blur for enhanced focus
  - Playback controls with auto-hide functionality
  - Customizable playback speed and options

- **File Management**: Organize and manage your media

  - Upload photos and videos
  - Create and manage albums
  - Mark favorites for quick access
  - Grid and list view options
  - Drag and drop support
  - Context menu for quick actions

- **AI-Powered Features**:
  - Semantic search using embeddings
  - AI-generated descriptions for media
  - CRAG (Corrective Retrieval Augmented Generation) for improved search results
  - Mood and style detection

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

## Running Locally

### Prerequisites

Node.js, pnpm or npm, Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/fullendmaestro/slide-back
cd slide-back
```

### Step 2: Install dependencies:

```bash
pnpm install
```

### Step 3: Set up environment variables:

You will need to use the environment variables [defined in `.env.example`](.env.example).

```bash
DATABASE_URL=your_postgres_connection_string
AUTH_SECRET=your_auth_secret
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Step 4: Run database migrations:

```bash
pnpm run db:migrate
```

### Step 5: Start the development server:

```bash
pnpm run dev
```

## Docs

For more details on the project structure, tech stack, project architecture, etc, check out the [Docs.md](Docs.md) file

![slider](https://github.com/user-attachments/assets/4a2c0ad1-9c0d-4a84-9dc4-2d60a2a6d1e6)

## License

This project is protected under the [Apache License](http://www.apache.org/licenses/LICENSE-2.0/) License. For more details, refer to the [LICENSE](LICENSE) file.
