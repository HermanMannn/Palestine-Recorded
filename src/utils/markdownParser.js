export const renderMarkdown = (text) => {
  // Split by line breaks to preserve them
  const lines = text.split("\n");

  return lines.map((line, idx) => {
    // Handle bold text
    const boldRegex = /\*\*(.+?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: line.substring(lastIndex, match.index) });
      }
      // Add bold text
      parts.push({ type: "bold", content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push({ type: "text", content: line.substring(lastIndex) });
    }

    // If no bold found, just return the line
    if (parts.length === 0) {
      return (
        <div key={idx} className="text-sm leading-relaxed">
          {line || <br />}
        </div>
      );
    }

    return (
      <div key={idx} className="text-sm leading-relaxed">
        {parts.map((part, partIdx) =>
          part.type === "bold" ? (
            <strong key={partIdx} className="font-semibold text-white">
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
