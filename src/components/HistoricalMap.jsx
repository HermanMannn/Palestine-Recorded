import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

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

export default function HistoricalMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current, {
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
      mapInstance.current = map;

      const { tileUrl, imageWidth, imageHeight } = SHEET;
      const maxNativeZoom = getMaxNativeZoom(imageWidth, imageHeight);
      const bounds = getImageBounds(L, imageWidth, imageHeight);

      // FIX 1: Swapped {x} and {y} to match your file structure
      L.tileLayer(`${tileUrl}/{z}/{y}/{x}.${TILE_EXT}`, {
        tileSize: TILE_SIZE,
        maxNativeZoom,
        maxZoom: maxNativeZoom + 2,
        noWrap: true,
        
      }).addTo(map);

      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      // 2. Calculate a bit of extra space based on your map's width
      const extraRightSpace = (imageWidth / Math.pow(2, maxNativeZoom)) * 0.001; // Change 0.3 to push it even further

      // 3. Create a new Top-Right corner that is pushed further to the right (East)
      const newNorthEast = L.latLng(northEast.lat, northEast.lng + extraRightSpace);

    // 4. Set the new bounds
    map.setMaxBounds(L.latLngBounds(southWest, newNorthEast));

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
      }
    };
  }, []);

  return (
    <div className="relative flex w-full h-full overflow-hidden">
      
      {/* FIX 2: Added back the CSS injection to kill the white grid lines */}
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

      <div
        ref={mapRef}
        className="flex-1 h-full z-0"
        style={{ background: "#1a1a1a" }}
      />

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
          <span className="text-sm text-muted-foreground">Loading map…</span>
        </div>
      )}
    </div>
  );
}