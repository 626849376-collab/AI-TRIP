"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { DESTINATION_COORDS } from "@/services/travel-data";
import { MapPin, Navigation, Loader2, AlertCircle, ExternalLink } from "lucide-react";

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
    const [isLoading, setIsLoading] = useState(true);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    const [mapUrl, setMapUrl] = useState<string>("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get destination coordinates
    const destCoords = useMemo(() => {
        return DESTINATION_COORDS[destination] || FALLBACK_COORDS[destination] || { lat: 35.6762, lng: 139.6503 };
    }, [destination]);

    // Collect all valid activity coordinates
    const activityCoords = useMemo(() => {
        return activities
            .filter((a) => a.lat && a.lng)
            .map((a) => ({
                name: a.name,
                lat: a.lat!,
                lng: a.lng!,
                time: a.time,
            }));
    }, [activities]);

    // Build map URL
    useEffect(() => {
        const centerLat = destCoords.lat;
        const centerLng = destCoords.lng;

        const padding = 0.05;
        const bbox = `${centerLng - padding},${centerLat - padding},${centerLng + padding},${centerLat + padding}`;

        // Use OpenStreetMap embed with proper marker format
        const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${centerLat},${centerLng}`;
        setMapUrl(url);

        // Set a timeout to stop showing loading spinner after 5 seconds
        // This handles cases where the iframe onLoad event doesn't fire
        timeoutRef.current = setTimeout(() => {
            setIsLoading(false);
            setIframeLoaded(true);
        }, 5000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [destCoords.lat, destCoords.lng, destination]);

    // Open in full map view
    const openInMaps = useCallback(() => {
        const url = `https://www.openstreetmap.org/?mlat=${destCoords.lat}&mlon=${destCoords.lng}#map=14/${destCoords.lat}/${destCoords.lng}`;
        window.open(url, "_blank");
    }, [destCoords.lat, destCoords.lng]);

    // Open Google Maps directions
    const openGoogleMaps = useCallback(() => {
        const origin = `${destCoords.lat},${destCoords.lng}`;
        const destinations = activityCoords
            .map((c) => `${c.lat},${c.lng}`)
            .join("/");
        const url = `https://www.google.com/maps/dir/${origin}/${destinations}`;
        window.open(url, "_blank");
    }, [destCoords.lat, destCoords.lng, activityCoords]);

    const handleIframeLoad = () => {
        setIframeLoaded(true);
        setIsLoading(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const handleIframeError = () => {
        setIframeLoaded(true);
        setIsLoading(false);
        setIframeError(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">加载地图中...</p>
            </div>
        );
    }

    if (iframeError) {
        return (
            <div className="space-y-3">
                <div className="bg-amber-50 rounded-lg p-6 text-center border border-amber-200">
                    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-amber-800 mb-2">地图加载失败</p>
                    <p className="text-xs text-amber-600 mb-4">可能是网络限制导致地图无法加载，你可以通过以下方式查看位置：</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                            onClick={openInMaps}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm touch-target"
                        >
                            <ExternalLink className="w-4 h-4" />
                            在OpenStreetMap中查看
                        </button>
                        {activityCoords.length > 0 && (
                            <button
                                onClick={openGoogleMaps}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm touch-target"
                            >
                                <Navigation className="w-4 h-4" />
                                在Google Maps中导航
                            </button>
                        )}
                    </div>
                </div>
                {activityCoords.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            行程路线（共 {activityCoords.length} 个地点）
                        </p>
                        <div className="space-y-1.5">
                            {activityCoords.map((coord, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-[10px] flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="truncate">{coord.name}</span>
                                    {coord.time && (
                                        <span className="text-gray-400 flex-shrink-0 ml-auto">{coord.time}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
                    {!iframeLoaded && (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        </div>
                    )}
                    {mapUrl && (
                        <iframe
                            src={mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
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
                        <MapPin className="w-4 h-4 text-indigo-600" />
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
                            <MapPin className="w-3 h-3 text-indigo-500" />
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
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-[10px] flex-shrink-0">
                                    {i + 1}
                                </span>
                                <span className="truncate">{coord.name}</span>
                                {coord.time && (
                                    <span className="text-gray-400 flex-shrink-0 ml-auto">{coord.time}</span>
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