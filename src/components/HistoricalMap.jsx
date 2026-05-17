import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

const SHEETS = [
  { label: "Sheet 1", url: "/maps/sheet1.jpg", imageWidth: 13315, imageHeight: 13248 },
  { label: "Sheet 2", url: "/maps/sheet2.jpg", imageWidth: 13777, imageHeight: 12283 },
  { label: "Sheet 3", url: "/maps/sheet3.jpg", imageWidth: 13343, imageHeight: 15074 },
];

export default function HistoricalMap() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = SHEETS[activeIndex];

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const overlayRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      const iconRetinaUrl = (await import("leaflet/dist/images/marker-icon-2x.png")).default;
      const iconUrl       = (await import("leaflet/dist/images/marker-icon.png")).default;
      const shadowUrl     = (await import("leaflet/dist/images/marker-shadow.png")).default;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

      if (cancelled || !mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current, {
        crs: L.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInstance.current = map;

      const { url, imageWidth, imageHeight } = SHEETS[0];
      const bounds = [[0, 0], [imageHeight / 10, imageWidth / 10]];

      overlayRef.current = L.imageOverlay(url, bounds, { opacity: 1 }).addTo(map);
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
        overlayRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;

    setSwitching(true);

    const { url, imageWidth, imageHeight } = active;
    const bounds = [[0, 0], [imageHeight / 10, imageWidth / 10]];

    // Preload the image first, then swap
    const img = new Image();
    img.src = url;
    img.onload = () => {
      overlay.setUrl(url);
      overlay.setBounds(bounds);
      map.fitBounds(bounds, { padding: [20, 20], animate: true });
      setSwitching(false);
    };
    img.onerror = () => {
      // Still swap even if preload fails
      overlay.setUrl(url);
      overlay.setBounds(bounds);
      map.fitBounds(bounds, { padding: [20, 20], animate: true });
      setSwitching(false);
    };
  }, [activeIndex]);

  const showOverlay = loading || switching;

  return (
    <div className="relative flex w-full h-screen overflow-hidden">

      <div
        ref={mapRef}
        className="flex-1 h-full z-0"
        style={{ background: "#1a1a1a" }}
      />

      <aside className="relative z-10 flex flex-col justify-center gap-3 w-52 shrink-0 h-full px-4 bg-background/80 backdrop-blur-sm border-l border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
          Map Sheets
        </p>

        {SHEETS.map((sheet, i) => (
          <button
            key={i}
            onClick={() => !switching && setActiveIndex(i)}
            className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl border text-left transition-all ${
              i === activeIndex
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            } ${switching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="text-sm font-medium">{sheet.label}</span>
            <span className={`text-xs ${i === activeIndex ? "opacity-60" : "opacity-50"}`}>
              {sheet.imageWidth.toLocaleString()} × {sheet.imageHeight.toLocaleString()}
            </span>
          </button>
        ))}
      </aside>

      {showOverlay && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
          <span className="text-sm text-muted-foreground">
            {switching ? `Loading ${active.label}…` : "Loading map…"}
          </span>
        </div>
      )}
    </div>
  );
}