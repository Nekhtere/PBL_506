"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
// Leaflet's stylesheet is imported globally in app/layout.tsx, not here. Importing it
// from this lazily-loaded module makes Next emit a separate CSS chunk for it, and that
// chunk 404s when the map mounts.

export type MapPoint = {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  label: string;
  photo?: string;
  km?: number;
};

// Same glyphs as the category chips across the page — one vocabulary for a
// category wherever it appears. Unknown categories fall back to a generic pin.
const CATEGORY_GLYPH: Record<string, string> = {
  Nature: "🌿",
  Culture: "🛕",
  Family: "👨‍👩‍👧",
  Shopping: "🛍️",
  Souvenir: "🎁",
  Wellness: "💆",
};

export default function NearbyMap({ points, user, onSelect }: {
  points: MapPoint[];
  user: { lat: number; lng: number };
  onSelect: (id: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  // Read inside the click handler without re-binding every marker on each render.
  // Synced in an effect, not during render — writing a ref while rendering is a
  // side effect and React's linter (rightly) rejects it.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Create the map once. Leaflet owns the DOM node, so it must never be re-created
  // on a re-render — only the layer contents get refreshed below.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false });
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Default Leaflet marker icons are resolved from CSS relative URLs that bundlers
    // rewrite, so they 404. A divIcon with inline markup sidesteps that entirely.
    // Bare glyph, no disc: reads as a sticker dropped on the map rather than a generic
    // blue pin. The drop-shadow is what keeps an emoji legible over pale roads and dark
    // tiles alike — without it the outline dissolves into the basemap.
    // ponytail: emoji, not PNG art. Swap for L.icon({iconUrl}) if brand pins are drawn.
    const pin = (glyph: string, size = 38) =>
      L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.85)}px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))">${glyph}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

    // Location dot, not a category pin — a filled circle reads as "you" instantly.
    // This markup is injected into the document, so it can read the CSS tokens
    // directly. `--fg` for the dot, `--surface` for the ring that separates it
    // from whatever the tile underneath happens to be.
    L.marker([user.lat, user.lng], {
      icon: L.divIcon({
        className: "",
        html: `<div style="background:var(--fg);width:20px;height:20px;border-radius:9999px;border:3px solid var(--surface);box-shadow:0 0 0 3px rgba(29,29,31,.25),0 2px 8px rgba(0,0,0,.4)"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
      zIndexOffset: 1000,
    })
      .addTo(layer)
      .bindPopup("You are here");

    points.forEach((p) => {
      L.marker([p.lat, p.lng], { icon: pin(CATEGORY_GLYPH[p.category] ?? "📍") })
        .addTo(layer)
        .bindPopup(
          `<strong>${p.name}</strong><br>${p.label}${p.km != null ? `<br>${p.km.toFixed(1)} km away` : ""}`,
        )
        .on("click", () => onSelectRef.current(p.id));
    });

    // Fit every pin plus the user; pad so the popups have room.
    map.fitBounds(
      L.latLngBounds([[user.lat, user.lng], ...points.map((p) => [p.lat, p.lng] as [number, number])]),
      { padding: [40, 40], maxZoom: 14 },
    );
  }, [points, user]);

  return <div ref={containerRef} className="w-full h-full" aria-label="Map of nearby deals" />;
}