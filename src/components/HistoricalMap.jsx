import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { mapEvents } from "../lib/mapEvents";

export default function HistoricalMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let map;
    let unsub;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      // Expose Leaflet globally so the maplibre-gl-leaflet plugin can attach to it.
      if (typeof window !== "undefined") window.L = L;
      await import("maplibre-gl");
      await import("@maplibre/maplibre-gl-leaflet");

      // Fix Leaflet's default marker icon paths (broken under Vite bundling).
      const iconRetinaUrl = (await import("leaflet/dist/images/marker-icon-2x.png")).default;
      const iconUrl = (await import("leaflet/dist/images/marker-icon.png")).default;
      const shadowUrl = (await import("leaflet/dist/images/marker-shadow.png")).default;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

      if (cancelled || !mapRef.current || mapInstance.current) return;

      map = L.map(mapRef.current, {
        center: [31.5, 35.0],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
      });

      if (typeof L.maplibreGL === "function") {
        const glLayer = L.maplibreGL({
          style: "https://tiles.openfreemap.org/styles/liberty",
          attribution:
            '© <a href="https://openfreemap.org">OpenFreeMap</a> © OpenStreetMap',
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
            // Hide any country-level label layer.
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
        // Fallback to raster tiles if the GL plugin failed to attach.
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(map);
      }

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);
      mapInstance.current = map;

      // Ensure Leaflet measures the container correctly after mount.
      setTimeout(() => {
        map.invalidateSize();
        if (!cancelled) setLoading(false);
      }, 0);

      let marker = null;
      let circle = null;

      unsub = mapEvents.subscribe(({ lat, lng, zoom }) => {
        map.flyTo([lat, lng], zoom ?? 11, { duration: 1.5 });

        if (marker) marker.remove();
        if (circle) circle.remove();

        marker = L.marker([lat, lng]).addTo(map);
        circle = L.circle([lat, lng], {
          radius: 4000, // 4 km
          color: "#ef4444",
          weight: 1,
          fillColor: "#ef4444",
          fillOpacity: 0.25,
        }).addTo(map);
      });
    })();

    return () => {
      cancelled = true;
      if (unsub) unsub();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <>
      <div
        ref={mapRef}
        className="absolute inset-0 z-0"
        style={{ width: "100%", height: "100%" }}
      />
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      )}
    </>
  );
}
