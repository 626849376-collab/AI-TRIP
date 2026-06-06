"use client";

import { useEffect, useRef, useState } from "react";
import { DESTINATION_COORDS } from "@/services/travel-data";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface Activity {
    name: string;
    description?: string;
    lat?: number;
    lng?: number;
    location?: string;
    time?: string;
}

interface RouteMapProps {
    activities: Activity[];
    destination: string;
    dayNumber: number;
}

// Fallback coordinates for destinations not in the data
const FALLBACK_COORDS: Record<string, { lat: number; lng: number }> = {
    "重庆": { lat: 29.5630, lng: 106.5516 },
    "武汉": { lat: 30.5928, lng: 114.3055 },
    "南京": { lat: 32.0603, lng: 118.7969 },
    "长沙": { lat: 28.2282, lng: 112.9388 },
    "厦门": { lat: 24.4798, lng: 118.0894 },
    "青岛": { lat: 36.0671, lng: 120.3826 },
    "昆明": { lat: 25.0389, lng: 102.7183 },
    "三亚": { lat: 18.2528, lng: 109.5120 },
};

export default function RouteMap({ activities, destination, dayNumber }: RouteMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapUrl, setMapUrl] = useState<string>("");

    // Get destination coordinates
    const destCoords = DESTINATION_COORDS[destination] || FALLBACK_COORDS[destination] || { lat: 35.6762, lng: 139.6503 };

    // Collect all valid activity coordinates
    const activityCoords = activities
        .filter((a) => a.lat && a.lng)
        .map((a) => ({
            name: a.name,
            lat: a.lat!,
            lng: a.lng!,
            time: a.time,
        }));

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Build the OpenStreetMap URL with markers
        const buildMapUrl = () => {
            const baseUrl = "https://www.openstreetmap.org/export/embed.html";
            const centerLat = destCoords.lat;
            const centerLng = destCoords.lng;

            // Calculate bounding box with padding
            const padding = 0.05;
            const bbox = `${centerLng - padding},${centerLat - padding},${centerLng + padding},${centerLat + padding}`;

            // Build marker layer URL
            let markerParams = "";
            if (activityCoords.length > 0) {
                markerParams = activityCoords
                    .map((coord, i) => `&marker=${i + 1}|${coord.lat},${coord.lng}`)
                    .join("");
            } else {
                // Add destination marker
                markerParams = `&marker=${destination}|${destCoords.lat},${destCoords.lng}`;
            }

            return `${baseUrl}?bbox=${bbox}&layer=mapnik${markerParams}`;
        };

        setMapUrl(buildMapUrl());
        setIsLoading(false);
    }, [activities, destination, destCoords.lat, destCoords.lng]);

    // Open in full map view
    const openInMaps = () => {
        const url = `https://www.openstreetmap.org/?mlat=${destCoords.lat}&mlon=${destCoords.lng}#map=14/${destCoords.lat}/${destCoords.lng}`;
        window.open(url, "_blank");
    };

    // Open Google Maps directions
    const openGoogleMaps = () => {
        const origin = `${destCoords.lat},${destCoords.lng}`;
        const destinations = activityCoords
            .map((c) => `${c.lat},${c.lng}`)
            .join("/");
        const url = `https://www.google.com/maps/dir/${origin}/${destinations}`;
        window.open(url, "_blank");
    };

    if (isLoading) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">加载地图中...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Map Container */}
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <div
                    ref={mapContainerRef}
                    className="w-full h-[250px] sm:h-[300px] bg-gray-100"
                >
                    {mapUrl && (
                        <iframe
                            src={mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`${destination} Day ${dayNumber} Map`}
                            className="rounded-lg"
                        />
                    )}
                </div>

                {/* Map overlay controls */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <button
                        onClick={openInMaps}
                        className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors icon-button"
                        title="在OpenStreetMap中查看"
                    >
                        <MapPin className="w-4 h-4 text-primary-600" />
                    </button>
                    {activityCoords.length > 0 && (
                        <button
                            onClick={openGoogleMaps}
                            className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors icon-button"
                            title="在Google Maps中导航"
                        >
                            <Navigation className="w-4 h-4 text-green-600" />
                        </button>
                    )}
                </div>

                {/* Destination label */}
                <div className="absolute bottom-2 left-2">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
                        <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary-500" />
                            {destination}
                        </p>
                    </div>
                </div>
            </div>

            {/* Activity markers legend */}
            {activityCoords.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        行程路线（共 {activityCoords.length} 个地点）
                    </p>
                    <div className="space-y-1.5">
                        {activityCoords.map((coord, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 text-xs text-gray-600"
                            >
                                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium text-[10px] flex-shrink-0">
                                    {i + 1}
                                </span>
                                <span className="truncate">{coord.name}</span>
                                {coord.time && (
                                    <span className="text-gray-400 flex-shrink-0 ml-auto">
                                        {coord.time}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No activities message */}
            {activityCoords.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-400">
                        暂无详细路线数据，点击地图图标在OpenStreetMap中查看{destination}位置
                    </p>
                </div>
            )}
        </div>
    );
}