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

        L.control.zoom({ position: "topright" }).addTo(map);
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

        // --- Diaspora origin pins (localStorage) ---
        const STORAGE_KEY = "diasporaPins";
        const loadPins = () => {
          try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
          catch { return []; }
        };
        const savePins = (pins) => localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));

        const escapeHtml = (s = "") =>
          s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

        const pinIcon = L.divIcon({
          className: "diaspora-pin",
          html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))">📍</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 26],
          popupAnchor: [0, -24],
        });

        const renderPinPopup = (pin) => `
          <div style="min-width:200px;max-width:260px">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px">${escapeHtml(pin.title)}</div>
            <div style="font-size:12px;color:#555;white-space:pre-wrap;margin-bottom:6px">${escapeHtml(pin.description || "")}</div>
            <div style="font-size:10px;color:#888;margin-bottom:6px">${new Date(pin.createdAt).toLocaleString()}</div>
            <button data-pin-delete="${pin.id}" style="font-size:11px;color:#ef4444;background:none;border:none;padding:0;cursor:pointer;text-decoration:underline">Delete pin</button>
          </div>`;

        const addPinMarker = (pin) => {
          const m = L.marker([pin.lat, pin.lng], { icon: pinIcon }).addTo(map);
          m.bindPopup(renderPinPopup(pin));
          m.on("popupopen", (e) => {
            const node = e.popup.getElement();
            const btn = node?.querySelector(`[data-pin-delete="${pin.id}"]`);
            if (btn) btn.onclick = () => {
              savePins(loadPins().filter((p) => p.id !== pin.id));
              m.remove();
            };
          });
          return m;
        };

        loadPins().forEach(addPinMarker);

        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          const formId = `pin-form-${Date.now()}`;
          const popup = L.popup({ closeButton: true, autoClose: true })
            .setLatLng([lat, lng])
            .setContent(`
              <div style="min-width:220px">
                <div style="font-weight:600;font-size:13px;margin-bottom:6px">Create a pin post here?</div>
                <div style="font-size:11px;color:#666;margin-bottom:8px">Pin a place tied to your family or story.</div>
                <div id="${formId}-prompt">
                  <button id="${formId}-yes" style="font-size:12px;background:#ef4444;color:#fff;border:none;border-radius:4px;padding:6px 10px;cursor:pointer;margin-right:6px">Yes, create</button>
                  <button id="${formId}-no" style="font-size:12px;background:#eee;color:#333;border:none;border-radius:4px;padding:6px 10px;cursor:pointer">Cancel</button>
                </div>
                <div id="${formId}-form" style="display:none">
                  <input id="${formId}-title" placeholder="Title (e.g. Jaffa, my grandparents' home)" style="width:100%;font-size:12px;padding:6px;border:1px solid #ccc;border-radius:4px;margin-bottom:6px;box-sizing:border-box" />
                  <textarea id="${formId}-desc" placeholder="Description, memory or story..." rows="3" style="width:100%;font-size:12px;padding:6px;border:1px solid #ccc;border-radius:4px;margin-bottom:6px;box-sizing:border-box;resize:vertical"></textarea>
                  <button id="${formId}-submit" style="font-size:12px;background:#ef4444;color:#fff;border:none;border-radius:4px;padding:6px 10px;cursor:pointer">Submit</button>
                </div>
              </div>
            `)
            .openOn(map);

          setTimeout(() => {
            const yes = document.getElementById(`${formId}-yes`);
            const no = document.getElementById(`${formId}-no`);
            const prompt = document.getElementById(`${formId}-prompt`);
            const form = document.getElementById(`${formId}-form`);
            const submit = document.getElementById(`${formId}-submit`);
            if (no) no.onclick = () => map.closePopup(popup);
            if (yes) yes.onclick = () => { prompt.style.display = "none"; form.style.display = "block"; document.getElementById(`${formId}-title`)?.focus(); };
            if (submit) submit.onclick = () => {
              const title = document.getElementById(`${formId}-title`).value.trim();
              const description = document.getElementById(`${formId}-desc`).value.trim();
              if (!title) return;
              const pin = { id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, lat, lng, title, description, createdAt: Date.now() };
              const pins = loadPins();
              pins.push(pin);
              savePins(pins);
              addPinMarker(pin).openPopup();
              map.closePopup(popup);
            };
          }, 0);
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

        L.control.zoom({ position: "topright" }).addTo(map);

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