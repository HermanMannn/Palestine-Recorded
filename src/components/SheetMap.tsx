import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import "leaflet/dist/leaflet.css";

interface Props {
  url: string;
  label: string;
  imageWidth: number;
  imageHeight: number;
}

const SHEETS = [
  { label: "Sheet 1", to: "/maps/sheet1" },
  { label: "Sheet 2", to: "/maps/sheet2" },
  { label: "Sheet 3", to: "/maps/sheet3" },
];

export default function SheetMap({ url, label, imageWidth, imageHeight }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let map: any;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      const iconRetinaUrl = (await import("leaflet/dist/images/marker-icon-2x.png")).default;
      const iconUrl       = (await import("leaflet/dist/images/marker-icon.png")).default;
      const shadowUrl     = (await import("leaflet/dist/images/marker-shadow.png")).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

      if (cancelled || !mapRef.current || mapInstance.current) return;

      map = L.map(mapRef.current, {
        crs: L.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInstance.current = map;

      const bounds: [[number, number], [number, number]] = [
        [0, 0],
        [imageHeight / 10, imageWidth / 10],
      ];

      L.imageOverlay(url, bounds, { opacity: 1 }).addTo(map);
      map.fitBounds(bounds, { padding: [20, 20] });

      setTimeout(() => {
        map.invalidateSize();
        if (!cancelled) setLoading(false);
      }, 0);
    })();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [url, imageWidth, imageHeight]);

  return (
    <div className="relative w-full h-screen">
      {/* Tab switcher */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-background/80 backdrop-blur-sm border border-border rounded-xl p-1">
        {SHEETS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
              s.label === label
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div
        ref={mapRef}
        className="absolute inset-0 z-0"
        style={{ background: "#1a1a1a" }}
      />

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
          <span className="text-sm text-muted-foreground">Loading map…</span>
        </div>
      )}
    </div>
  );
}