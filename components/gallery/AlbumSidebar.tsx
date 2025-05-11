"use client";

import { useState } from "react";
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
  ImageIcon,
  FolderPlus,
  MoreHorizontal,
} from "lucide-react";
import { MOCK_ALBUMS, type Album } from "@/lib/constants";
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

export default function AlbumSidebar() {
  const [albums, setAlbums] = useState<Album[]>(MOCK_ALBUMS);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [renamingAlbumName, setRenamingAlbumName] = useState("");

  const handleCreateAlbum = () => {
    if (newAlbumName.trim() === "") {
      toast.error("Album name cannot be empty");
      return;
    }
    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      name: newAlbumName.trim(),
      itemCount: 0,
    };
    setAlbums([...albums, newAlbum]);
    setNewAlbumName("");
    setIsCreateAlbumOpen(false);
    toast.success(`Album "${newAlbum.name}" created`);
  };

  const handleRenameAlbum = () => {
    if (!editingAlbum || renamingAlbumName.trim() === "") {
      toast.error("Album name cannot be empty");
      return;
    }
    setAlbums(
      albums.map((album) =>
        album.id === editingAlbum.id
          ? { ...album, name: renamingAlbumName.trim() }
          : album
      )
    );
    toast.success(
      `Album "${editingAlbum.name}" renamed to "${renamingAlbumName.trim()}"`
    );
    setEditingAlbum(null);
    setRenamingAlbumName("");
  };

  const handleDeleteAlbum = (albumId: string, albumName: string) => {
    setAlbums(albums.filter((album) => album.id !== albumId));
    toast.error(`Album "${albumName}" deleted`);
  };

  return (
    <div className="h-full flex flex-col">
      <SidebarMenu className="p-2">
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="All Gallery Files" isActive>
            <GalleryVerticalEnd />
            <span>Gallery</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Favorite Files">
            <Heart />
            <span>Favorites</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
            <span>Albums</span>
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
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateAlbumOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAlbum}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarGroupLabel>
          <div className="max-h-60 overflow-y-auto group-data-[collapsible=icon]:hidden">
            {albums.map((album) => (
              <SidebarMenuItem
                key={album.id}
                className="group/album-item relative"
              >
                <SidebarMenuButton tooltip={album.name} size="sm">
                  <ImageIcon />
                  <span>{album.name}</span>
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
                        setEditingAlbum(album);
                        setRenamingAlbumName(album.name);
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteAlbum(album.id, album.name)}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
          </div>
        </SidebarGroup>

        {editingAlbum && (
          <Dialog
            open={!!editingAlbum}
            onOpenChange={(isOpen) => !isOpen && setEditingAlbum(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Rename Album &quot;{editingAlbum.name}&quot;
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="renameAlbumName">New Album Name</Label>
                <Input
                  id="renameAlbumName"
                  value={renamingAlbumName}
                  onChange={(e) => setRenamingAlbumName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingAlbum(null)}>
                  Cancel
                </Button>
                <Button onClick={handleRenameAlbum}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </SidebarMenu>
    </div>
  );
}
