import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { mapEvents } from "../lib/mapEvents";

// --- Historical Map Constants & Helpers ---
const SHEET = { tileUrl: "/tiles1/fullmap", imageWidth: 3851, imageHeight: 11353 };
const TILE_SIZE = 256;
const TILE_EXT = "jpg"; // change to "png" if your files are .png
const FIT_OPTS = { paddingTopLeft: [20, 20], paddingBottomRight: [20, 20] };

function getMaxNativeZoom(w, h) {
  return Math.ceil(Math.log2(Math.max(w, h) / TILE_SIZE));
}

function getImageBounds(L, w, h) {
  const z = getMaxNativeZoom(w, h);
  const scale = Math.pow(2, z);
  return L.latLngBounds(
    L.latLng(-h / scale, 0),
    L.latLng(0, w / scale)
  );
}

export default function HistoricalMap({ sidebarOpen, onToggleSidebar }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState("api");

  useEffect(() => {
    let map;
    let unsub;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const L = (await import("leaflet")).default;
      
      // Expose Leaflet globally so the maplibre-gl-leaflet plugin can attach to it.
      if (typeof window !== "undefined") window.L = L;
      
      // Only import MapLibre if we are in API mode
      if (mapMode === "api") {
        await import("maplibre-gl");
        await import("@maplibre/maplibre-gl-leaflet");
      }

      // Fix Leaflet's default marker icon paths (broken under Vite bundling).
      const iconRetinaUrl = (await import("leaflet/dist/images/marker-icon-2x.png")).default;
      const iconUrl = (await import("leaflet/dist/images/marker-icon.png")).default;
      const shadowUrl = (await import("leaflet/dist/images/marker-shadow.png")).default;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

      if (cancelled || !mapRef.current) return;

      // --- API MAP MODE ---
      if (mapMode === "api") {
        map = L.map(mapRef.current, {
          center: [31.5, 35.0],
          zoom: 8,
          zoomControl: false,
          attributionControl: false,
        });

        if (typeof L.maplibreGL === "function") {
          const glLayer = L.maplibreGL({
            style: "https://tiles.openfreemap.org/styles/liberty",
            attribution: '© <a href="https://openfreemap.org">OpenFreeMap</a> © OpenStreetMap',
          }).addTo(map);

          // Force English labels and hide country-name labels.
          const applyLabelRules = () => {
            const glMap = glLayer.getMaplibreMap?.();
            if (!glMap) return;
            const style = glMap.getStyle();
            if (!style?.layers) return;
            for (const layer of style.layers) {
              if (layer.type !== "symbol") continue;
              const id = layer.id.toLowerCase();
              if (id.includes("country")) {
                glMap.setLayoutProperty(layer.id, "visibility", "none");
                continue;
              }
              if (layer.layout?.["text-field"]) {
                glMap.setLayoutProperty(layer.id, "text-field", [
                  "coalesce",
                  ["get", "name:en"],
                  ["get", "name_en"],
                  ["get", "name:latin"],
                  ["get", "name"],
                ]);
              }
            }
          };
          
          const glMap = glLayer.getMaplibreMap?.();
          if (glMap) {
            if (glMap.isStyleLoaded()) applyLabelRules();
            else glMap.on("styledata", applyLabelRules);
          }
        } else {
          // Fallback to raster tiles
          L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
          }).addTo(map);
        }

        L.control.zoom({ position: "bottomright" }).addTo(map);
        L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);

        let marker = null;
        let circle = null;

        unsub = mapEvents.subscribe(({ lat, lng, zoom }) => {
          map.flyTo([lat, lng], zoom ?? 11, { duration: 1.5 });

          if (marker) marker.remove();
          if (circle) circle.remove();

          marker = L.marker([lat, lng]).addTo(map);
          circle = L.circle([lat, lng], {
            radius: 4000,
            color: "#ef4444",
            weight: 1,
            fillColor: "#ef4444",
            fillOpacity: 0.25,
          }).addTo(map);
        });

      // --- HISTORICAL MAP MODE ---
      } else {
        map = L.map(mapRef.current, {
          crs: L.CRS.Simple,
          zoomControl: false,
          attributionControl: false,
          minZoom: 3,
          maxZoom: 6,
          maxBoundsViscosity: 1.0,
          fadeAnimation: true,
          zoomAnimation: true,
          markerZoomAnimation: true,
          bounceAtZoomLimits: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        const { tileUrl, imageWidth, imageHeight } = SHEET;
        const maxNativeZoom = getMaxNativeZoom(imageWidth, imageHeight);
        const bounds = getImageBounds(L, imageWidth, imageHeight);

        L.tileLayer(`${tileUrl}/{z}/{y}/{x}.${TILE_EXT}`, {
          tileSize: TILE_SIZE,
          maxNativeZoom,
          maxZoom: maxNativeZoom + 2,
          noWrap: true,
        }).addTo(map);

        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();
        const extraRightSpace = (imageWidth / Math.pow(2, maxNativeZoom)) * 0.001;
        const newNorthEast = L.latLng(northEast.lat, northEast.lng + extraRightSpace);
        
        map.setMaxBounds(L.latLngBounds(southWest, newNorthEast));
        
        // Initial fit for historical map
        setTimeout(() => {
          map.fitBounds(bounds, FIT_OPTS);
        }, 0);
      }

      mapInstance.current = map;

      // Ensure Leaflet measures the container correctly after mount.
      setTimeout(() => {
        map.invalidateSize();
        if (!cancelled) setLoading(false);
      }, 50);

    })();

    // Cleanup function: runs when unmounting OR when `mapMode` changes
    return () => {
      cancelled = true;
      if (unsub) unsub();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mapMode]); // Crucial: Re-run the effect when mapMode changes

  return (
    <div className="relative flex w-full h-full overflow-hidden">

      {/* Dynamic CSS injection only needed for the historical map */}
      {mapMode === "historical" && (
        <style>{`
          .leaflet-tile-container img {
            width: 257px !important;
            height: 257px !important;
            margin-top: -0.5px !important;
            margin-left: -0.5px !important;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
          }
          .leaflet-container {
            background: transparent !important;
          }
        `}</style>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        className="flex-1 h-full z-0"
        style={{ background: mapMode === "historical" ? "#1a1a1a" : undefined }}
      />

      {/* Collapse/Expand Arrow (pushed by sidebar) */}
      <button
        onClick={onToggleSidebar}
        className="absolute top-1/2 -translate-y-1/2 z-40 p-3 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out"
        style={{
          left: sidebarOpen ? "292px" : "16px"
        }}
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 ease-in-out ${sidebarOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Map Mode Toggle (pushed by sidebar) */}
      <button
        onClick={() => setMapMode(mapMode === "api" ? "historical" : "api")}
        className="absolute top-4 z-40 transition-all duration-300 ease-in-out inline-flex items-center gap-1 p-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-sm hover:bg-card cursor-pointer"
        style={{
          left: sidebarOpen ? "292px" : "16px"
        }}
      >
        <span
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mapMode === "api"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-foreground/60"
          }`}
        >
          Live
        </span>
        <span
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mapMode === "historical"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-foreground/60"
          }`}
        >
          Historical
        </span>
      </button>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
          <span className="text-sm text-muted-foreground">Loading map...</span>
        </div>
      )}
    </div>
  );
}