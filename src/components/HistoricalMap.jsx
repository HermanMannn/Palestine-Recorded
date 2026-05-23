import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

// 1. ADDED MARGINS: You will need to adjust these pixel values for each sheet 
// to perfectly crop out the legends and white paper borders.
const SHEETS = [
  { 
    label: "Sheet 1", 
    tileUrl: "/tiles/sheet1", 
    imageWidth: 13315, 
    imageHeight: 13248,
    margins: { top: 800, right: 800, bottom: 1200, left: 800 } 
  },
  { 
    label: "Sheet 2", 
    tileUrl: "/tiles/sheet2", 
    imageWidth: 13777, 
    imageHeight: 12283,
    margins: { top: 800, right: 800, bottom: 1200, left: 800 }
  },
  { 
    label: "Sheet 3", 
    tileUrl: "/tiles/sheet3", 
    imageWidth: 13343, 
    imageHeight: 15074,
    margins: { top: 800, right: 800, bottom: 2500, left: 800 } // Example: larger bottom margin for the legend
  },
];

const TILE_SIZE = 256;
// Slightly adjusted fit options so it doesn't force you out of the new tight bounds
const FIT_OPTS = { paddingTopLeft: [0, 0], paddingBottomRight: [200, 0] };

function getMaxNativeZoom(w, h) {
  return Math.ceil(Math.log2(Math.max(w, h) / TILE_SIZE));
}

// 2. UPDATED BOUNDS CALCULATION: Now factor in the margins to shrink the viewable area
function getSheetBounds(L, map, sheet) {
  const z = getMaxNativeZoom(sheet.imageWidth, sheet.imageHeight);
  const m = sheet.margins || { top: 0, right: 0, bottom: 0, left: 0 };
  
  // Calculate new corners based on the cropped pixel values
  const sw = map.unproject([m.left, sheet.imageHeight - m.bottom], z);
  const ne = map.unproject([sheet.imageWidth - m.right, m.top], z);
  
  return L.latLngBounds(sw, ne);
}

export default function HistoricalMap() {
  const [activeIndex, setActiveIndex] = useState(0);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const tileLayerRef = useRef(null);
  const leafletRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;

      if (cancelled || !mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current, {
        crs: L.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
        minZoom: -2,
        maxZoom: 8,
        maxBoundsViscosity: 1.0, // This keeps the map strictly inside the bounds
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
        bounceAtZoomLimits: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInstance.current = map;

      const sheet = SHEETS[0];
      const bounds = getSheetBounds(L, map, sheet);
      const maxNativeZoom = getMaxNativeZoom(sheet.imageWidth, sheet.imageHeight);

      tileLayerRef.current = L.tileLayer(`${sheet.tileUrl}/{z}/{y}/{x}.jpg`, {
        tileSize: TILE_SIZE,
        maxNativeZoom,
        maxZoom: maxNativeZoom + 2,
        minZoom: -2,
        bounds, 
        noWrap: true,
        keepBuffer: 2,
      }).addTo(map);

      // 3. REMOVED EXTRA PADDING: Lock the map strictly to the cropped bounds
      map.setMaxBounds(bounds);

      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(bounds, FIT_OPTS);
        if (!cancelled) setLoading(false);
      }, 0);
    })();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        tileLayerRef.current = null;
        leafletRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    const sheet = SHEETS[activeIndex];
    const bounds = getSheetBounds(L, map, sheet);
    const maxNativeZoom = getMaxNativeZoom(sheet.imageWidth, sheet.imageHeight);

    if (tileLayerRef.current) tileLayerRef.current.remove();

    tileLayerRef.current = L.tileLayer(`${sheet.tileUrl}/{z}/{y}/{x}.jpg`, {
      tileSize: TILE_SIZE,
      maxNativeZoom,
      maxZoom: maxNativeZoom + 2,
      minZoom: -2,
      bounds, 
      noWrap: true,
      keepBuffer: 2,
    }).addTo(map);

    // 3. REMOVED EXTRA PADDING: Lock the map strictly to the cropped bounds
    map.setMaxBounds(bounds);

    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds, FIT_OPTS);
    }, 0);
  }, [activeIndex]);

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
            onClick={() => setActiveIndex(i)}
            className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl border text-left transition-all ${
              i === activeIndex
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            <span className="text-sm font-medium">{sheet.label}</span>
            <span className={`text-xs ${i === activeIndex ? "opacity-60" : "opacity-50"}`}>
              {sheet.imageWidth.toLocaleString()} × {sheet.imageHeight.toLocaleString()}
            </span>
          </button>
        ))}
      </aside>

      {loading && (
        <div className="absolute inset-0 z-2 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
          <span className="text-sm text-muted-foreground">Loading map…</span>
        </div>
      )}
    </div>
  );
}