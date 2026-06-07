"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getProfile, getPublicTrips, signOut, createTripPlan, saveTripDetails, toggleLike, toggleFavorite } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ConfirmDialog from "@/components/ConfirmDialog";
import SkeletonLoader from "@/components/SkeletonLoader";
import AISettings from "@/components/AISettings";
import { generateTripPlan } from "@/services/ai-service";
import {
    MapPin, ArrowLeft, Loader2, Heart, Bookmark, Clock, Flame, Star,
    Search, Grid3X3, List, Menu, X, User, LogOut, RefreshCw,
    Sparkles, Plus, Calendar, Wallet, Plane, Train, Bus, Car,
    Building2, Home, Hotel, Bed, Check, Leaf, Sun, Compass,
    Eye, TrendingUp, Users, Settings2,
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
    const [showAISettings, setShowAISettings] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        departureCity: "", destination: "", startDate: "", endDate: "", budget: "",
        interests: [] as string[], transportPreference: "flight", accommodationPreference: "comfortable",
    });

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) { router.push("/auth/login"); return; }
                setUser(currentUser);
                const userProfile = await getProfile(currentUser.id);
                setProfile(userProfile);
                await loadTrips();
            } catch (error) {
                toast.error("加载旅行广场失败");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [router, setUser, setProfile]);

    const loadTrips = async () => {
        try {
            const result = await getPublicTrips();
            setTrips(result.data || []);
        } catch (error) {
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
            if (!trip || !user?.id) return;
            const result = await toggleLike(tripId, user.id);
            setTrips((prev) => prev.map((t) =>
                t.id === tripId ? { ...t, is_liked: result.isLiked, likes_count: result.likesCount } : t
            ));
        } catch (error: any) {
            toast.error("操作失败: " + (error?.message || "未知错误"));
        }
    };

    const handleFavorite = async (tripId: string) => {
        try {
            const trip = trips.find((t) => t.id === tripId);
            if (!trip || !user?.id) return;
            const result = await toggleFavorite(tripId, user.id);
            setTrips((prev) => prev.map((t) =>
                t.id === tripId ? { ...t, is_favorited: result.isFavorited, favorites_count: result.favoritesCount } : t
            ));
        } catch (error: any) {
            toast.error("操作失败: " + (error?.message || "未知错误"));
        }
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
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
            <AISettings isOpen={showAISettings} onClose={() => setShowAISettings(false)} />

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-10 px-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
                        <div className="sticky top-0 bg-white border-b border-emerald-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">{t.tripCreate.title}</h2>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6">
                            <form onSubmit={handleCreateTrip} className="space-y-5 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.departureCity} <span className="text-emerald-500">*</span></label>
                                        <input type="text" value={formData.departureCity} onChange={(e) => setFormData((prev) => ({ ...prev, departureCity: e.target.value }))} placeholder={t.tripCreate.placeholderDeparture} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.destination} <span className="text-emerald-500">*</span></label>
                                        <input type="text" value={formData.destination} onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))} placeholder={t.tripCreate.placeholderDestination} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.startDate} <span className="text-emerald-500">*</span></label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                            <input type="date" value={formData.startDate} onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.endDate} <span className="text-emerald-500">*</span></label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                            <input type="date" value={formData.endDate} onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.tripCreate.budget} <span className="text-emerald-500">*</span></label>
                                    <div className="relative">
                                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                        <input type="number" value={formData.budget} onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))} placeholder={t.tripCreate.placeholderBudget} min="0" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">{t.tripCreate.interests} <span className="text-emerald-500">*</span></label>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_TAGS.map((tag) => (
                                            <button key={tag} type="button" onClick={() => toggleInterest(tag)} className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${formData.interests.includes(tag) ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                                                {formData.interests.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">{t.tripCreate.transportPreference}</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                        {TRANSPORT_OPTIONS.map((option) => (
                                            <button key={option.value} type="button" onClick={() => setFormData((prev) => ({ ...prev, transportPreference: option.value }))} className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all ${formData.transportPreference === option.value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/50"}`}>
                                                {transportIcons[option.value]}{option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">{t.tripCreate.accommodationPreference}</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                        {ACCOMMODATION_OPTIONS.map((option) => (
                                            <button key={option.value} type="button" onClick={() => setFormData((prev) => ({ ...prev, accommodationPreference: option.value }))} className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all ${formData.accommodationPreference === option.value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/50"}`}>
                                                {accommodationIcons[option.value]}{option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" disabled={isGenerating} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isGenerating ? (<><Loader2 className="w-5 h-5 animate-spin" />{t.tripCreate.generating}</>) : (<><Sparkles className="w-5 h-5" />{t.tripCreate.generate}</>)}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog isOpen={showSignOutConfirm} onClose={() => setShowSignOutConfirm(false)} onConfirm={handleSignOut} title="确认退出登录" message="退出登录后需要重新登录才能使用所有功能。" confirmText="确认退出" cancelText="取消" variant="warning" />

            <nav className="bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors">
                            <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline font-medium">{t.trip.back}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                                <Compass className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{t.square.title}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-200/50 transition-all shadow-sm">
                                <Plus className="w-4 h-4" /><span className="text-sm">{t.dashboard.createNew}</span>
                            </button>
                            <div className="flex items-center gap-1 bg-emerald-50/50 rounded-xl p-1">
                                <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-white transition-colors" title="刷新">
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} /><span className="text-sm">刷新</span>
                                </button>
                                <button onClick={() => setShowAISettings(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-purple-600 hover:text-purple-700 rounded-lg hover:bg-white transition-colors" title="AI 设置">
                                    <Settings2 className="w-4 h-4" /><span className="text-sm">AI</span>
                                </button>
                            </div>
                            <LanguageSwitcher />
                            <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-emerald-600 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-sm font-medium">{profile?.name || t.dashboard.user}</span>
                            </Link>
                            <button onClick={() => setShowSignOutConfirm(true)} className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                                <LogOut className="w-4 h-4" /><span className="text-sm">{t.dashboard.signOut}</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 md:hidden">
                            <button onClick={() => setShowCreateModal(true)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm" title={t.dashboard.createNew}>
                                <Plus className="w-5 h-5" />
                            </button>
                            <button onClick={handleRefresh} disabled={isRefreshing} className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors" title="刷新">
                                <RefreshCw className={`w-4 h-4 text-emerald-600 ${isRefreshing ? "animate-spin" : ""}`} />
                            </button>
                            <button onClick={() => setShowAISettings(true)} className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition-colors" title="AI 设置">
                                <Settings2 className="w-4 h-4 text-purple-600" />
                            </button>
                            <LanguageSwitcher />
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                                {isMenuOpen ? <X className="w-5 h-5 text-emerald-600" /> : <Menu className="w-5 h-5 text-emerald-600" />}
                            </button>
                        </div>
                    </div>
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t border-emerald-100">
                            <div className="flex flex-col gap-2">
                                <Link href="/profile" className="flex items-center gap-2 text-emerald-600 py-3 px-2 rounded-xl hover:bg-emerald-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="font-medium">{profile?.name || t.dashboard.user}</span>
                                </Link>
                                <button onClick={() => { setIsMenuOpen(false); setShowAISettings(true); }} className="flex items-center gap-2 text-purple-600 py-3 px-2 rounded-xl hover:bg-purple-50 transition-colors">
                                    <Settings2 className="w-5 h-5" /><span>AI 设置</span>
                                </button>
                                <button onClick={() => { setIsMenuOpen(false); setShowSignOutConfirm(true); }} className="flex items-center gap-2 text-red-500 py-3 px-2 rounded-xl hover:bg-red-50 transition-colors">
                                    <LogOut className="w-5 h-5" /><span>{t.dashboard.signOut}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 p-6 sm:p-8 mb-4 sm:mb-6 shadow-lg shadow-emerald-200/30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
                    <div className="absolute top-4 right-8 opacity-10">
                        <Leaf className="w-16 h-16 text-white" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t.square.title}</h1>
                        <p className="text-white/70 text-sm sm:text-base max-w-lg">发现来自全球旅行者的精彩行程，获取灵感，规划你的下一次冒险！</p>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                <Users className="w-3.5 h-3.5" /><span>{trips.length} 个行程</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                <TrendingUp className="w-3.5 h-3.5" /><span>实时更新</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.square.search} className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white rounded-xl border border-emerald-100 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm sm:text-base shadow-sm" />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-xl p-1.5 border border-emerald-100 w-full sm:w-auto overflow-x-auto shadow-sm">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm shadow-emerald-200" : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"}`}>
                                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{tab.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border border-emerald-100 shadow-sm">
                            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-emerald-100 text-emerald-600" : "text-gray-400 hover:text-emerald-500 hover:bg-emerald-50"}`} title="网格视图">
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-emerald-100 text-emerald-600" : "text-gray-400 hover:text-emerald-500 hover:bg-emerald-50"}`} title="列表视图">
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {sortedTrips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                            <Compass className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.square.noTrips}</h3>
                        <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">{t.square.noTripsDesc}</p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-200/50 transition-all text-sm">创建旅行计划</button>
                            <button onClick={handleRefresh} className="px-5 py-2.5 border border-emerald-200 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-all text-sm">刷新试试</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <p className="text-xs sm:text-sm text-gray-500">
                                找到 <span className="text-emerald-600 font-medium">{sortedTrips.length}</span> 个行程
                                {searchQuery && <span>（搜索"<span className="text-emerald-600">{searchQuery}</span>"）</span>}
                            </p>
                        </div>
                        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" : "space-y-3 sm:space-y-4"}>
                            {sortedTrips.map((trip) => (
                                <div key={trip.id} className={`group bg-white rounded-2xl border border-emerald-100/80 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/30 transition-all duration-300 overflow-hidden ${viewMode === "list" ? "flex flex-col sm:flex-row" : ""}`}>
                                    <div className={`bg-gradient-to-r from-emerald-400 to-green-500 ${viewMode === "list" ? "w-full sm:w-2 h-2 sm:h-auto" : "h-2"}`} />
                                    <div className={`p-4 sm:p-5 ${viewMode === "list" ? "flex-1" : ""}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-emerald-600 transition-colors">{trip.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                                                    <User className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-xs text-gray-500 truncate max-w-[80px]">{trip.user_profiles?.name || "匿名用户"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                            <span className="text-xs text-gray-600 truncate">{trip.destination}</span>
                                            <span className="text-gray-300">·</span>
                                            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                            <span className="text-xs text-gray-500">{formatDate(trip.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-md">
                                                <Wallet className="w-3 h-3 text-emerald-500" />
                                                <span className="text-xs font-medium text-emerald-700">¥{trip.budget}</span>
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md">
                                                <Calendar className="w-3 h-3 text-blue-500" />
                                                <span className="text-xs font-medium text-blue-700">{trip.days_count || 3}天</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-3 border-t border-emerald-50">
                                            <Link href={`/trip/${trip.id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-medium">
                                                <Eye className="w-3.5 h-3.5" />
                                                {t.square.viewTrip}
                                            </Link>
                                            <button onClick={() => handleLike(trip.id)} className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${trip.is_liked ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500"}`}>
                                                <Heart className={`w-3.5 h-3.5 ${trip.is_liked ? "fill-current" : ""}`} />
                                                {trip.likes_count || 0}
                                            </button>
                                            <button onClick={() => handleFavorite(trip.id)} className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${trip.is_favorited ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-500"}`}>
                                                <Bookmark className={`w-3.5 h-3.5 ${trip.is_favorited ? "fill-current" : ""}`} />
                                                {trip.favorites_count || 0}
                                            </button>
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
