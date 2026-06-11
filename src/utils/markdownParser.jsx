/**
 * Parse and render markdown-style text with bold formatting support
 * Converts **text** to <strong> tags and preserves line breaks
 * @param text - Raw text potentially containing **bold** formatting
 * @returns Array of JSX elements with proper styling
 */
export const renderMarkdown = (text) => {
  const lines = text.split("\n");

  return lines.map((line, idx) => {
    // Regex to find **bold text** patterns
    const boldRegex = /\*\*(.+?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Find all bold text sections and build parts array
    while ((match = boldRegex.exec(line)) !== null) {
      // Add text before this bold section
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: line.substring(lastIndex, match.index) });
      }
      // Add the bold text
      parts.push({ type: "bold", content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last bold section
    if (lastIndex < line.length) {
      parts.push({ type: "text", content: line.substring(lastIndex) });
    }

    // If no bold formatting found, return plain text (or empty line as <br>)
    if (parts.length === 0) {
      return (
        <div key={idx} className="text-sm leading-relaxed">
          {line || <br />}
        </div>
      );
    }

    // Render parts with appropriate styling
    return (
      <div key={idx} className="text-sm leading-relaxed">
        {parts.map((part, partIdx) =>
          part.type === "bold" ? (
            <strong key={partIdx} className="font-semibold text-foreground">
              {part.content}
            </strong>
          ) : (
            <span key={partIdx}>{part.content}</span>
          )
        )}
      </div>
    );
  });
};
