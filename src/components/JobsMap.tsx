import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MessageCircle } from "lucide-react";
import type { Job } from "@/lib/mock-data";
import { jobPosterRoleLabel, jobThreadId } from "@/lib/job-utils";

// Fix default marker icons (Leaflet expects webpack-style asset resolution).
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

const jobIcon = L.divIcon({
  className: "",
  html: '<div style="width:28px;height:28px;border-radius:9999px;background:#F8C7A4;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);font-size:14px;">📍</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

L.Marker.prototype.options.icon = jobIcon;

const DEFAULT_CENTER: [number, number] = [51.4556, 7.0116]; // Essen

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center[0], center[1], zoom, map]);
  return null;
}

export function JobsMap({ jobs, helperId = "me-helper" }: { jobs: Job[]; helperId?: string }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "prompt" | "granted" | "denied">("idle");

  const jobsWithCoords = useMemo(
    () => jobs.filter((j) => typeof j.latitude === "number" && typeof j.longitude === "number"),
    [jobs],
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
    // Try immediately on mount – browser will show its own permission prompt.
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative h-[420px] overflow-hidden rounded-3xl border border-border shadow-card">
        <MapContainer
          center={userPos ?? DEFAULT_CENTER}
          zoom={userPos ? 12 : 10}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userPos && <FlyTo center={userPos} zoom={12} />}
          {userPos && (
            <Marker position={userPos} icon={userIcon}>
              <Popup>Dein Standort</Popup>
            </Marker>
          )}
          {jobsWithCoords.map((j) => (
            <Marker key={j.id} position={[j.latitude!, j.longitude!]} icon={jobIcon}>
              <Popup>
                <div className="min-w-[200px]">
                  <div className="text-sm font-extrabold leading-tight">{j.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {j.address}, {j.postalCode} {j.city}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">
                    {j.postedByName} · {jobPosterRoleLabel(j.postedBy)}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-semibold text-foreground/80">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(j.date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {j.time} · {j.durationHours} Std.
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-[color:var(--mint,#2f9e83)]">
                    {j.pricePerHour} €/Std
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Link
                      to="/helper/messages/$id"
                      params={{ id: jobThreadId(j.id, helperId) }}
                      className="inline-flex cursor-pointer items-center rounded-full border border-input bg-background px-3 py-1 text-xs font-bold text-foreground no-underline hover:bg-accent"
                    >
                      <MessageCircle className="mr-1 h-3 w-3" /> Chat
                    </Link>
                    <Link
                      to="/helper/jobs/$id"
                      params={{ id: j.id }}
                      className="inline-block cursor-pointer rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground no-underline hover:opacity-90"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
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

export default JobsMap;
