// DeepSeek API configuration
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * Call the DeepSeek chat API with a conversation history
 * @param messages - Array of message objects with role ('system', 'user', 'assistant') and content
 * @returns The AI-generated response text
 * @throws Error if the API call fails
 */
export const callDeepSeek = async (messages: Array<{ role: string; content: string }>) => {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error("Missing VITE_DEEPSEEK_API_KEY environment variable");
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7, // Balance between determinism and creativity
        max_tokens: 1000, // Limit response length
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API error:", error);
    throw error;
  }
};
