"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getCurrentUser, getProfile, getPublicTrips, toggleLike, toggleFavorite, checkIfLiked, checkIfFavorited, getUserFavorites, getTripPlans, publishTripToSquare } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
    MapPin,
    Heart,
    Bookmark,
    Search,
    Loader2,
    User,
    LogOut,
    Menu,
    X,
    Calendar,
    Wallet,
    ArrowRight,
    Globe,
    Star,
    Upload,
    CheckCircle2,
    ChevronDown,
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
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"popular" | "favorites">("popular");
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
    const [myTrips, setMyTrips] = useState<any[]>([]);
    const [isLoadingMyTrips, setIsLoadingMyTrips] = useState(false);
    const [showMyTrips, setShowMyTrips] = useState(false);
    const [publishingId, setPublishingId] = useState<string | null>(null);

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

                await loadTrips(1);
            } catch (error) {
                console.error("Error loading square:", error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [router, setUser, setProfile]);

    const loadTrips = async (pageNum: number) => {
        try {
            const result = await getPublicTrips(pageNum, 12);
            if (pageNum === 1) {
                setTrips(result.data);
            } else {
                setTrips((prev) => [...prev, ...result.data]);
            }
            setTotalCount(result.count);
            setPage(pageNum);
        } catch (error) {
            console.error("Error loading trips:", error);
        }
    };

    const loadFavorites = async () => {
        if (!user) return;
        setIsLoadingFavorites(true);
        try {
            const data = await getUserFavorites(user.id);
            setFavorites(data);
        } catch (error) {
            console.error("Error loading favorites:", error);
        } finally {
            setIsLoadingFavorites(false);
        }
    };

    const loadMyTrips = async () => {
        if (!user) return;
        setIsLoadingMyTrips(true);
        try {
            const plans = await getTripPlans(user.id);
            // Only show unpublished trips
            setMyTrips(plans.filter((p: any) => !p.is_public));
        } catch (error) {
            console.error("Error loading my trips:", error);
        } finally {
            setIsLoadingMyTrips(false);
        }
    };

    const handlePublishToSquare = async (tripId: string) => {
        setPublishingId(tripId);
        try {
            await publishTripToSquare(tripId);
            setMyTrips((prev) => prev.filter((p) => p.id !== tripId));
            toast.success(t.dashboard.publishSuccess || "Trip published to Travel Square!");
            // Reload the public trips
            await loadTrips(1);
        } catch (error: any) {
            toast.error(t.dashboard.publishFailed || "Failed to publish trip");
        } finally {
            setPublishingId(null);
        }
    };

    const handleTabChange = (tab: "popular" | "favorites") => {
        setActiveTab(tab);
        if (tab === "favorites") {
            loadFavorites();
        }
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        await loadTrips(page + 1);
        setIsLoadingMore(false);
    };

    const handleLike = async (tripId: string, index: number) => {
        if (!user) return;
        try {
            const isLiked = await toggleLike(tripId, user.id);
            setTrips((prev) => {
                const updated = [...prev];
                if (updated[index]) {
                    updated[index] = {
                        ...updated[index],
                        is_liked: isLiked,
                        likes_count: (updated[index].likes_count || 0) + (isLiked ? 1 : -1),
                    };
                }
                return updated;
            });
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleFavorite = async (tripId: string, index: number) => {
        if (!user) return;
        try {
            const isFavorited = await toggleFavorite(tripId, user.id);
            setTrips((prev) => {
                const updated = [...prev];
                if (updated[index]) {
                    updated[index] = {
                        ...updated[index],
                        is_favorited: isFavorited,
                        favorites_count: (updated[index].favorites_count || 0) + (isFavorited ? 1 : -1),
                    };
                }
                return updated;
            });
            toast.success(isFavorited ? t.square.favorited : t.square.favorites);
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            const { signOut } = await import("@/lib/supabase");
            await signOut();
            clearAuth();
            router.push("/");
            toast.success(t.dashboard.signOutSuccess);
        } catch (error: any) {
            toast.error(t.dashboard.signOutFailed);
        }
    };

    const filteredTrips = trips.filter((trip) =>
        trip.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2"
                        >
                            <MapPin className="w-6 h-6 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">
                                Travel Planner
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                href="/square"
                                className="flex items-center gap-2 text-primary-600 font-medium"
                            >
                                <Globe className="w-5 h-5" />
                                <span>{t.square.title}</span>
                            </Link>
                            <LanguageSwitcher />
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                                <User className="w-5 h-5" />
                                <span>{profile?.name || t.dashboard.user}</span>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
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
                            >
                                {isMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Nav */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t">
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/square"
                                    className="flex items-center gap-2 text-primary-600 py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Globe className="w-5 h-5" />
                                    <span>{t.square.title}</span>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-gray-600 py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <MapPin className="w-5 h-5" />
                                    <span>{t.dashboard.myPlans}</span>
                                </Link>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 text-gray-600 py-2"
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
                                    className="flex items-center gap-2 text-red-600 py-2"
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {t.square.title}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {t.square.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.square.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="mt-6 flex gap-4 border-b border-gray-200">
                        <button
                            onClick={() => handleTabChange("popular")}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "popular"
                                    ? "text-primary-600 border-primary-600"
                                    : "text-gray-500 border-transparent hover:text-gray-700"
                                }`}
                        >
                            <Globe className="w-4 h-4 inline mr-1" />
                            {t.square.popular}
                        </button>
                        <button
                            onClick={() => handleTabChange("favorites")}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "favorites"
                                    ? "text-primary-600 border-primary-600"
                                    : "text-gray-500 border-transparent hover:text-gray-700"
                                }`}
                        >
                            <Star className="w-4 h-4 inline mr-1" />
                            {t.square.myFavorites}
                        </button>
                    </div>
                </div>

                {/* Upload My Plan Section */}
                <div className="mb-8">
                    <button
                        onClick={() => {
                            setShowMyTrips(!showMyTrips);
                            if (!showMyTrips && myTrips.length === 0) {
                                loadMyTrips();
                            }
                        }}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-emerald-800">
                                    {t.dashboard.publishToSquare || "Upload My Plan"}
                                </h3>
                                <p className="text-sm text-emerald-600">
                                    {t.dashboard.publishDesc || "Share your travel plans with the community"}
                                </p>
                            </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-emerald-500 transition-transform duration-300 ${showMyTrips ? "rotate-180" : ""}`} />
                    </button>

                    {showMyTrips && (
                        <div className="mt-3 bg-white border border-emerald-100 rounded-xl overflow-hidden ">
                            {isLoadingMyTrips ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                </div>
                            ) : myTrips.length === 0 ? (
                                <div className="p-8 text-center">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                                    <p className="text-emerald-700 font-medium">{t.dashboard.noUnpublished || "No unpublished plans"}</p>
                                    <p className="text-sm text-emerald-500 mt-1">{t.dashboard.allPublished || "All your plans are already shared!"}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-emerald-50">
                                    {myTrips.map((trip: any) => (
                                        <div key={trip.id} className="flex items-center justify-between p-4 hover:bg-emerald-50/50 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{trip.title}</h4>
                                                <p className="text-sm text-gray-500">{trip.destination} · {formatDate(trip.start_date)}</p>
                                            </div>
                                            <button
                                                onClick={() => handlePublishToSquare(trip.id)}
                                                disabled={publishingId === trip.id}
                                                className="flex-shrink-0 ml-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                                            >
                                                {publishingId === trip.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Upload className="w-4 h-4" />
                                                )}
                                                <span>{t.dashboard.publish || "Publish"}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Favorites Tab */}
                {activeTab === "favorites" && (
                    <div>
                        {isLoadingFavorites ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                            </div>
                        ) : favorites.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {t.square.myFavoritesEmpty}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t.square.myFavoritesEmptyDesc}
                                </p>
                                <button
                                    onClick={() => handleTabChange("popular")}
                                    className="gradient-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    {t.square.goToSquare}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.map((fav: any, index: number) => {
                                    const trip = fav.trip_plans;
                                    if (!trip) return null;
                                    return (
                                        <div
                                            key={fav.trip_id}
                                            className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                                                            {trip.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {trip.destination}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-primary-600" />
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                        {trip.user_profile?.name || t.dashboard.user}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Wallet className="w-4 h-4" />
                                                        <span>
                                                            {t.dashboard.budget}：{formatCurrency(trip.budget)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-4 h-4" />
                                                        {trip.likes_count || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Bookmark className="w-4 h-4" />
                                                        {trip.favorites_count || 0}
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/trip/${trip.id}`}
                                                    className="block w-full text-center text-sm bg-primary-50 text-primary-700 py-2 rounded-lg hover:bg-primary-100 transition-colors"
                                                >
                                                    {t.square.viewTrip}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Popular Tab */}
                {activeTab === "popular" && (
                    <div>
                        {filteredTrips.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {t.square.noTrips}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t.square.noTripsDesc}
                                </p>
                                <Link
                                    href="/trip/create"
                                    className="gradient-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                                >
                                    <MapPin className="w-5 h-5" />
                                    {t.dashboard.createPlan}
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTrips.map((trip: any, index: number) => (
                                        <div
                                            key={trip.id}
                                            className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden group"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                                                            {trip.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {trip.destination}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-primary-600" />
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                        {t.square.from} {trip.user_profile?.name || t.dashboard.user}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Wallet className="w-4 h-4" />
                                                        <span>
                                                            {t.dashboard.budget}：{formatCurrency(trip.budget)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm mb-4">
                                                    <button
                                                        onClick={() => handleLike(trip.id, index)}
                                                        className={`flex items-center gap-1 transition-colors ${trip.is_liked
                                                                ? "text-red-500"
                                                                : "text-gray-500 hover:text-red-500"
                                                            }`}
                                                    >
                                                        <Heart
                                                            className={`w-4 h-4 ${trip.is_liked ? "fill-current" : ""
                                                                }`}
                                                        />
                                                        <span>{trip.likes_count || 0}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleFavorite(trip.id, index)}
                                                        className={`flex items-center gap-1 transition-colors ${trip.is_favorited
                                                                ? "text-yellow-500"
                                                                : "text-gray-500 hover:text-yellow-500"
                                                            }`}
                                                    >
                                                        <Bookmark
                                                            className={`w-4 h-4 ${trip.is_favorited ? "fill-current" : ""
                                                                }`}
                                                        />
                                                        <span>{trip.favorites_count || 0}</span>
                                                    </button>
                                                </div>

                                                <Link
                                                    href={`/trip/${trip.id}`}
                                                    className="block w-full text-center text-sm bg-primary-50 text-primary-700 py-2 rounded-lg hover:bg-primary-100 transition-colors"
                                                >
                                                    {t.square.viewTrip}
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More */}
                                {trips.length < totalCount && (
                                    <div className="mt-8 text-center">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoadingMore}
                                            className="gradient-primary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2"
                                        >
                                            {isLoadingMore ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    {t.square.loading}
                                                </>
                                            ) : (
                                                t.square.loadMore
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}