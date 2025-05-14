"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Download,
  Share2,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import type { File } from "@/lib/db/schema";
import { motion, AnimatePresence } from "framer-motion";
import FileDisplayIcon from "@/components/files/FileDisplayIcon";
import { useToggleFavorite } from "@/lib/hooks/useFiles";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFile: File;
  files: File[];
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  initialFile,
  files,
}: FilePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFile, setCurrentFile] = useState<File>(initialFile);
  const toggleFavoriteMutation = useToggleFavorite();

  // Find the index of the initial file when the modal opens
  useEffect(() => {
    if (isOpen && initialFile) {
      const index = files.findIndex((f) => f.id === initialFile.id);
      setCurrentIndex(index >= 0 ? index : 0);
      setCurrentFile(initialFile);
    }
  }, [isOpen, initialFile, files]);

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + files.length) % files.length;
    setCurrentIndex(newIndex);
    setCurrentFile(files[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % files.length;
    setCurrentIndex(newIndex);
    setCurrentFile(files[newIndex]);
  };

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate({
      fileId: currentFile.id,
      isFavorite: !currentFile.isFavorite,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-sm"
        onKeyDown={handleKeyDown}
      ></DialogContent>
    </Dialog>
  );
}

// <div className="absolute top-4 right-4 z-50">
//   <Button
//     variant="ghost"
//     size="icon"
//     onClick={onClose}
//     className="rounded-full bg-background/50 hover:bg-background/80"
//   >
//     <X className="h-5 w-5" />
//   </Button>
// </div>

// <div className="flex flex-col h-full">
//   {/* Top toolbar */}
//   <div className="flex justify-between items-center p-4 border-b">
//     <div className="text-lg font-medium truncate max-w-[50%]">
//       {currentFile.name}
//     </div>
//     <div className="flex gap-2">
//       <Button variant="ghost" size="sm" onClick={handleToggleFavorite}>
//         <Heart
//           className={`h-5 w-5 mr-1 ${
//             currentFile.isFavorite
//               ? "fill-amber-500 text-amber-500"
//               : ""
//           }`}
//         />
//         {currentFile.isFavorite ? "Favorited" : "Favorite"}
//       </Button>
//       <Button variant="ghost" size="sm">
//         <Download className="h-5 w-5 mr-1" />
//         Download
//       </Button>
//       <Button variant="ghost" size="sm">
//         <Share2 className="h-5 w-5 mr-1" />
//         Share
//       </Button>
//       <Button variant="ghost" size="sm">
//         <Pencil className="h-5 w-5 mr-1" />
//         Edit
//       </Button>
//     </div>
//   </div>

//   {/* Main content area */}
//   <div className="flex-1 relative flex items-center justify-center overflow-hidden">
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={currentFile.id}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.2 }}
//         className="w-full h-full flex items-center justify-center p-8"
//       >
//         {currentFile.type === "image" && currentFile.url ? (
//           <div className="relative w-full h-full">
//             <Image
//               src={currentFile.url || "/placeholder.svg"}
//               alt={currentFile.name}
//               fill
//               sizes="(max-width: 768px) 100vw, 80vw"
//               className="object-contain"
//             />
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center">
//             <FileDisplayIcon
//               type={currentFile.type}
//               className="h-32 w-32 text-muted-foreground"
//             />
//             <p className="mt-4 text-lg">{currentFile.name}</p>
//           </div>
//         )}
//       </motion.div>
//     </AnimatePresence>

//     {/* Navigation buttons */}
//     {files.length > 1 && (
//       <>
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={handlePrevious}
//           className="absolute left-4 rounded-full bg-background/50 hover:bg-background/80"
//         >
//           <ChevronLeft className="h-8 w-8" />
//         </Button>
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={handleNext}
//           className="absolute right-4 rounded-full bg-background/50 hover:bg-background/80"
//         >
//           <ChevronRight className="h-8 w-8" />
//         </Button>
//       </>
//     )}
//   </div>

//   {/* Bottom info */}
//   <div className="p-4 border-t">
//     <p className="text-sm text-muted-foreground">
//       {currentIndex + 1} of {files.length} •{" "}
//       {currentFile.description || "No description"}
//     </p>
//   </div>
// </div>
