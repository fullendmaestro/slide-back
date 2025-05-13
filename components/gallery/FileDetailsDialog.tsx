"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { File } from "@/lib/db/schema";
import { useUpdateFile, useUpdateFileDescription } from "@/lib/hooks/useFiles";
import { toast } from "sonner";
import { format } from "date-fns";
import FileDisplayIcon from "@/components/files/FileDisplayIcon";
import Image from "next/image";

interface FileDetailsDialogProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileDetailsDialog({
  file,
  isOpen,
  onClose,
}: FileDetailsDialogProps) {
  const [name, setName] = useState(file?.name || "");
  const [description, setDescription] = useState(file?.description || "");
  const [isEditing, setIsEditing] = useState(false);

  const updateFileMutation = useUpdateFile();
  const updateDescriptionMutation = useUpdateFileDescription();

  // Update local state when file changes
  if (file && file.name !== name && !isEditing) {
    setName(file.name);
  }

  if (file && file.description !== description && !isEditing) {
    setDescription(file.description || "");
  }

  const handleSave = async () => {
    if (!file) return;

    setIsEditing(true);

    try {
      // Update file name if changed
      if (name !== file.name) {
        await updateFileMutation.mutateAsync({
          updates: { id: file.id, name },
        });
      }

      // Update description if changed
      if (description !== file.description) {
        await updateDescriptionMutation.mutateAsync({
          fileId: file.id,
          description,
        });
      }

      toast.success("File details updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update file details");
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  if (!file) return null;

  const formatDate = (date?: Date | string) => {
    if (!date) return "N/A";
    try {
      return format(
        typeof date === "string" ? new Date(date) : date,
        "PPP 'at' p"
      );
    } catch (error) {
      return date instanceof Date ? date.toISOString() : date;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>File Details</SheetTitle>
          <SheetDescription>
            View and edit details for this file
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* File preview */}
          <div className="flex justify-center">
            {file.type === "image" && file.url ? (
              <div className="relative w-full h-48 md:h-64">
                <Image
                  src={file.url || "/placeholder.svg"}
                  alt={file.name}
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 w-full bg-muted rounded-md">
                <FileDisplayIcon
                  type={file.type}
                  className="h-24 w-24 text-muted-foreground"
                />
              </div>
            )}
          </div>

          {/* File details form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setIsEditing(true);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileDescription">Description</Label>
              <Textarea
                id="fileDescription"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsEditing(true);
                }}
                rows={4}
                placeholder="Add a description..."
              />
              <p className="text-xs text-muted-foreground">
                Updating the description will regenerate AI embeddings for
                improved search.
              </p>
            </div>

            {/* File metadata */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-medium">File Information</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Type</dt>
                <dd>{file.type}</dd>

                <dt className="text-muted-foreground">Size</dt>
                <dd>{file.size}</dd>

                <dt className="text-muted-foreground">Created</dt>
                <dd>{formatDate(file.dateCreated)}</dd>

                <dt className="text-muted-foreground">Modified</dt>
                <dd>{formatDate(file.lastModified)}</dd>

                {file.dateTaken && (
                  <>
                    <dt className="text-muted-foreground">Date Taken</dt>
                    <dd>{formatDate(file.dateTaken)}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              updateFileMutation.isPending ||
              updateDescriptionMutation.isPending
            }
          >
            {updateFileMutation.isPending || updateDescriptionMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
