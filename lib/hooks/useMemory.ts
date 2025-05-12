import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemoryStore } from "@/lib/stores/memoryStore";

// Search for memories
export function useMemorySearch() {
  const query = useMemoryStore((state) => state.query);
  const dateRange = useMemoryStore((state) => state.dateRange);
  const albumId = useMemoryStore((state) => state.albumId);
  const setResults = useMemoryStore((state) => state.setResults);
  const setLoading = useMemoryStore((state) => state.setLoading);
  const setError = useMemoryStore((state) => state.setError);

  return useQuery({
    queryKey: ["memories", query, dateRange, albumId],
    queryFn: async () => {
      if (!query) {
        return [];
      }

      setLoading(true);
      try {
        let url = `/api/memory?query=${encodeURIComponent(query)}`;

        if (dateRange.from) {
          url += `&fromDate=${dateRange.from.toISOString()}`;
        }

        if (dateRange.to) {
          url += `&toDate=${dateRange.to.toISOString()}`;
        }

        if (albumId) {
          url += `&albumId=${albumId}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to search memories");
        }

        const data = await response.json();
        setResults(data);
        return data;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to search memories"
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to search memories"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!query,
  });
}
