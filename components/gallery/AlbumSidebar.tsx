"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEnd,
  Heart,
  Folder,
  FolderPlus,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAlbumStore } from "@/lib/stores/albumStore";
import {
  useAlbums,
  useCreateAlbum,
  useUpdateAlbum,
  useDeleteAlbum,
} from "@/lib/hooks/useAlbums";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function AlbumSidebar() {
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [renamingAlbumName, setRenamingAlbumName] = useState("");

  // Album store
  const {
    albums,
    loading: storeLoading,
    currentAlbumId,
    currentView,
    setCurrentAlbum,
    setCurrentView,
  } = useAlbumStore();

  // Fetch albums
  const {
    data: fetchedAlbums = [],
    isLoading: queryLoading,
    isError,
    error,
  } = useAlbums();

  // Mutations
  const createAlbumMutation = useCreateAlbum();
  const updateAlbumMutation = useUpdateAlbum();
  const deleteAlbumMutation = useDeleteAlbum();

  // Determine if we're loading
  const isLoading = storeLoading || queryLoading;

  // Handle errors
  useEffect(() => {
    if (isError && error) {
      toast.error("Failed to load albums", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    }
  }, [isError, error]);

  const handleCreateAlbum = () => {
    if (newAlbumName.trim() === "") {
      toast.error("Album name cannot be empty");
      return;
    }

    createAlbumMutation.mutate(
      {
        name: newAlbumName.trim(),
      },
      {
        onSuccess: () => {
          setNewAlbumName("");
          setIsCreateAlbumOpen(false);
          toast.success(`Album "${newAlbumName.trim()}" created`);
        },
      }
    );
  };

  const handleRenameAlbum = () => {
    if (!editingAlbumId || renamingAlbumName.trim() === "") {
      toast.error("Album name cannot be empty");
      return;
    }

    const oldName = albums.find((a) => a.id === editingAlbumId)?.name || "";

    updateAlbumMutation.mutate(
      {
        id: editingAlbumId,
        name: renamingAlbumName.trim(),
      },
      {
        onSuccess: () => {
          setEditingAlbumId(null);
          setRenamingAlbumName("");
          toast.success(
            `Album renamed from "${oldName}" to "${renamingAlbumName.trim()}"`
          );
        },
      }
    );
  };

  const handleDeleteAlbum = (albumId: string, albumName: string) => {
    toast.error(`Delete album "${albumName}"?`, {
      description: "This will only delete the album, not the files within it.",
      action: {
        label: "Delete",
        onClick: () => {
          deleteAlbumMutation.mutate(albumId, {
            onSuccess: () => {
              // If the deleted album was selected, go back to all files
              if (currentAlbumId === albumId) {
                setCurrentAlbum(null);
                setCurrentView("all");
              }
              toast.success(`Album "${albumName}" deleted`);
            },
          });
        },
      },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <SidebarMenu className="p-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="All Gallery Files"
              isActive={currentView === "all"}
              onClick={() => {
                setCurrentAlbum(null);
                setCurrentView("all");
              }}
            >
              <GalleryVerticalEnd className="h-5 w-5" />
              <span>All Files</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Favorite Files"
              isActive={currentView === "favorites"}
              onClick={() => {
                setCurrentAlbum(null);
                setCurrentView("favorites");
              }}
            >
              <Heart className="h-5 w-5" />
              <span>Favorites</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel className="py-2 mb-3 flex items-center justify-between group-data-[collapsible=icon]:hidden">
              <span className="text-lg">Albums</span>
              <Dialog
                open={isCreateAlbumOpen}
                onOpenChange={setIsCreateAlbumOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 group-data-[collapsible=icon]:hidden"
                    onClick={() => setNewAlbumName("")}
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span className="sr-only">Create New Album</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Album</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label htmlFor="albumName">Album Name</Label>
                    <Input
                      id="albumName"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="e.g., Summer Vacation"
                      autoFocus
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateAlbumOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAlbum}
                      disabled={
                        createAlbumMutation.isPending || !newAlbumName.trim()
                      }
                    >
                      {createAlbumMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SidebarGroupLabel>
            <div className="max-h-[calc(100vh-240px)] overflow-y-auto group-data-[collapsible=icon]:hidden">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center h-8 px-3 my-1 rounded-md bg-muted/50"
                  >
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20 mr-2"></div>
                    <div className="h-4 w-24 bg-muted-foreground/20 rounded"></div>
                  </div>
                ))
              ) : albums.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No albums yet</p>
                  <p className="text-sm">
                    Create your first album to organize your files
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {albums.map((album) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SidebarMenuItem className="group/album-item relative">
                        <SidebarMenuButton
                          tooltip={album.name}
                          size="sm"
                          isActive={
                            currentAlbumId === album.id &&
                            currentView === "album"
                          }
                          onClick={() => {
                            setCurrentAlbum(album.id);
                            setCurrentView("album");
                          }}
                        >
                          <Folder className="h-5 w-5" />
                          <span className="flex-1 truncate">{album.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {album.itemCount || 0}
                          </span>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover/album-item:opacity-100 focus:opacity-100 group-data-[collapsible=icon]:hidden"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingAlbumId(album.id);
                                setRenamingAlbumName(album.name);
                              }}
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteAlbum(album.id, album.name)
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </SidebarGroup>

          {editingAlbumId && (
            <Dialog
              open={!!editingAlbumId}
              onOpenChange={(isOpen) => !isOpen && setEditingAlbumId(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename Album</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="renameAlbumName">New Album Name</Label>
                  <Input
                    id="renameAlbumName"
                    value={renamingAlbumName}
                    onChange={(e) => setRenamingAlbumName(e.target.value)}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingAlbumId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRenameAlbum}
                    disabled={
                      updateAlbumMutation.isPending || !renamingAlbumName.trim()
                    }
                  >
                    {updateAlbumMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </SidebarMenu>
      </ScrollArea>
    </div>
  );
}
