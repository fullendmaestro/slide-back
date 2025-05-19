import { useQuery } from "@tanstack/react-query";
import { useMemoryStore } from "@/lib/stores/memoryStore";

export function useMemorySearch() {
  const query = useMemoryStore((state) => state.query);
  const dateRangeFrom = useMemoryStore((state) => state.dateRangeFrom);
  const dateRangeTo = useMemoryStore((state) => state.dateRangeTo);
  const albumIds = useMemoryStore((state) => state.albumIds);
  const aiReview = useMemoryStore((state) => state.aiReview);
  const setResults = useMemoryStore((state) => state.setResults);
  const setIsLoading = useMemoryStore((state) => state.setIsLoading);
  const setError = useMemoryStore((state) => state.setError);

  return useQuery({
    queryKey: ["memory"],
    queryFn: async () => {
      console.log("memorying", {
        query,
        dateRange: {
          from: dateRangeFrom ? dateRangeFrom.toISOString() : null,
          to: dateRangeTo ? dateRangeTo.toISOString() : null,
        },
        albumIds,
        aiReview,
      });
      if (!query) {
        setResults([]);
        return { results: [] };
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/memory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            dateRange: {
              from: dateRangeFrom ? dateRangeFrom.toISOString() : null,
              to: dateRangeTo ? dateRangeTo.toISOString() : null,
            },
            albumIds,
            aiReview,
          }),
        });

        if (!response.ok) {
          let errorMsg = "Failed to search memories";
          try {
            const error = await response.json();
            errorMsg = error.error || errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setResults(data.results);
        return data;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    enabled: false, // Only run when refetch is called
  });
}
