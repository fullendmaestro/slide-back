import { useQuery } from "@tanstack/react-query";

export function useAudioFiles() {
  return useQuery({
    queryKey: ["files", "audio"],
    queryFn: async () => {
      const response = await fetch("/api/files?type=audio");
      if (!response.ok) {
        throw new Error("Failed to fetch audio files");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
