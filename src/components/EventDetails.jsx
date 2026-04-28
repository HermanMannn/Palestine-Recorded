function getStatusClass(status) {
  switch (status) {
    case "Ongoing":
      return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
    case "Concluded":
      return "bg-red-500/20 text-red-700 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getCategoryClass(category) {
  switch (category) {
    case "Military":
      return "bg-red-600/20 text-red-700 dark:text-red-400";
    case "Political":
      return "bg-orange-400/20 text-orange-700 dark:text-orange-400";
    case "Diplomatic":
      return "bg-blue-400/20 text-blue-700 dark:text-blue-400";
    case "Social":
      return "bg-sky-400/20 text-sky-700 dark:text-sky-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getTagClass(tag) {
  if (tag === "High Impact") return "bg-red-500/20 text-red-700 dark:text-red-400";
  if (tag === "Regional") return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (tag === "Local") return "bg-green-600/20 text-green-700 dark:text-green-400";
  if (tag === "National") return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
  if (tag === "Conflict") return "bg-amber-700/20 text-amber-800 dark:text-amber-500";
  if (tag === "Reform") return "bg-pink-400/20 text-pink-700 dark:text-pink-400";
  if (tag === "Revolution") return "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400";
  if (tag === "Crisis") return "bg-purple-500/20 text-purple-700 dark:text-purple-400";
  return "bg-muted text-muted-foreground";
}

export default function EventDetails({ event, onClose }) {
  return (
    <aside className="absolute top-0 left-0 z-20 h-full w-96 max-w-full overflow-y-auto bg-card/95 backdrop-blur-md border-r border-border shadow-2xl animate-in slide-in-from-left duration-200">
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground leading-tight">
          {event.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {event.image && (
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-44 object-cover border-b border-border"
        />
      )}

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getCategoryClass(event.category)}`}>
            {event.category}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusClass(event.status)}`}>
            {event.status}
          </span>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
          <span className="text-muted-foreground">Location</span>
          <span className="text-foreground">{event.location}</span>

          <span className="text-muted-foreground">Start</span>
          <span className="text-foreground">{event.startDate}</span>

          <span className="text-muted-foreground">End</span>
          <span className="text-foreground">{event.endDate}</span>
        </div>

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs font-medium px-2 py-0.5 rounded ${getTagClass(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Description
          </h3>
          <p className="text-sm text-foreground leading-relaxed">
            {event.description}
          </p>
        </div>

        {event.articles?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Related Articles
            </h3>
            <ul className="space-y-1.5">
              {event.articles.map((article) => (
                <li key={article.url}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-1.5 text-sm text-primary hover:underline"
                  >
                    <svg
                      className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-70 group-hover:opacity-100"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span className="leading-snug">{article.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
