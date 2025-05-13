"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UserFile } from "@/lib/constants";
import {
  useAlbums,
  useAddFilesToAlbum,
  useCreateAlbum,
} from "@/lib/hooks/useAlbums";
import { toast } from "sonner";
import { Folder, FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AddToAlbumDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: UserFile[];
}

export default function AddToAlbumDialog({
  isOpen,
  onClose,
  files,
}: AddToAlbumDialogProps) {
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");

  const { data: albums = [] } = useAlbums();
  const addToAlbumMutation = useAddFilesToAlbum();
  const createAlbumMutation = useCreateAlbum();

  const handleAddToAlbum = async (albumId: string) => {
    try {
      await addToAlbumMutation.mutateAsync({
        albumId,
        fileIds: files.map((f) => f.id),
      });

      toast.success(
        `Added ${files.length} ${
          files.length === 1 ? "file" : "files"
        } to album`
      );
      onClose();
    } catch (error) {
      toast.error("Failed to add files to album");
      console.error(error);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      toast.error("Please enter an album name");
      return;
    }

    try {
      const newAlbum = await createAlbumMutation.mutateAsync({
        name: newAlbumName.trim(),
      });

      if (newAlbum?.id) {
        await addToAlbumMutation.mutateAsync({
          albumId: newAlbum.id,
          fileIds: files.map((f) => f.id),
        });

        toast.success(
          `Created album and added ${files.length} ${
            files.length === 1 ? "file" : "files"
          }`
        );
      }

      setNewAlbumName("");
      setIsCreatingAlbum(false);
      onClose();
    } catch (error) {
      toast.error("Failed to create album");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Album</DialogTitle>
        </DialogHeader>

        {isCreatingAlbum ? (
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter album name..."
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreatingAlbum(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAlbum}
                disabled={createAlbumMutation.isPending}
              >
                {createAlbumMutation.isPending ? "Creating..." : "Create Album"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-72 overflow-y-auto">
              <div className="space-y-2 p-1">
                {albums.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No albums found</p>
                    <p className="text-sm">Create a new album to get started</p>
                  </div>
                ) : (
                  albums.map((album) => (
                    <Button
                      key={album.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4"
                      onClick={() => handleAddToAlbum(album.id)}
                      disabled={addToAlbumMutation.isPending}
                    >
                      <Folder className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 text-left">{album.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {album.itemCount || 0}{" "}
                        {(album.itemCount || 0) === 1 ? "item" : "items"}
                      </span>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-between items-center">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setIsCreatingAlbum(true)}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                New Album
              </Button>

              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
