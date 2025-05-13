export interface Album {
  id: string;
  name: string;
  itemCount?: number; // Optional: number of items in the album
}

export const MOCK_ALBUMS: Album[] = [
  { id: "vacation2023", name: "Summer Vacation 2023", itemCount: 58 },
  { id: "family_gatherings", name: "Family Gatherings", itemCount: 120 },
  { id: "birthdays_collection", name: "Birthdays Collection", itemCount: 75 },
  { id: "project_alpha", name: "Project Alpha Shots", itemCount: 210 },
  { id: "nature_walks", name: "Nature Walks", itemCount: 33 },
];

// Existing constants from MemoryWizard
export const ALBUMS = MOCK_ALBUMS.map((album) => ({
  id: album.id,
  name: album.name,
}));

export const MOODS = [
  { id: "happy", name: "Happy & Upbeat" },
  { id: "nostalgic", name: "Nostalgic & Sentimental" },
  { id: "reflective", name: "Reflective & Calm" },
  { id: "energetic", name: "Energetic & Fun" },
  { id: "dreamy", name: "Dreamy & Ethereal" },
];

export const STYLES = [
  { id: "vintage", name: "Vintage Film" },
  { id: "modern_clean", name: "Modern & Clean" },
  { id: "cinematic_epic", name: "Cinematic Epic" },
  { id: "funky_retro", name: "Funky Retro" },
  { id: "scrapbook", name: "Digital Scrapbook" },
];

export interface SlideData {
  id: string;
  type: "image" | "video";
  src: string;
  alt?: string;
  duration?: number; // for images, in seconds
  dataAiHint?: string;
}

export const MOCK_SLIDES: SlideData[] = [
  {
    id: "1",
    type: "image",
    src: "https://picsum.photos/1920/1080?random=1",
    alt: "Scenic mountain view",
    duration: 5,
    dataAiHint: "mountain landscape",
  },
  {
    id: "2",
    type: "image",
    src: "https://picsum.photos/1920/1080?random=2",
    alt: "City skyline at night",
    duration: 5,
    dataAiHint: "city night",
  },
  {
    id: "3",
    type: "image",
    src: "https://picsum.photos/1920/1080?random=3",
    alt: "Delicious food spread",
    duration: 5,
    dataAiHint: "food delicious",
  },
  {
    id: "4",
    type: "image",
    src: "https://picsum.photos/1920/1080?random=4",
    alt: "Forest path in autumn",
    duration: 5,
    dataAiHint: "forest autumn",
  },
  {
    id: "5",
    type: "image",
    src: "https://picsum.photos/1920/1080?random=5",
    alt: "Abstract colorful painting",
    duration: 5,
    dataAiHint: "abstract art",
  },
  {
    id: "6",
    type: "image",
    src: "https://picsum.photos/1920/1080?random=6",
    alt: "Beach sunset",
    duration: 5,
    dataAiHint: "beach sunset",
  },
];

export interface UserFile {
  id: string;
  name: string;
  type:
    | "image"
    | "video"
    | "document"
    | "folder"
    | "archive"
    | "audio"
    | "other";
  size: string; // e.g., "1.2 MB", "500 KB"
  lastModified: string; // ISO date string, used for "Date Modified"
  dateCreated?: string; // ISO date string
  dateTaken?: string; // ISO date string
  url?: string; // for download/preview
  dataAiHint?: string; // For image generation hints
  isFavorite?: boolean;
}

