"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="network-status offline" role="alert">
            <div className="flex items-center justify-center gap-2">
                <WifiOff className="w-4 h-4" />
                <span>网络连接已断开，部分功能可能不可用</span>
            </div>
        </div>
    );
}