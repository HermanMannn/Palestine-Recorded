// Wikipedia API endpoint
const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";

/**
 * Search Wikipedia for articles related to the query
 * Returns both formatted context text and direct links to articles
 * @param query - Search query string
 * @returns Object with context (formatted snippets) and sources (Wikipedia URLs)
 */
export const searchWikipedia = async (query: string): Promise<{ context: string; sources: string[] }> => {
  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      srsearch: query,
      srprop: "snippet",
      srlimit: "20", // Fetch extra results for better sorting
      origin: "*",
    });

    const response = await fetch(`${WIKIPEDIA_API_URL}?${params}`);
    const data = await response.json();

    // Return empty if no results found
    if (!data.query || !data.query.search || data.query.search.length === 0) {
      return { context: "", sources: [] };
    }

    let results = data.query.search;

    // Sort by relevance: prioritize exact matches, then results with all query words
    results.sort((a: any, b: any) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const queryLower = query.toLowerCase();

      // Exact title match is highest priority
      const aIsExact = aTitle === queryLower ? 1 : 0;
      const bIsExact = bTitle === queryLower ? 1 : 0;
      if (aIsExact !== bIsExact) return bIsExact - aIsExact;

      // Secondary priority: titles containing all query words
      const queryWords = queryLower.split(" ").filter(w => w.length > 0);
      const aContainsAll = queryWords.every(w => aTitle.includes(w)) ? 1 : 0;
      const bContainsAll = queryWords.every(w => bTitle.includes(w)) ? 1 : 0;
      return bContainsAll - aContainsAll;
    });

    // Keep only top 8 most relevant results
    results = results.slice(0, 8);

    // Format results as context text and extract Wikipedia URLs
    const contextLines = results.map((result: any) => {
      const snippet = result.snippet.replace(/<[^>]*>/g, ""); // Remove HTML tags
      return `- ${result.title}: ${snippet}`;
    });

    const sources = results.map((result: any) => {
      const pageTitle = result.title;
      return `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, "_"))}`;
    });

    return {
      context: contextLines.join("\n"),
      sources: sources,
    };
  } catch (error) {
    console.error("Wikipedia search error:", error);
    return { context: "", sources: [] };
  }
};
