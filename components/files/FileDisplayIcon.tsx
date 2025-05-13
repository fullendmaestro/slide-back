import {
  File,
  FileText,
  ImageIcon,
  VideoIcon,
  Folder,
  Archive,
  FileAudio,
} from "lucide-react";

interface FileDisplayIconProps {
  type: string;
  className?: string;
}

export default function FileDisplayIcon({
  type,
  className = "h-5 w-5",
}: FileDisplayIconProps) {
  switch (type) {
    case "image":
      return <ImageIcon className={className} />;
    case "video":
      return <VideoIcon className={className} />;
    case "document":
      return <FileText className={className} />;
    case "folder":
      return <Folder className={className} />;
    case "archive":
      return <Archive className={className} />;
    case "audio":
      return <FileAudio className={className} />;
    default:
      return <File className={className} />;
  }
}
