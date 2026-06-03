"use client";

import Link from "next/link";
import { MapPin, Users, BarChart3, Shield } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export default function AdminPage() {
    const { language } = useLanguageStore();
    const t = translations[language];

    const adminLinks = [
        {
            href: "/admin/users",
            icon: Users,
            title: t.admin.users,
            description: t.admin.usersDesc,
        },
        {
            href: "/admin/statistics",
            icon: BarChart3,
            title: t.admin.statistics,
            description: t.admin.statisticsDesc,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2"
                        >
                            <MapPin className="w-6 h-6 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">
                                Admin
                            </span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary-600" />
                            <span className="text-sm text-gray-500">
                                {t.admin.panel}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                    {t.admin.title}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminLinks.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                                <link.icon className="w-6 h-6 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {link.title}
                            </h3>
                            <p className="text-gray-600">{link.description}</p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
