import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { useNavigate } from "@tanstack/react-router";
import type { Helper } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = L.divIcon({
  className: "",
  html: '<div style="position:relative;"><div style="position:absolute;inset:-10px;border-radius:9999px;background:rgba(59,130,246,0.35);animation:ping 1.5s ease-out infinite"></div><div style="position:relative;width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const verifiedIcon = L.divIcon({
  className: "",
  html: '<div style="width:28px;height:28px;border-radius:9999px;background:#F8C7A4;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);font-size:14px;">💛</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const helperIcon = L.divIcon({
  className: "",
  html: '<div style="width:26px;height:26px;border-radius:9999px;background:#ffffff;border:3px solid #F8C7A4;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.22);font-size:13px;">👤</div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

L.Marker.prototype.options.icon = helperIcon;

const DEFAULT_CENTER: [number, number] = [51.4556, 7.0116]; // Essen

// Rough fallback coords per city so legacy helpers without lat/lng still show.
const CITY_COORDS: Record<string, [number, number]> = {
  "Essen": [51.4556, 7.0116],
  "Bochum": [51.4818, 7.2162],
  "Duisburg": [51.4344, 6.7623],
  "Mülheim an der Ruhr": [51.4318, 6.8807],
  "Gelsenkirchen": [51.5177, 7.0857],
  "Oberhausen": [51.4964, 6.8628],
  "Düsseldorf": [51.2277, 6.7735],
  "Wuppertal": [51.2562, 7.1508],
  "Köln": [50.9375, 6.9603],
};

function coordsFor(h: Helper, i: number): [number, number] {
  if (typeof h.latitude === "number" && typeof h.longitude === "number") {
    return [h.latitude, h.longitude];
  }
  const base = CITY_COORDS[h.city] ?? DEFAULT_CENTER;
  // Fan out helpers on same city so markers don't stack.
  const angle = (i * 137.5) % 360;
  const r = 0.008;
  return [
    base[0] + Math.sin((angle * Math.PI) / 180) * r,
    base[1] + Math.cos((angle * Math.PI) / 180) * r,
  ];
}

export function HelpersMap({ helpers }: { helpers: Helper[] }) {
  const navigate = useNavigate();
  const { ensureMatch } = useStore();
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "prompt" | "granted" | "denied">("idle");

  const withCoords = useMemo(
    () => helpers.map((h, i) => ({ helper: h, pos: coordsFor(h, i) })),
    [helpers],
  );

  const requestLocation = () => {
    if (!navigator.geolocation) { setGeoStatus("denied"); return; }
    setGeoStatus("prompt");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openChat = (helperId: string) => {
    const m = ensureMatch(helperId);
    navigate({ to: "/family/messages/$id", params: { id: m.helperId } });
  };

  useEffect(() => {
    const element = mapElementRef.current;
    if (!element || mapRef.current) return;

    const map = L.map(element, {
      center: userPos ?? DEFAULT_CENTER,
      zoom: userPos ? 12 : 10,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markerLayer = L.layerGroup().addTo(map);

    if (userPos) {
      map.flyTo(userPos, 12, { duration: 1.2 });
      L.marker(userPos, { icon: userIcon }).bindPopup("Dein Standort").addTo(markerLayer);
    }

    withCoords.forEach(({ helper, pos }) => {
      const icon = helper.verified ? verifiedIcon : helperIcon;
      const popupHtml = `
        <div class="min-w-[220px]">
          <div class="flex items-start gap-2">
            <img src="${helper.photo}" alt="" class="h-11 w-11 rounded-full object-cover" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1">
                <div class="truncate text-sm font-extrabold">${helper.name}</div>
                ${helper.verified ? '<span title="Verifiziert">✓</span>' : ""}
              </div>
              <div class="text-xs text-muted-foreground">${helper.age} Jahre · ${helper.city}</div>
            </div>
          </div>
          <div class="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-foreground/80">
            <span>★ ${helper.rating}</span>
            <span>${helper.pricePerHour}€/Std</span>
            <span>${helper.distanceKm} km</span>
          </div>
          <div class="mt-1 text-[11px] text-muted-foreground">Sprachen: ${helper.languages.slice(0, 3).join(", ")}</div>
          <div class="mt-2 flex gap-1.5">
            <a href="/helper/${encodeURIComponent(helper.id)}/cv" class="flex-1 cursor-pointer rounded-full border border-border bg-card px-2 py-1 text-center text-[11px] font-bold no-underline text-foreground hover:bg-muted">Profil</a>
            <button type="button" data-helper-chat="${helper.id}" class="flex-1 cursor-pointer rounded-full bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground hover:opacity-90">Chat</button>
          </div>
        </div>`;

      const marker = L.marker(pos, { icon }).bindPopup(popupHtml).addTo(markerLayer);
      marker.on("popupopen", (event) => {
        const popupEl = event.popup.getElement();
        const chatButton = popupEl?.querySelector<HTMLButtonElement>(`[data-helper-chat="${helper.id}"]`);
        chatButton?.addEventListener("click", () => openChat(helper.id), { once: true });
      });
    });

    if (!userPos && withCoords.length > 0) {
      const bounds = L.latLngBounds(withCoords.map(({ pos }) => pos));
      map.fitBounds(bounds.pad(0.2), { maxZoom: 11 });
    }

    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      markerLayer.remove();
    };
  }, [userPos, withCoords, navigate, ensureMatch]);

  return (
    <div className="space-y-3">
      <div className="relative h-[520px] overflow-hidden rounded-3xl border border-border shadow-card">
        <div ref={mapElementRef} className="h-full w-full" />
      </div>
      {geoStatus === "denied" && (
        <button
          onClick={requestLocation}
          className="w-full rounded-2xl bg-card p-3 text-xs text-muted-foreground shadow-card hover:bg-muted"
        >
          Standort konnte nicht ermittelt werden. Erneut versuchen?
        </button>
      )}
      {geoStatus === "prompt" && (
        <div className="rounded-2xl bg-card p-3 text-center text-xs text-muted-foreground shadow-card">
          Bitte Standortfreigabe im Browser bestätigen…
        </div>
      )}
    </div>
  );
}

export default HelpersMap;
