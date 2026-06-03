"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Activity } from "@/types";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

// Fix Leaflet default icon issue
const fixLeafletIcon = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
};

interface RouteMapProps {
    activities: Activity[];
    destination: string;
    dayNumber: number;
}

export default function RouteMap({ activities, destination, dayNumber }: RouteMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const initializedRef = useRef(false);
    const { language } = useLanguageStore();
    const t = translations[language];

    useEffect(() => {
        if (!mapRef.current || initializedRef.current) return;

        const container = mapRef.current;

        // Wait for container to be visible with a valid size
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            const timer = setTimeout(() => {
                initializedRef.current = false;
            }, 50);
            return () => clearTimeout(timer);
        }

        fixLeafletIcon();

        // Filter activities with coordinates
        const validActivities = activities.filter((a) => a.lat && a.lng);
        if (validActivities.length === 0) return;

        // Calculate center point
        const centerLat = validActivities.reduce((sum, a) => sum + (a.lat || 0), 0) / validActivities.length;
        const centerLng = validActivities.reduce((sum, a) => sum + (a.lng || 0), 0) / validActivities.length;

        // Initialize map
        const map = L.map(container, {
            center: [centerLat, centerLng],
            zoom: 14,
            zoomControl: true,
            scrollWheelZoom: true,
        });

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        // Invalidate size after map is rendered to fix _leaflet_pos issue
        requestAnimationFrame(() => {
            map.invalidateSize();
        });

        // Create custom marker icons for different times
        const createIcon = (color: string, label: string) => {
            return L.divIcon({
                className: "custom-marker",
                html: `<div style="
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, ${color}, ${color}dd);
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 11px;
                    font-weight: bold;
                    cursor: pointer;
                ">${label}</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
            });
        };

        const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

        // Add markers for each activity
        const markers: L.Marker[] = [];
        validActivities.forEach((activity, index) => {
            const color = colors[index % colors.length];
            const label = activity.time?.split(":")[0] || `${index + 1}`;
            const icon = createIcon(color, label);

            const marker = L.marker([activity.lat!, activity.lng!], { icon })
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #059669;">
                            ${activity.time} - ${activity.name}
                        </div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                            ${activity.description}
                        </div>
                        <div style="font-size: 12px; color: #888;">
                            📍 ${activity.location || destination}
                        </div>
                        <div style="font-size: 12px; color: #059669; font-weight: 500; margin-top: 4px;">
                            💰 ¥${activity.cost}
                        </div>
                    </div>
                `);

            markers.push(marker);
        });

        // Fetch real road route from OSRM API
        const fetchRoute = async () => {
            const coordinates = validActivities.map((a) => `${a.lng},${a.lat}`).join(";");
            try {
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
                );
                const data = await response.json();
                if (data.code === "Ok" && data.routes.length > 0) {
                    const routeCoords = data.routes[0].geometry.coordinates.map(
                        (coord: number[]) => [coord[1], coord[0]] as [number, number]
                    );
                    L.polyline(routeCoords, {
                        color: "#10b981",
                        weight: 4,
                        opacity: 0.8,
                    }).addTo(map);
                } else {
                    // Fallback to straight line if routing fails
                    const latlngs = validActivities.map((a) => [a.lat!, a.lng!] as [number, number]);
                    L.polyline(latlngs, {
                        color: "#10b981",
                        weight: 3,
                        opacity: 0.6,
                        dashArray: "10, 10",
                    }).addTo(map);
                }
            } catch {
                // Fallback to straight line on error
                const latlngs = validActivities.map((a) => [a.lat!, a.lng!] as [number, number]);
                L.polyline(latlngs, {
                    color: "#10b981",
                    weight: 3,
                    opacity: 0.6,
                    dashArray: "10, 10",
                }).addTo(map);
            }
        };
        fetchRoute();

        // Add start and end markers
        if (validActivities.length > 1) {
            const first = validActivities[0];
            const last = validActivities[validActivities.length - 1];

            L.circleMarker([first.lat!, first.lng!], {
                radius: 8,
                fillColor: "#10b981",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 1,
            }).addTo(map).bindTooltip(t.routeMap.start, { permanent: false });

            L.circleMarker([last.lat!, last.lng!], {
                radius: 8,
                fillColor: "#ef4444",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 1,
            }).addTo(map).bindTooltip(t.routeMap.end, { permanent: false });
        }

        // Fit map to show all markers
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.2));
        }

        mapInstanceRef.current = map;
        initializedRef.current = true;

        // Use ResizeObserver to handle container size changes
        const resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        });
        resizeObserver.observe(container);

        // Cleanup on unmount
        return () => {
            resizeObserver.disconnect();
            map.remove();
            mapInstanceRef.current = null;
            initializedRef.current = false;
        };
    }, [activities, destination, dayNumber]);

    const validCount = activities.filter((a) => a.lat && a.lng).length;

    if (validCount === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-sm">{t.routeMap.noData}</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">
                        {t.routeMap.dayRoute.replace("{day}", String(dayNumber))}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/80">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-white inline-block" />
                        {t.routeMap.spots.replace("{count}", String(validCount))}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-4 h-0.5 bg-white/60 inline-block" />
                        {t.routeMap.route}
                    </span>
                </div>
            </div>
            <div
                ref={mapRef}
                className="w-full"
                style={{ height: "350px" }}
            />
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                    {activities.filter((a) => a.lat && a.lng).map((activity, index) => {
                        const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-red-500", "bg-purple-500"];
                        return (
                            <span
                                key={index}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white ${colors[index % colors.length]}`}
                            >
                                <span>{activity.time}</span>
                                <span className="opacity-70">-</span>
                                <span className="truncate max-w-[80px]">{activity.name}</span>
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