export const MOCK_USER_FILES: UserFile[] = [
  {
    id: "folder1",
    name: "Summer Vacation Album",
    type: "folder",
    size: "3 items",
    lastModified: "2024-07-25T10:30:00Z",
    dateCreated: "2024-07-25T09:00:00Z",
    dateTaken: "2024-07-24T10:00:00Z", // Folders usually don't have 'dateTaken'
    dataAiHint: "folder travel",
  },
  {
    id: "file2",
    name: "Family_Reunion_Highlights_2024.mp4",
    type: "video",
    size: "1.2 GB",
    lastModified: "2024-07-20T15:00:00Z",
    dateCreated: "2024-07-20T14:00:00Z",
    dateTaken: "2024-07-19T16:00:00Z",
    url: "#",
    dataAiHint: "family video",
  },
  {
    id: "file3",
    name: "Birthday_Photos_June_2023.zip",
    type: "archive",
    size: "250 MB",
    lastModified: "2024-06-15T11:20:00Z",
    dateCreated: "2024-06-15T10:00:00Z",
    url: "#",
    dataAiHint: "archive birthday",
  },
  {
    id: "file4",
    name: "Recipe_Collection_Grandma.docx",
    type: "document",
    size: "1.5 MB",
    lastModified: "2024-05-10T09:00:00Z",
    dateCreated: "2024-05-09T10:00:00Z",
    url: "#",
    dataAiHint: "document recipe",
  },
  {
    id: "img1",
    name: "Sunset_Beach_View.jpg",
    type: "image",
    size: "5.2 MB",
    lastModified: "2024-07-28T18:45:00Z",
    dateCreated: "2024-07-28T10:00:00Z",
    dateTaken: "2024-07-28T18:40:00Z",
    url: "https://picsum.photos/seed/img1/600/400",
    dataAiHint: "beach sunset",
  },
  {
    id: "doc1",
    name: "Project_Proposal_Final_V3.pdf",
    type: "document",
    size: "800 KB",
    lastModified: "2024-07-27T14:00:00Z",
    dateCreated: "2024-07-26T12:00:00Z",
    url: "#",
    dataAiHint: "document proposal",
  },
  {
    id: "audio1",
    name: "Podcast_Intro_Music_V2.mp3",
    type: "audio",
    size: "3.1 MB",
    lastModified: "2024-04-01T10:00:00Z",
    dateCreated: "2024-03-30T10:00:00Z",
    url: "#",
    dataAiHint: "audio music",
  },
  {
    id: "folder2",
    name: "Archived Client Documents 2022",
    type: "folder",
    size: "12 items",
    lastModified: "2023-12-01T17:00:00Z",
    dateCreated: "2023-11-01T10:00:00Z",
    dataAiHint: "folder archive",
  },
  {
    id: "img2",
    name: "Holiday_Snaps_Italy_2022_001.jpeg",
    type: "image",
    size: "4.8 MB",
    lastModified: "2023-01-05T12:30:00Z",
    dateCreated: "2023-01-02T10:00:00Z",
    dateTaken: "2022-12-25T15:00:00Z",
    url: "https://picsum.photos/seed/img2/600/400",
    dataAiHint: "holiday image italy",
  },
  {
    id: "img3",
    name: "Mountain_Hiking_Adventure.png",
    type: "image",
    size: "6.1 MB",
    lastModified: "2024-03-10T16:15:00Z",
    dateCreated: "2024-03-10T10:00:00Z",
    dateTaken: "2024-03-09T14:30:00Z",
    url: "https://picsum.photos/seed/img3/600/400",
    dataAiHint: "mountain hike",
  },
  {
    id: "vid2",
    name: "Ski_Trip_GoPro_Footage.mov",
    type: "video",
    size: "2.5 GB",
    lastModified: "2024-02-20T10:00:00Z",
    dateCreated: "2024-02-20T09:00:00Z",
    dateTaken: "2024-02-18T13:00:00Z",
    url: "#",
    dataAiHint: "skiing video gopro",
  },
  {
    id: "img4",
    name: "City_Lights_Tokyo.jpg",
    type: "image",
    size: "3.9 MB",
    lastModified: "2023-11-15T22:00:00Z",
    dateCreated: "2023-11-15T10:00:00Z",
    dateTaken: "2023-11-14T21:30:00Z",
    url: "https://picsum.photos/seed/img4/600/400",
    dataAiHint: "city night tokyo",
  },
];

// Music constants for slideshow player
export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  thumbnailUrl: string;
  audioSrc: string; // URL to the audio file
  dataAiHint?: string;
}

export interface MusicCategory {
  id: string;
  name: string;
  tracks: MusicTrack[];
}

