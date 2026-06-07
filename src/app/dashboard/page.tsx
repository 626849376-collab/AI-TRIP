"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getCurrentUser, getProfile, getTripPlans, deleteTripPlan, signOut, publishTripToSquare } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ConfirmDialog from "@/components/ConfirmDialog";
import SkeletonLoader from "@/components/SkeletonLoader";
import EmptyState from "@/components/EmptyState";
import {
    MapPin,
    Plus,
    LogOut,
    User,
    Calendar,
    Wallet,
    ArrowRight,
    Loader2,
    Trash2,
    Edit3,
    Download,
    Menu,
    X,
    Globe,
    Upload,
    CheckCircle2,
    Sparkles,
    RefreshCw,
    Calculator,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
    const router = useRouter();
    const { user, profile, setUser, setProfile, clearAuth } = useAuthStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [tripPlans, setTripPlans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; tripId: string | null }>({
        isOpen: false,
        tripId: null,
    });

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

                const plans = await getTripPlans(currentUser.id);
                setTripPlans(plans);
            } catch (error) {
                console.error("Error loading dashboard:", error);
                toast.error("加载失败，请刷新页面重试");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [router, setUser, setProfile]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const plans = await getTripPlans(user!.id);
            setTripPlans(plans);
            toast.success("已刷新");
        } catch (error) {
            toast.error("刷新失败");
        } finally {
            setIsRefreshing(false);
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

    const handlePublishToSquare = async (tripId: string) => {
        setPublishingId(tripId);
        try {
            await publishTripToSquare(tripId);
            setTripPlans((prev) =>
                prev.map((p) =>
                    p.id === tripId ? { ...p, is_public: true } : p
                )
            );
            toast.success(t.dashboard.publishSuccess || "行程已发布到旅行广场");
        } catch (error: any) {
            toast.error(t.dashboard.publishFailed || "发布失败");
        } finally {
            setPublishingId(null);
        }
    };

    const handleDeleteTrip = async () => {
        if (!deleteConfirm.tripId) return;
        try {
            await deleteTripPlan(deleteConfirm.tripId);
            setTripPlans((prev) => prev.filter((p) => p.id !== deleteConfirm.tripId));
            toast.success(t.dashboard.deleteSuccess);
        } catch (error: any) {
            toast.error(t.dashboard.deleteFailed);
        } finally {
            setDeleteConfirm({ isOpen: false, tripId: null });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="skeleton skeleton-title" style={{ width: "40%" }} />
                        <div className="skeleton skeleton-text" style={{ width: "60%", marginTop: 8 }} />
                    </div>
                    <SkeletonLoader type="card" count={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, tripId: null })}
                onConfirm={handleDeleteTrip}
                title={t.dashboard.deleteConfirm}
                message="此操作不可撤销，删除后无法恢复"
                confirmText="确认删除"
                cancelText="取消"
                variant="danger"
            />

            {/* Navigation */}
            <nav className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 touch-target"
                        >
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                Travel Planner
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors touch-target"
                                title="刷新"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                                <span className="text-sm">刷新</span>
                            </button>
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
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors icon-button"
                                title="刷新"
                            >
                                <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? "animate-spin" : ""}`} />
                            </button>
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
                        <div className="md:hidden py-4 border-t animate-fade-in">
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 page-enter">
                {/* Welcome Section */}
                <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {t.dashboard.welcome.replace("{name}", profile?.name || t.dashboard.traveler)}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {t.dashboard.welcomeDesc}
                            </p>
                        </div>
                        <Link
                            href="/square"
                            className="gradient-primary text-white px-5 sm:px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 w-full sm:w-auto justify-center touch-target shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            {t.dashboard.createNew}
                        </Link>
                    </div>
                </div>

                {/* Trip Plans */}
                <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                            {t.dashboard.myPlans}
                        </h2>
                        <span className="text-sm text-gray-400">
                            共 {tripPlans.length} 个计划
                        </span>
                    </div>

                    {tripPlans.length === 0 ? (
                        <EmptyState
                            icon="map"
                            title={t.dashboard.noPlans}
                            description={t.dashboard.noPlansDesc}
                            action={{
                                label: t.dashboard.createPlan,
                                href: "/square",
                            }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stagger-enter">
                            {tripPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="bg-white rounded-2xl shadow-sm border hover:shadow-md hover:border-emerald-200 transition-all duration-300 overflow-hidden group"
                                >
                                    {/* Card Header Gradient */}
                                    <div className="h-2 bg-gradient-to-r from-emerald-400 to-green-500" />

                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate group-hover:text-emerald-600 transition-colors">
                                                    {plan.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {plan.destination}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                                                <span className="truncate">
                                                    {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Wallet className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                                                <span>
                                                    {t.dashboard.budget}：{formatCurrency(plan.budget)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/trip/${plan.id}`}
                                                className="flex-1 text-center text-sm bg-emerald-50 text-emerald-700 py-2.5 rounded-lg hover:bg-emerald-100 transition-colors font-medium touch-target"
                                            >
                                                <span className="flex items-center justify-center gap-1">
                                                    {t.dashboard.viewDetails}
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </span>
                                            </Link>
                                            {!plan.is_public ? (
                                                <button
                                                    onClick={() => handlePublishToSquare(plan.id)}
                                                    disabled={publishingId === plan.id}
                                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-colors disabled:opacity-50 rounded-xl hover:bg-emerald-50 icon-button"
                                                    title={t.dashboard.publishToSquare || "发布到旅行广场"}
                                                >
                                                    {publishingId === plan.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4" />
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="w-10 h-10 flex items-center justify-center text-emerald-500" title={t.dashboard.published || "已发布"}>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setDeleteConfirm({ isOpen: true, tripId: plan.id })}
                                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 icon-button"
                                                title={t.dashboard.deleteConfirm}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Travel Square Section */}
                <div className="mt-8 sm:mt-12">
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1">
                        <div className="relative bg-white rounded-[calc(1.5rem-4px)] p-6 sm:p-8">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-bl-full" />
                            <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full" />

                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                                    <div className="flex items-start gap-4 sm:gap-5">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                                                <span className="text-white text-[10px] sm:text-xs font-bold">✓</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                {t.square.title}
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-md">
                                                {t.square.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/square"
                                        className="group relative inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto justify-center touch-target"
                                    >
                                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
                                        <span className="text-sm sm:text-base">{t.square.title}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </Link>
                                </div>

                                {/* Feature badges */}
                                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs sm:text-sm">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                        {t.square.popular}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm">
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                        {t.square.latest}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-pink-50 text-pink-700 rounded-full text-xs sm:text-sm">
                                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                                        {t.square.likes}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs sm:text-sm">
                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                        {t.square.favorites}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Travel Calculator Section */}
                <div className="mt-6 sm:mt-8 mb-8">
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-1">
                        <div className="relative bg-white rounded-[calc(1.5rem-4px)] p-6 sm:p-8">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-bl-full" />
                            <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-gradient-to-tr from-amber-100/50 to-transparent rounded-tr-full" />

                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                                    <div className="flex items-start gap-4 sm:gap-5">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-200">
                                                <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                                                <span className="text-white text-[10px] sm:text-xs font-bold">✓</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                                {t.calculator.title}
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-md">
                                                {t.calculator.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/calculator"
                                        className="group relative inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto justify-center touch-target"
                                    >
                                        <Calculator className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                                        <span className="text-sm sm:text-base">{t.calculator.title}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </Link>
                                </div>

                                {/* Feature badges */}
                                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs sm:text-sm">
                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                        {t.calculator.transportCost}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs sm:text-sm">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                        {t.calculator.accommodationCost}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs sm:text-sm">
                                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                                        {t.calculator.foodCost}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        {t.calculator.attractionCost}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}