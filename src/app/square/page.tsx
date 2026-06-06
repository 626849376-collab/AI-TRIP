"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getCurrentUser, getProfile, getPublicTrips, signOut, createTripPlan, saveTripDetails } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ConfirmDialog from "@/components/ConfirmDialog";
import SkeletonLoader from "@/components/SkeletonLoader";
import EmptyState from "@/components/EmptyState";
import { generateTripPlan } from "@/services/ai-service";
import {
    MapPin, ArrowLeft, Loader2, Heart, Bookmark, Clock, Flame, Star,
    Search, Grid3X3, List, Globe, Menu, X, User, LogOut, RefreshCw,
    Sparkles, Plus, Calendar, Wallet, Plane, Train, Bus, Car, ArrowRight,
    Building2, Home, Hotel, Bed, Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { INTEREST_TAGS, TRANSPORT_OPTIONS, ACCOMMODATION_OPTIONS, CreateTripInput } from "@/types";

export default function SquarePage() {
    const router = useRouter();
    const { user, profile, setUser, setProfile, clearAuth } = useAuthStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("trending");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        departureCity: "", destination: "", startDate: "", endDate: "", budget: "",
        interests: [] as string[], transportPreference: "flight", accommodationPreference: "comfortable",
    });

    useEffect(() => {
        const init = async () => {
            try {
                console.log("SquarePage init started");
                const currentUser = await getCurrentUser();
                console.log("Current user:", currentUser?.id);
                if (!currentUser) { router.push("/auth/login"); return; }
                setUser(currentUser);
                const userProfile = await getProfile(currentUser.id);
                console.log("User profile:", userProfile);
                setProfile(userProfile);
                await loadTrips();
            } catch (error) {
                console.error("SquarePage init error:", error);
                if (error instanceof Error) {
                    console.error("Error message:", error.message);
                    console.error("Error stack:", error.stack);
                }
                toast.error("加载旅行广场失败");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [router, setUser, setProfile]);

    const loadTrips = async () => {
        try {
            console.log("Loading trips...");
            const result = await getPublicTrips();
            console.log("Trips loaded:", result);
            setTrips(result.data || []);
        } catch (error) {
            console.error("Error loading trips:", error);
            if (error instanceof Error) {
                console.error("Error message:", error.message);
                console.error("Error stack:", error.stack);
            }
            toast.error("加载行程列表失败");
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try { await loadTrips(); toast.success("已刷新"); } catch (error) { toast.error("刷新失败"); }
        finally { setIsRefreshing(false); }
    };

    const handleLike = async (tripId: string) => {
        try {
            const trip = trips.find((t) => t.id === tripId);
            if (!trip) return;
            if (trip.is_liked) {
                await supabase.from("trip_likes").delete().eq("trip_id", tripId).eq("user_id", user?.id);
                setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, is_liked: false, likes_count: t.likes_count - 1 } : t));
            } else {
                await supabase.from("trip_likes").insert({ trip_id: tripId, user_id: user?.id });
                setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, is_liked: true, likes_count: t.likes_count + 1 } : t));
            }
        } catch (error: any) { toast.error(t.square.likes || "操作失败"); }
    };

    const handleFavorite = async (tripId: string) => {
        try {
            const trip = trips.find((t) => t.id === tripId);
            if (!trip) return;
            if (trip.is_favorited) {
                await supabase.from("trip_favorites").delete().eq("trip_id", tripId).eq("user_id", user?.id);
                setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, is_favorited: false, favorites_count: t.favorites_count - 1 } : t));
            } else {
                await supabase.from("trip_favorites").insert({ trip_id: tripId, user_id: user?.id });
                setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, is_favorited: true, favorites_count: t.favorites_count + 1 } : t));
            }
        } catch (error: any) { toast.error(t.square.favorites || "操作失败"); }
    };

    const handleSignOut = async () => {
        try { await signOut(); clearAuth(); router.push("/"); toast.success(t.dashboard.signOutSuccess); }
        catch (error: any) { toast.error(t.dashboard.signOutFailed); }
        finally { setShowSignOutConfirm(false); }
    };

    const toggleInterest = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            interests: prev.interests.includes(tag) ? prev.interests.filter((t) => t !== tag) : [...prev.interests, tag],
        }));
    };

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.departureCity || !formData.destination || !formData.startDate || !formData.endDate || !formData.budget) {
            toast.error(t.tripCreate.required); return;
        }
        if (formData.interests.length === 0) { toast.error(t.tripCreate.selectInterest); return; }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) { toast.error(t.tripCreate.dateError); return; }

        setIsGenerating(true);
        try {
            const input: CreateTripInput = {
                departureCity: formData.departureCity, destination: formData.destination,
                startDate: formData.startDate, endDate: formData.endDate, budget: parseInt(formData.budget),
                interests: formData.interests, transportPreference: formData.transportPreference,
                accommodationPreference: formData.accommodationPreference,
            };
            const aiResponse = await generateTripPlan(input);
            if (!aiResponse.success) throw new Error(t.tripCreate.failed);

            const tripPlan = await createTripPlan({
                user_id: user!.id, title: `${formData.destination}${t.tripCreate.tripSuffix}`,
                destination: formData.destination, start_date: formData.startDate,
                end_date: formData.endDate, budget: parseInt(formData.budget),
            });

            const details = aiResponse.data.days.map((day, index) => ({ day_number: index + 1, content: day }));
            await saveTripDetails(tripPlan.id, details);

            toast.success(t.tripCreate.success);
            setShowCreateModal(false);
            setFormData({ departureCity: "", destination: "", startDate: "", endDate: "", budget: "", interests: [], transportPreference: "flight", accommodationPreference: "comfortable" });
            await loadTrips();
            router.push(`/trip/${tripPlan.id}`);
        } catch (error: any) { toast.error(error.message || t.tripCreate.failed); }
        finally { setIsGenerating(false); }
    };

    const filteredTrips = trips.filter((trip) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return trip.title?.toLowerCase().includes(q) || trip.destination?.toLowerCase().includes(q) || trip.user_profiles?.name?.toLowerCase().includes(q);
    });

    const sortedTrips = [...filteredTrips].sort((a, b) => {
        switch (activeTab) {
            case "trending": return (b.likes_count || 0) - (a.likes_count || 0);
            case "latest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case "popular": return (b.favorites_count || 0) - (a.favorites_count || 0);
            default: return 0;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <SkeletonLoader type="card" count={6} />
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "trending", label: t.square.popular, icon: Flame },
        { id: "latest", label: t.square.latest, icon: Clock },
        { id: "popular", label: t.square.likes, icon: Star },
    ];

    const transportIcons: Record<string, React.ReactNode> = {
        flight: <Plane className="w-4 h-4" />, train: <Train className="w-4 h-4" />,
        bus: <Bus className="w-4 h-4" />, "self-drive": <Car className="w-4 h-4" />,
    };

    const accommodationIcons: Record<string, React.ReactNode> = {
        budget: <Bed className="w-4 h-4" />, comfortable: <Building2 className="w-4 h-4" />,
        luxury: <Hotel className="w-4 h-4" />, hostel: <Home className="w-4 h-4" />,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* 创建旅行计划模态框 */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-10 px-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
                        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-lg font-semibold text-gray-900">{t.tripCreate.title}</h2>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors icon-button">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6">
                            <form onSubmit={handleCreateTrip} className="space-y-5 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.departureCity} <span className="text-red-500">*</span></label>
                                        <input type="text" value={formData.departureCity} onChange={(e) => setFormData((prev) => ({ ...prev, departureCity: e.target.value }))} placeholder={t.tripCreate.placeholderDeparture} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.destination} <span className="text-red-500">*</span></label>
                                        <input type="text" value={formData.destination} onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))} placeholder={t.tripCreate.placeholderDestination} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.startDate} <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="date" value={formData.startDate} onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.endDate} <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="date" value={formData.endDate} onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.budget} <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="number" value={formData.budget} onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))} placeholder={t.tripCreate.placeholderBudget} min="0" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">{t.tripCreate.interests} <span className="text-red-500">*</span></label>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_TAGS.map((tag) => (
                                            <button key={tag} type="button" onClick={() => toggleInterest(tag)} className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-target ${formData.interests.includes(tag) ? "bg-indigo-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                                {formData.interests.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">{t.tripCreate.transportPreference}</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                        {TRANSPORT_OPTIONS.map((option) => (
                                            <button key={option.value} type="button" onClick={() => setFormData((prev) => ({ ...prev, transportPreference: option.value }))} className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all touch-target ${formData.transportPreference === option.value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                                                {transportIcons[option.value]}{option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">{t.tripCreate.accommodationPreference}</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                        {ACCOMMODATION_OPTIONS.map((option) => (
                                            <button key={option.value} type="button" onClick={() => setFormData((prev) => ({ ...prev, accommodationPreference: option.value }))} className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all touch-target ${formData.accommodationPreference === option.value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                                                {accommodationIcons[option.value]}{option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" disabled={isGenerating} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-target">
                                    {isGenerating ? (<><Loader2 className="w-5 h-5 animate-spin" />{t.tripCreate.generating}</>) : (<><Sparkles className="w-5 h-5" />{t.tripCreate.generate}</>)}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog isOpen={showSignOutConfirm} onClose={() => setShowSignOutConfirm(false)} onConfirm={handleSignOut} title="确认退出登录" message="退出登录后需要重新登录才能使用所有功能。" confirmText="确认退出" cancelText="取消" variant="warning" />

            {/* 导航栏 */}
            <nav className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 touch-target">
                            <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">{t.trip.back}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-600" />
                            <span className="font-semibold text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t.square.title}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity touch-target shadow-sm">
                                <Plus className="w-4 h-4" /><span className="text-sm">{t.dashboard.createNew}</span>
                            </button>
                            <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors touch-target" title="刷新">
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} /><span className="text-sm">刷新</span>
                            </button>
                            <LanguageSwitcher />
                            <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 touch-target">
                                <User className="w-5 h-5" /><span>{profile?.name || t.dashboard.user}</span>
                            </Link>
                            <button onClick={() => setShowSignOutConfirm(true)} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors touch-target">
                                <LogOut className="w-5 h-5" /><span>{t.dashboard.signOut}</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 md:hidden">
                            <button onClick={() => setShowCreateModal(true)} className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm icon-button" title={t.dashboard.createNew}>
                                <Plus className="w-5 h-5" />
                            </button>
                            <button onClick={handleRefresh} disabled={isRefreshing} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors icon-button" title="刷新">
                                <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? "animate-spin" : ""}`} />
                            </button>
                            <LanguageSwitcher />
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors icon-button">
                                {isMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
                            </button>
                        </div>
                    </div>
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t animate-fade-in">
                            <div className="flex flex-col gap-2">
                                <Link href="/profile" className="flex items-center gap-2 text-gray-600 py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors touch-target" onClick={() => setIsMenuOpen(false)}>
                                    <User className="w-5 h-5" /><span>{profile?.name || t.dashboard.user}</span>
                                </Link>
                                <button onClick={() => { setIsMenuOpen(false); setShowSignOutConfirm(true); }} className="flex items-center gap-2 text-red-600 py-3 px-2 rounded-xl hover:bg-red-50 transition-colors touch-target">
                                    <LogOut className="w-5 h-5" /><span>{t.dashboard.signOut}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* 主内容 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 page-enter">
                {/* 横幅 */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 mb-4 sm:mb-6">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <span className="text-white/80 text-sm font-medium">{t.square.subtitle}</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{t.square.title}</h1>
                        <p className="text-white/70 text-sm sm:text-base max-w-lg">发现来自全球旅行者的精彩行程，获取灵感，规划你的下一次冒险！</p>
                    </div>
                </div>

                {/* 搜索和筛选 */}
                <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.square.search} className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm sm:text-base" />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 icon-button">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-xl p-1 border w-full sm:w-auto overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-target ${activeTab === tab.id ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{tab.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border">
                            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors icon-button ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`} title="网格视图">
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors icon-button ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`} title="列表视图">
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 行程卡片 */}
                {sortedTrips.length === 0 ? (
                    <EmptyState icon="globe" title={t.square.noTrips} description={t.square.noTripsDesc}
                        action={{ label: "创建旅行计划", onClick: () => setShowCreateModal(true) }}
                        secondaryAction={{ label: "刷新试试", onClick: handleRefresh }}
                    />
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <p className="text-xs sm:text-sm text-gray-500">找到 {sortedTrips.length} 个行程{searchQuery && `（搜索"${searchQuery}"）`}</p>
                        </div>
                        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stagger-enter" : "space-y-3 sm:space-y-4 stagger-enter"}>
                            {sortedTrips.map((trip) => (
                                <div key={trip.id} className={`group bg-white rounded-2xl border hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden ${viewMode === "list" ? "flex flex-col sm:flex-row" : ""}`}>
                                    <div className={`bg-gradient-to-r from-indigo-400 to-purple-500 ${viewMode === "list" ? "w-full sm:w-2 h-2 sm:h-auto" : "h-2"}`} />
                                    <div className={`p-4 sm:p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-indigo-600 transition-colors">{trip.title}</h3>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.destination}</p>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center"><User className="w-3 h-3 text-white" /></div>
                                                <span className="text-xs text-gray-400 truncate max-w-[80px]">{trip.user_profiles?.name || t.square.from}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 mb-3">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trip.destination}</span>
                                            <span>•</span>
                                            <span>{formatDate(trip.start_date)}</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4">{trip.description || t.square.subtitle}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <button onClick={() => handleLike(trip.id)} className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors touch-target ${trip.is_liked ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`} title={trip.is_liked ? "取消点赞" : "点赞"}>
                                                    <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${trip.is_liked ? "fill-current" : ""}`} />
                                                    <span>{trip.likes_count || 0}</span>
                                                </button>
                                                <button onClick={() => handleFavorite(trip.id)} className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors touch-target ${trip.is_favorited ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"}`} title={trip.is_favorited ? "取消收藏" : "收藏"}>
                                                    <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${trip.is_favorited ? "fill-current" : ""}`} />
                                                    <span>{trip.favorites_count || 0}</span>
                                                </button>
                                            </div>
                                            <Link href={`/trip/${trip.id}`} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm font-medium touch-target">
                                                {t.square.viewTrip}<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}