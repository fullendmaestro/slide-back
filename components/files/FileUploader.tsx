"use client";

import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  FileText,
  ImageIcon,
  Film,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useFileStore } from "@/lib/stores/fileStore";
import { useUploadFile, useUpdateFileDescription } from "@/lib/hooks/useFiles";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploaderProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadStatus =
  | "pending"
  | "uploading"
  | "reviewing"
  | "complete"
  | "error";

interface UploadingFile {
  file: any;
  progress: number;
  status: UploadStatus;
  previewUrl?: string;
  uploadedFileId?: string;
  description?: string;
}

export default function FileUploader({ isOpen, onClose }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const cancelRef = useRef<boolean>(false);

  const { uploadFile } = useUploadFile();
  const updateDescriptionMutation = useUpdateFileDescription();
  const addFiles = useFileStore((state) => state.addFiles);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => {
        // Create preview URL for images
        const previewUrl = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;

        return {
          file,
          progress: 0,
          status: "pending" as UploadStatus,
          previewUrl,
        };
      });

      setFiles((prev) => [...prev, ...newFiles]);
    },
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            toast.error(`${file.name} is too large. Max size is 50MB.`);
          } else {
            toast.error(`${file.name}: ${error.message}`);
          }
        });
      });
    },
    noClick: true, // Disable click to open file dialog
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      // Release object URL if it exists
      if (newFiles[index].previewUrl) {
        URL.revokeObjectURL(newFiles[index].previewUrl);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });

    // Adjust current index if needed
    if (currentFileIndex >= index && currentFileIndex > 0) {
      setCurrentFileIndex((prev) => prev - 1);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    cancelRef.current = false;

    try {
      // Mark all files as uploading
      setFiles((prev) => prev.map((f) => ({ ...f, status: "uploading" })));

      for (let i = 0; i < files.length; i++) {
        if (cancelRef.current) break;

        // Skip already uploaded files
        if (files[i].status === "complete") continue;

        // Update current file index
        setCurrentFileIndex(i);

        // Create a progress tracker
        const onProgress = (progress: number) => {
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[i].progress = progress;
            return newFiles;
          });
        };

        // Upload the file
        try {
          const result = await uploadFile(files[i].file, onProgress);

          if (result) {
            // Update file status and store uploaded file ID
            setFiles((prev) => {
              const newFiles = [...prev];
              newFiles[i].status = "reviewing";
              newFiles[i].uploadedFileId = result.id;
              newFiles[i].description = result.description || "";
              return newFiles;
            });
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[i].status = "error";
            return newFiles;
          });
        }
      }

      // After all uploads, move to review phase if any files need review
      const needsReview = files.some((f) => f.status === "reviewing");
      if (needsReview) {
        // Find first file that needs review
        const reviewIndex = files.findIndex((f) => f.status === "reviewing");
        if (reviewIndex >= 0) {
          setCurrentFileIndex(reviewIndex);
        }
      } else {
        // All files uploaded successfully
        handleComplete();
      }
    } catch (error) {
      toast.error("Failed to upload files. Please try again.");
      console.error("Upload error:", error);
    }
  };

  const handleUpdateDescription = async () => {
    const currentFile = files[currentFileIndex];

    if (
      !currentFile ||
      !currentFile.uploadedFileId ||
      !currentFile.description
    ) {
      toast.error("Missing file information");
      return;
    }

    try {
      await updateDescriptionMutation.mutateAsync({
        fileId: currentFile.uploadedFileId,
        description: currentFile.description,
      });

      // Mark this file as complete
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[currentFileIndex].status = "complete";
        return newFiles;
      });

      // Find next file that needs review
      const nextReviewIndex = files.findIndex(
        (f, i) => i > currentFileIndex && f.status === "reviewing"
      );

      if (nextReviewIndex >= 0) {
        setCurrentFileIndex(nextReviewIndex);
      } else {
        // No more files to review, complete the process
        handleComplete();
      }
    } catch (error) {
      toast.error("Failed to update description");
      console.error(error);
    }
  };

  const handleComplete = () => {
    // Notify about completion
    const uploadedCount = files.filter((f) => f.status === "complete").length;
    if (uploadedCount > 0) {
      toast.success(`Successfully uploaded ${uploadedCount} files`);
    }

    // Clean up preview URLs
    files.forEach((f) => {
      if (f.previewUrl) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });

    // Reset state
    setFiles([]);
    setCurrentFileIndex(0);

    // Close the modal
    onClose();
  };

  const cancelUpload = () => {
    cancelRef.current = true;
    toast.info("Upload cancelled");
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (file.type.startsWith("video/")) {
      return <Film className="h-6 w-6 text-purple-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleDescriptionChange = (description: string) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[currentFileIndex]) {
        newFiles[currentFileIndex].description = description;
      }
      return newFiles;
    });
  };

  const currentFile = files[currentFileIndex];
  const allFilesUploaded = files.every(
    (f) => f.status === "complete" || f.status === "reviewing"
  );
  const isUploading = files.some((f) => f.status === "uploading");
  const isReviewing = currentFile?.status === "reviewing";

  // Calculate overall progress
  const overallProgress = files.length
    ? files.reduce((sum, file) => sum + file.progress, 0) / files.length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {files.length === 0 ? (
            // File selection view
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-lg font-medium">
                  {isDragActive
                    ? "Drop the files here"
                    : "Drag & drop files here"}
                </p>
                <p className="text-sm text-muted-foreground">or</p>
                <Button type="button" onClick={open}>
                  Select Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports images (JPG, PNG, GIF) and videos (MP4, WebM, MOV) up
                  to 50MB
                </p>
              </div>
            </div>
          ) : isReviewing ? (
            // Description review view
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Review Description</h3>
                <div className="text-sm text-muted-foreground">
                  File {currentFileIndex + 1} of {files.length}
                </div>
              </div>

              {/* File preview */}
              <div className="flex justify-center border rounded-lg p-4 bg-muted/20">
                {currentFile.previewUrl ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={currentFile.previewUrl || "/placeholder.svg"}
                      alt={currentFile.file.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 w-full">
                    {getFileIcon(currentFile.file)}
                    <span className="ml-2">{currentFile.file.name}</span>
                  </div>
                )}
              </div>

              {/* Description editor */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (AI-generated, you can edit)
                </label>
                <Textarea
                  id="description"
                  value={currentFile.description || ""}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  rows={5}
                  placeholder="Enter a description for this file..."
                />
                <p className="text-xs text-muted-foreground">
                  This description will be used for searching and organizing
                  your files.
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-2">
                <div className="flex gap-2">
                  {currentFileIndex > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentFileIndex((prev) => prev - 1)}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                  )}

                  {currentFileIndex < files.length - 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentFileIndex((prev) => prev + 1)}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleUpdateDescription}
                  disabled={updateDescriptionMutation.isPending}
                >
                  {updateDescriptionMutation.isPending
                    ? "Saving..."
                    : "Save & Continue"}
                </Button>
              </div>
            </div>
          ) : (
            // Upload progress view
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Uploading Files</h3>
                <div className="text-sm text-muted-foreground">
                  {files.filter((f) => f.status === "complete").length} of{" "}
                  {files.length} complete
                </div>
              </div>

              {/* Overall progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>

              {/* File list */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <motion.div
                      key={`${file.file.name}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 p-2 rounded-md bg-accent/30"
                    >
                      {getFileIcon(file.file)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {file.file.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB •
                          {file.status === "pending" && " Waiting..."}
                          {file.status === "uploading" && " Uploading..."}
                          {file.status === "reviewing" && " Ready for review"}
                          {file.status === "complete" && " Complete"}
                          {file.status === "error" && " Failed"}
                        </div>
                        {file.status === "uploading" && (
                          <Progress
                            value={file.progress}
                            className="h-1 mt-1"
                          />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {files.length === 0 ? (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          ) : isReviewing ? (
            <Button variant="outline" onClick={handleComplete}>
              Finish
            </Button>
          ) : (
            <div className="flex justify-end gap-2 w-full">
              {isUploading ? (
                <Button variant="outline" onClick={cancelUpload}>
                  Cancel Upload
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setFiles([])}>
                  Clear All
                </Button>
              )}

              {!allFilesUploaded && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0}
                >
                  {isUploading ? "Uploading..." : "Upload Files"}
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
