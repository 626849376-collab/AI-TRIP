"use client";

import { ReactNode } from "react";
import { MapPin, Globe, Search, Inbox, AlertCircle } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    icon?: "map" | "globe" | "search" | "inbox" | "alert";
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

const iconMap = {
    map: MapPin,
    globe: Globe,
    search: Search,
    inbox: Inbox,
    alert: AlertCircle,
};

export default function EmptyState({
    icon = "map",
    title,
    description,
    action,
    secondaryAction,
}: EmptyStateProps) {
    const Icon = iconMap[icon];

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto">
                {description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {action && (
                    action.href ? (
                        <Link
                            href={action.href}
                            className="gradient-primary text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 w-full sm:w-auto justify-center touch-target"
                        >
                            {action.label}
                        </Link>
                    ) : (
                        <button
                            onClick={action.onClick}
                            className="gradient-primary text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 w-full sm:w-auto justify-center touch-target"
                        >
                            {action.label}
                        </button>
                    )
                )}
                {secondaryAction && (
                    <button
                        onClick={secondaryAction.onClick}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto touch-target"
                    >
                        {secondaryAction.label}
                    </button>
                )}
            </div>
        </div>
    );
}