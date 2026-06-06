"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getCurrentUser, getProfile, getPublicTrips, signOut } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
    MapPin,
    ArrowLeft,
    Loader2,
    Heart,
    Bookmark,
    MessageCircle,
    Share2,
    TrendingUp,
    Clock,
    Flame,
    Star,
    Search,
    Filter,
    Grid3X3,
    List,
    Globe,
    ArrowRight,
    Menu,
    X,
    User,
    LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function SquarePage() {
    const router = useRouter();
    const { user, profile, setUser, setProfile, clearAuth } = useAuthStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("trending");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push("/auth/login");
                    return;
                }
                setUser(currentUser);

                const userProfile = await getProfile(currentUser.id);
                setProfile(userProfile);

                await loadTrips();
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [router, setUser, setProfile]);

    const loadTrips = async () => {
        try {
            const publicTrips = await getPublicTrips();
            setTrips(publicTrips);
        } catch (error) {
            console.error("Error loading trips:", error);
        }
    };

    const handleLike = async (tripId: string) => {
        try {
            const trip = trips.find((t) => t.id === tripId);
            if (!trip) return;

            if (trip.is_liked) {
                const { error } = await supabase
                    .from("trip_likes")
                    .delete()
                    .eq("trip_id", tripId)
                    .eq("user_id", user?.id);
                if (error) throw error;
                setTrips((prev) =>
                    prev.map((t) =>
                        t.id === tripId
                            ? { ...t, is_liked: false, likes_count: t.likes_count - 1 }
                            : t
                    )
                );
            } else {
                const { error } = await supabase
                    .from("trip_likes")
                    .insert({ trip_id: tripId, user_id: user?.id });
                if (error) throw error;
                setTrips((prev) =>
                    prev.map((t) =>
                        t.id === tripId
                            ? { ...t, is_liked: true, likes_count: t.likes_count + 1 }
                            : t
                    )
                );
            }
        } catch (error: any) {
            toast.error(t.square.likes || "Action failed");
        }
    };

    const handleFavorite = async (tripId: string) => {
        try {
            const trip = trips.find((t) => t.id === tripId);
            if (!trip) return;

            if (trip.is_favorited) {
                const { error } = await supabase
                    .from("trip_favorites")
                    .delete()
                    .eq("trip_id", tripId)
                    .eq("user_id", user?.id);
                if (error) throw error;
                setTrips((prev) =>
                    prev.map((t) =>
                        t.id === tripId
                            ? { ...t, is_favorited: false, favorites_count: t.favorites_count - 1 }
                            : t
                    )
                );
            } else {
                const { error } = await supabase
                    .from("trip_favorites")
                    .insert({ trip_id: tripId, user_id: user?.id });
                if (error) throw error;
                setTrips((prev) =>
                    prev.map((t) =>
                        t.id === tripId
                            ? { ...t, is_favorited: true, favorites_count: t.favorites_count + 1 }
                            : t
                    )
                );
            }
        } catch (error: any) {
            toast.error(t.square.favorites || "Action failed");
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            clearAuth();
            router.push("/");
            toast.success(t.dashboard.signOutSuccess);
        } catch (error: any) {
            toast.error(t.dashboard.signOutFailed);
        }
    };

    const filteredTrips = trips.filter((trip) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            trip.title?.toLowerCase().includes(query) ||
            trip.destination?.toLowerCase().includes(query) ||
            trip.profiles?.name?.toLowerCase().includes(query)
        );
    });

    const sortedTrips = [...filteredTrips].sort((a, b) => {
        switch (activeTab) {
            case "trending":
                return (b.likes_count || 0) - (a.likes_count || 0);
            case "latest":
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case "popular":
                return (b.favorites_count || 0) - (a.favorites_count || 0);
            default:
                return 0;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const tabs = [
        { id: "trending", label: t.square.popular, icon: Flame },
        { id: "latest", label: t.square.latest, icon: Clock },
        { id: "popular", label: t.square.likes, icon: Star },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 touch-target"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">{t.trip.back}</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-600" />
                            <span className="font-semibold text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {t.square.title}
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-4">
                            <LanguageSwitcher />
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 touch-target"
                            >
                                <User className="w-5 h-5" />
                                <span>{profile?.name || t.dashboard.user}</span>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors touch-target"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>{t.dashboard.signOut}</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-2 md:hidden">
                            <LanguageSwitcher />
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors icon-button"
                            >
                                {isMenuOpen ? (
                                    <X className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Nav */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t">
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 text-gray-600 py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors touch-target"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User className="w-5 h-5" />
                                    <span>{profile?.name || t.dashboard.user}</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleSignOut();
                                    }}
                                    className="flex items-center gap-2 text-red-600 py-3 px-2 rounded-xl hover:bg-red-50 transition-colors touch-target"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>{t.dashboard.signOut}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* Search and Filters */}
                <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.square.search}
                            className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm sm:text-base"
                        />
                    </div>

                    {/* Tabs and View Toggle */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-xl p-1 border w-full sm:w-auto overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-target ${activeTab === tab.id
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-colors icon-button ${viewMode === "grid"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-colors icon-button ${viewMode === "list"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trip Cards */}
                {sortedTrips.length === 0 ? (
                    <div className="text-center py-12 sm:py-20">
                        <Globe className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t.square.noTrips}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 mb-6">
                            {t.square.noTripsDesc}
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all touch-target"
                        >
                            {t.trip.back}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className={
                        viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                            : "space-y-3 sm:space-y-4"
                    }>
                        {sortedTrips.map((trip) => (
                            <div
                                key={trip.id}
                                className={`group bg-white rounded-2xl border hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden ${viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                                    }`}
                            >
                                {/* Card Content */}
                                <div className={`p-4 sm:p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                {trip.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                {trip.destination}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            <span className="text-xs text-gray-400">
                                                {trip.profiles?.name || t.square.from}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {trip.destination}
                                        </span>
                                        <span>•</span>
                                        <span>{formatDate(trip.start_date)}</span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4">
                                        {trip.description || t.square.subtitle}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <button
                                                onClick={() => handleLike(trip.id)}
                                                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors touch-target ${trip.is_liked
                                                    ? "text-red-500 bg-red-50"
                                                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                    }`}
                                            >
                                                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${trip.is_liked ? "fill-current" : ""}`} />
                                                <span>{trip.likes_count || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => handleFavorite(trip.id)}
                                                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors touch-target ${trip.is_favorited
                                                    ? "text-yellow-500 bg-yellow-50"
                                                    : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                                                    }`}
                                            >
                                                <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${trip.is_favorited ? "fill-current" : ""}`} />
                                                <span>{trip.favorites_count || 0}</span>
                                            </button>
                                        </div>
                                        <Link
                                            href={`/trip/${trip.id}`}
                                            className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium touch-target"
                                        >
                                            {t.square.viewTrip}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}