export const MOCK_MUSIC_CATEGORIES: MusicCategory[] = [
  {
    id: "chill",
    name: "Chill",
    tracks: [
      {
        id: "chill1",
        title: "Sunset Vibes",
        thumbnailUrl: "https://picsum.photos/64/64?random=10",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        dataAiHint: "beach sunset",
      },
      {
        id: "chill2",
        title: "Forest Whisper",
        thumbnailUrl: "https://picsum.photos/64/64?random=11",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        dataAiHint: "forest path",
      },
      {
        id: "chill3",
        title: "Ocean Calm",
        thumbnailUrl: "https://picsum.photos/64/64?random=12",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        dataAiHint: "ocean wave",
      },
      {
        id: "chill4",
        title: "Quiet Morning",
        thumbnailUrl: "https://picsum.photos/64/64?random=13",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        dataAiHint: "sunrise coffee",
      },
    ],
  },
  {
    id: "beats",
    name: "Beats",
    tracks: [
      {
        id: "beats1",
        title: "Urban Flow",
        thumbnailUrl: "https://picsum.photos/64/64?random=14",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        dataAiHint: "city street",
      },
      {
        id: "beats2",
        title: "Retro Funk",
        thumbnailUrl: "https://picsum.photos/64/64?random=15",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        dataAiHint: "vinyl record",
      },
      {
        id: "beats3",
        title: "Synthwave Drive",
        thumbnailUrl: "https://picsum.photos/64/64?random=16",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        dataAiHint: "neon car",
      },
      {
        id: "beats4",
        title: "Lo-Fi Groove",
        thumbnailUrl: "https://picsum.photos/64/64?random=17",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        dataAiHint: "study desk",
      },
    ],
  },
  {
    id: "sentimental",
    name: "Sentimental",
    tracks: [
      {
        id: "sent1",
        title: "First Steps",
        thumbnailUrl: "https://picsum.photos/64/64?random=18",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        dataAiHint: "baby shoes",
      },
      {
        id: "sent2",
        title: "Golden Years",
        thumbnailUrl: "https://picsum.photos/64/64?random=19",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        dataAiHint: "old couple",
      },
      {
        id: "sent3",
        title: "Reflections",
        thumbnailUrl: "https://picsum.photos/64/64?random=20",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        dataAiHint: "window rain",
      },
      {
        id: "sent4",
        title: "Warm Hearth",
        thumbnailUrl: "https://picsum.photos/64/64?random=21",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        dataAiHint: "fireplace cozy",
      },
    ],
  },
  {
    id: "fun",
    name: "Fun",
    tracks: [
      {
        id: "fun1",
        title: "Party Time",
        thumbnailUrl: "https://picsum.photos/64/64?random=22",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        dataAiHint: "balloons confetti",
      },
      {
        id: "fun2",
        title: "Road Trip Anthem",
        thumbnailUrl: "https://picsum.photos/64/64?random=23",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        dataAiHint: "convertible car",
      },
      {
        id: "fun3",
        title: "Summer Days",
        thumbnailUrl: "https://picsum.photos/64/64?random=24",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        dataAiHint: "ice cream",
      },
      {
        id: "fun4",
        title: "Celebration",
        thumbnailUrl: "https://picsum.photos/64/64?random=25",
        audioSrc:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        dataAiHint: "fireworks night",
      },
    ],
  },
];

export const MOCK_USER_MUSIC: MusicTrack[] = [
  {
    id: "user1",
    title: "My Uploaded Song 1.mp3",
    artist: "User",
    thumbnailUrl: "https://picsum.photos/64/64?random=30",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    dataAiHint: "music note",
  },
  {
    id: "user2",
    title: "Vacation Vibes.wav",
    artist: "User",
    thumbnailUrl: "https://picsum.photos/64/64?random=31",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    dataAiHint: "palm tree",
  },
  {
    id: "user3",
    title: "Chill Study Beat.m4a",
    artist: "User",
    thumbnailUrl: "https://picsum.photos/64/64?random=32",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    dataAiHint: "headphones book",
  },
];

// Ensure at least one track is selected if music is on, or default to first available
export const DEFAULT_MUSIC_TRACK_ID =
  MOCK_MUSIC_CATEGORIES[0]?.tracks[0]?.id || MOCK_USER_MUSIC[0]?.id || "";
export const DEFAULT_MUSIC_SRC =
  MOCK_MUSIC_CATEGORIES[0]?.tracks[0]?.audioSrc ||
  MOCK_USER_MUSIC[0]?.audioSrc ||
  "";
