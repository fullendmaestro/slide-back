"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PreviewAttachment } from "./preview-attachment";
import { PaperclipIcon } from "lucide-react";

interface Attachment {
  url: string;
  name: string;
  contentType: string;
}

export function MemoryPromptInput({ field }: any) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const uploadedAttachments = files.map((file) => ({
      url: URL.createObjectURL(file), // Temporary URL for preview
      name: file.name,
      contentType: file.type,
    }));
    setAttachments((current) => [...current, ...uploadedAttachments]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, i) => i !== index));
  };

  return (
    <FormItem>
      <FormLabel className="sr-only">Memory Prompt</FormLabel>
      <FormControl>
        <Textarea
          placeholder="e.g., Summer vacation in Italy, 2023"
          className="min-h-[100px] resize-none shadow-sm"
          {...field}
        />
      </FormControl>
      <div className="mt-4 flex flex-col gap-2">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative">
                <PreviewAttachment attachment={attachment} />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <PaperclipIcon size={16} />
          Attach Files
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </div>
      <FormMessage />
    </FormItem>
  );
}
