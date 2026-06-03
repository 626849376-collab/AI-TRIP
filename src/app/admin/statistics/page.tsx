"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Map, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { getCurrentUser, getStatistics } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export default function AdminStatisticsPage() {
    const { setUser } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { language } = useLanguageStore();
    const t = translations[language];

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    window.location.href = "/auth/login";
                    return;
                }
                setUser(currentUser);
                const data = await getStatistics();
                setStats(data);
            } catch (error) {
                console.error("Failed to load statistics:", error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [setUser]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const statCards = [
        {
            icon: Users,
            label: t.admin.totalUsers,
            value: stats?.totalUsers || 0,
            color: "bg-blue-50 text-blue-600",
        },
        {
            icon: Map,
            label: t.admin.totalTrips,
            value: stats?.totalTrips || 0,
            color: "bg-green-50 text-green-600",
        },
        {
            icon: DollarSign,
            label: t.admin.totalBudget,
            value: `¥${(stats?.totalBudget || 0).toLocaleString()}`,
            color: "bg-yellow-50 text-yellow-600",
        },
        {
            icon: TrendingUp,
            label: t.admin.avgBudget,
            value: `¥${(stats?.avgBudget || 0).toLocaleString()}`,
            color: "bg-purple-50 text-purple-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>{t.admin.back}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-600" />
                            <span className="font-semibold">{t.admin.statistics}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                    {t.admin.statsTitle}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-sm border p-6"
                        >
                            <div
                                className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}
                            >
                                <card.icon className="w-6 h-6" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">
                                {card.label}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {t.admin.statsDesc}
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <span className="text-gray-600">
                                {t.admin.statsDesc1}
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <span className="text-gray-600">
                                {t.admin.statsDesc2}
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                            <span className="text-gray-600">
                                {t.admin.statsDesc3}
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            <span className="text-gray-600">
                                {t.admin.statsDesc4}
                            </span>
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
