import { Link } from "@tanstack/react-router";

export default function HistoricalMap() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-2xl font-semibold">Palestine Record Maps</h1>
      <div className="flex gap-4">
        {[1, 2, 3].map((n) => (
          <Link
            key={n}
            to={`/maps/sheet${n}`}
            className="px-8 py-6 rounded-xl border border-border hover:bg-accent transition-colors text-center"
          >
            <p className="font-medium">Sheet {n}</p>
            <p className="text-sm text-muted-foreground mt-1">Open map</p>
          </Link>
        ))}
      </div>
    </div>
  );
}