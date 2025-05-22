"use client";

import { useState, useEffect } from "react";
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
import { formatBytes } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil } from "lucide-react";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [dateCreated, setDateCreated] = useState<Date | null>(null);
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [editingDateField, setEditingDateField] = useState<
    "created" | "modified" | null
  >(null);

  const updateFileMutation = useUpdateFile();
  const updateDescriptionMutation = useUpdateFileDescription();

  // Update local state when file changes
  useEffect(() => {
    if (file) {
      console.log("File details:", file);
      setName(file.name || "");
      setDescription(file.aiDescription || "");
      setDateCreated(file.dateCreated ? new Date(file.dateCreated) : null);
      setLastModified(file.lastModified ? new Date(file.lastModified) : null);
      setIsEditing(false);
      setEditingDateField(null);
    }
  }, [file]);

  const handleSave = async () => {
    if (!file) return;

    setIsEditing(true);

    try {
      // Update file name if changed
      if (name !== file.name) {
        await updateFileMutation.mutateAsync({
          updates: {
            id: file.id,
            name,
          },
        });
      }

      // Update description if changed
      if (description !== file.description) {
        await updateDescriptionMutation.mutateAsync({
          fileId: file.id,
          description,
        });
      }

      // Update dateCreated if changed
      if (
        dateCreated &&
        (!file.dateCreated ||
          new Date(file.dateCreated).getTime() !== dateCreated.getTime())
      ) {
        await updateFileMutation.mutateAsync({
          updates: {
            id: file.id,
            dateCreated: dateCreated,
          },
        });
      }

      // Update lastModified if changed
      if (
        lastModified &&
        (!file.lastModified ||
          new Date(file.lastModified).getTime() !== lastModified.getTime())
      ) {
        await updateFileMutation.mutateAsync({
          updates: {
            id: file.id,
            lastModified: lastModified,
          },
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

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "N/A";
    try {
      const dateObj =
        typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      return format(dateObj, "PPP 'at' p");
    } catch (error) {
      return dateInput?.toString?.() ?? "N/A";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto px-2">
        <SheetHeader>
          <SheetTitle>File Details</SheetTitle>
          <SheetDescription>
            View and edit details for this file
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 px-5 space-y-6">
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
                Updating the description will improve memory slide back results.
              </p>
            </div>

            {/* File metadata */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-medium">File Information</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Type</dt>
                <dd>{file.type}</dd>

                <dt className="text-muted-foreground">Size</dt>
                <dd>{formatBytes(file.size)}</dd>

                <dt className="text-muted-foreground flex items-center gap-1">
                  Created
                  <Popover
                    open={editingDateField === "created"}
                    onOpenChange={(open) =>
                      setEditingDateField(open ? "created" : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        aria-label="Edit created date"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDateField("created");
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateCreated ?? undefined}
                        onSelect={(date) => {
                          setDateCreated(date ?? null);
                          setIsEditing(true);
                          setEditingDateField(null);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </dt>
                <dd>{dateCreated ? formatDate(dateCreated) : "N/A"}</dd>

                <dt className="text-muted-foreground flex items-center gap-1">
                  Modified
                  <Popover
                    open={editingDateField === "modified"}
                    onOpenChange={(open) =>
                      setEditingDateField(open ? "modified" : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        aria-label="Edit modified date"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDateField("modified");
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={lastModified ?? undefined}
                        onSelect={(date) => {
                          setLastModified(date ?? null);
                          setIsEditing(true);
                          setEditingDateField(null);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </dt>
                <dd>{lastModified ? formatDate(lastModified) : "N/A"}</dd>

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
