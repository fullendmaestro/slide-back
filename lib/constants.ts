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
  lastModified: string; // ISO date string or human-readable
  url?: string; // for download/preview
  dataAiHint?: string; // For image generation hints
}

export const MOCK_USER_FILES: UserFile[] = [
  {
    id: "folder1",
    name: "Summer Vacation Album",
    type: "folder",
    size: "3 items",
    lastModified: "2024-07-25T10:30:00Z",
    dataAiHint: "folder travel",
  },
  {
    id: "file2",
    name: "Family_Reunion_Highlights_2024.mp4",
    type: "video",
    size: "1.2 GB",
    lastModified: "2024-07-20T15:00:00Z",
    url: "#",
    dataAiHint: "family video",
  },
  {
    id: "file3",
    name: "Birthday_Photos_June_2023.zip",
    type: "archive",
    size: "250 MB",
    lastModified: "2024-06-15T11:20:00Z",
    url: "#",
    dataAiHint: "archive birthday",
  },
  {
    id: "file4",
    name: "Recipe_Collection_Grandma.docx",
    type: "document",
    size: "1.5 MB",
    lastModified: "2024-05-10T09:00:00Z",
    url: "#",
    dataAiHint: "document recipe",
  },
  {
    id: "img1",
    name: "Sunset_Beach_View.jpg",
    type: "image",
    size: "5.2 MB",
    lastModified: "2024-07-28T18:45:00Z",
    url: "https://picsum.photos/seed/img1/600/400",
    dataAiHint: "beach sunset",
  },
  {
    id: "doc1",
    name: "Project_Proposal_Final_V3.pdf",
    type: "document",
    size: "800 KB",
    lastModified: "2024-07-27T14:00:00Z",
    url: "#",
    dataAiHint: "document proposal",
  },
  {
    id: "audio1",
    name: "Podcast_Intro_Music_V2.mp3",
    type: "audio",
    size: "3.1 MB",
    lastModified: "2024-04-01T10:00:00Z",
    url: "#",
    dataAiHint: "audio music",
  },
  {
    id: "folder2",
    name: "Archived Client Documents 2022",
    type: "folder",
    size: "12 items",
    lastModified: "2023-12-01T17:00:00Z",
    dataAiHint: "folder archive",
  },
  {
    id: "img2",
    name: "Holiday_Snaps_Italy_2022_001.jpeg",
    type: "image",
    size: "4.8 MB",
    lastModified: "2023-01-05T12:30:00Z",
    url: "https://picsum.photos/seed/img2/600/400",
    dataAiHint: "holiday image italy",
  },
  {
    id: "img3",
    name: "Mountain_Hiking_Adventure.png",
    type: "image",
    size: "6.1 MB",
    lastModified: "2024-03-10T16:15:00Z",
    url: "https://picsum.photos/seed/img3/600/400",
    dataAiHint: "mountain hike",
  },
  {
    id: "vid2",
    name: "Ski_Trip_GoPro_Footage.mov",
    type: "video",
    size: "2.5 GB",
    lastModified: "2024-02-20T10:00:00Z",
    url: "#",
    dataAiHint: "skiing video gopro",
  },
  {
    id: "img4",
    name: "City_Lights_Tokyo.jpg",
    type: "image",
    size: "3.9 MB",
    lastModified: "2023-11-15T22:00:00Z",
    url: "https://picsum.photos/seed/img4/600/400",
    dataAiHint: "city night tokyo",
  },
];
