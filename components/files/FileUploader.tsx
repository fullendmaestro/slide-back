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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FileDisplayIcon from "./FileDisplayIcon";
import type { File } from "@/lib/db/schema";
import FileContextMenu from "../gallery/FileContextMenu";
import { formatBytes } from "@/lib/utils";
import { format } from "date-fns";
import FileActions from "./FileActions";

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const cancelRef = useRef<boolean>(false);

  const { setDetailsFile, setDetailsOpen } = useFileStore();

  const { uploadFile } = useUploadFile();
  const addFiles = useFileStore((state) => state.addFiles);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => {
        console.log("droped file", file);
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
      if (newFiles[index].previewUrl) {
        URL.revokeObjectURL(newFiles[index].previewUrl);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    cancelRef.current = false;

    try {
      setFiles((prev) => prev.map((f) => ({ ...f, status: "uploading" })));

      for (let i = 0; i < files.length; i++) {
        if (cancelRef.current) break;
        if (files[i].status === "complete") continue;

        const onProgress = (progress: number) => {
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[i].progress = progress;
            return newFiles;
          });
        };

        try {
          const result = await uploadFile(files[i].file, onProgress);

          if (result) {
            setUploadedFiles((prev) => [...prev, result]);
            // Mark as complete and remove from files
            setFiles((prev) => {
              const newFiles = [...prev];
              newFiles[i].status = "complete";
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

      // Remove completed files from the files array
      setFiles((prev) => prev.filter((f) => f.status !== "complete"));

      // Call handleComplete if all files are uploaded
      if (files.every((f) => f.status === "complete" || f.status === "error")) {
        handleComplete();
      }
    } catch (error) {
      toast.error("Failed to upload files. Please try again.");
      console.error("Upload error:", error);
    }
  };

  const handleComplete = () => {
    const uploadedCount = uploadedFiles.length;
    if (uploadedCount > 0) {
      toast.success(`Successfully uploaded ${uploadedCount} files`);
    }
    setFiles([]);
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

  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return "N/A";
    try {
      const dateObj =
        typeof dateValue === "string" ? new Date(dateValue) : dateValue;
      return format(dateObj, "MMM dd, yyyy");
    } catch (error) {
      return String(dateValue);
    }
  };

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
          {files.length === 0 && uploadedFiles.length === 0 ? (
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
          ) : (
            <>
              {/* Unuploaded Files List */}
              {files.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Files to Upload</h3>
                  <div className="space-y-3 max-h-50 overflow-y-auto">
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
                            disabled={file.status === "uploading"}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {/* Overall progress */}
                  <div className="space-y-1 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>
                </div>
              )}

              {/* Separator */}
              {files.length > 0 && uploadedFiles.length > 0 && (
                <Separator className="my-4" />
              )}

              {/* Uploaded Files Table */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Uploaded Files</h3>
                  <div className="overflow-x-auto max-h-50 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px] px-2 sm:px-4"></TableHead>{" "}
                          {/* Icon */}
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden sm:table-cell w-[120px] sm:w-[150px]">
                            Size
                          </TableHead>
                          <TableHead className="hidden md:table-cell text-muted-foreground">
                            Date
                          </TableHead>
                          <TableHead className="text-right w-[80px] px-2 sm:px-4">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedFiles.map((file, idx) => (
                          <TableRow
                            key={file.id}
                            className="hover:bg-muted/50 group transition-colors"
                          >
                            <TableCell className="px-2 sm:px-4">
                              <FileDisplayIcon
                                type={file.type}
                                className="text-muted-foreground group-hover:text-primary transition-colors"
                              />
                            </TableCell>
                            <TableCell
                              className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl"
                              title={file.name}
                            >
                              <FileContextMenu file={file}>
                                <div className="flex items-center">
                                  <span className="truncate">{file.name}</span>
                                  {file.isFavorite && (
                                    <span className="ml-2 text-amber-500">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                              </FileContextMenu>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                              {formatBytes(file.size)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                              {formatDate(file.dateCreated)}
                            </TableCell>
                            <TableCell
                              className="text-right px-2 sm:px-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* <FileActions file={file} /> */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2"
                                onClick={() => {
                                  setDetailsFile(file);
                                  setDetailsOpen(true);
                                }}
                              >
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {files.length === 0 && uploadedFiles.length === 0 ? (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          ) : (
            <div className="flex justify-end gap-2 w-full">
              {files.some((f) => f.status === "uploading") ? (
                <Button variant="outline" onClick={cancelUpload}>
                  Cancel Upload
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiles([]);
                    setUploadedFiles([]);
                  }}
                >
                  New
                </Button>
              )}

              {files.length > 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={files.some((f) => f.status === "uploading")}
                >
                  {files.some((f) => f.status === "uploading")
                    ? "Uploading..."
                    : "Upload Files"}
                </Button>
              )}

              {files.length === 0 && uploadedFiles.length > 0 && (
                <Button
                  onClick={() => {
                    handleComplete();
                    onClose();
                  }}
                >
                  Finish
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
