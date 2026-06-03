"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getCurrentUser, getProfile, getTripPlans, deleteTripPlan, signOut, publishTripToSquare } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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

                const plans = await getTripPlans(currentUser.id);
                setTripPlans(plans);
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [router, setUser, setProfile]);

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

    const [publishingId, setPublishingId] = useState<string | null>(null);

    const handlePublishToSquare = async (tripId: string) => {
        setPublishingId(tripId);
        try {
            await publishTripToSquare(tripId);
            setTripPlans((prev) =>
                prev.map((p) =>
                    p.id === tripId ? { ...p, is_public: true } : p
                )
            );
            toast.success(t.dashboard.publishSuccess || "Trip published to Travel Square!");
        } catch (error: any) {
            toast.error(t.dashboard.publishFailed || "Failed to publish trip");
        } finally {
            setPublishingId(null);
        }
    };

    const handleDeleteTrip = async (tripId: string) => {
        if (!confirm(t.dashboard.deleteConfirm)) return;
        try {
            await deleteTripPlan(tripId);
            setTripPlans((prev) => prev.filter((p) => p.id !== tripId));
            toast.success(t.dashboard.deleteSuccess);
        } catch (error: any) {
            toast.error(t.dashboard.deleteFailed);
        }
    };

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
                {/* Welcome Section */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {t.dashboard.welcome.replace("{name}", profile?.name || t.dashboard.traveler)}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {t.dashboard.welcomeDesc}
                            </p>
                        </div>
                        <Link
                            href="/trip/create"
                            className="gradient-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {t.dashboard.createNew}
                        </Link>
                    </div>
                </div>

                {/* Trip Plans */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        {t.dashboard.myPlans}
                    </h2>

                    {tripPlans.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {t.dashboard.noPlans}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {t.dashboard.noPlansDesc}
                            </p>
                            <Link
                                href="/trip/create"
                                className="gradient-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                {t.dashboard.createPlan}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tripPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {plan.title}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {plan.destination}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {formatDate(
                                                        plan.start_date
                                                    )}{" "}
                                                    -{" "}
                                                    {formatDate(plan.end_date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Wallet className="w-4 h-4" />
                                                <span>
                                                    {t.dashboard.budget}：{" "}
                                                    {formatCurrency(
                                                        plan.budget
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/trip/${plan.id}`}
                                                className="flex-1 text-center text-sm bg-primary-50 text-primary-700 py-2 rounded-lg hover:bg-primary-100 transition-colors"
                                            >
                                                {t.dashboard.viewDetails}
                                            </Link>
                                            {!plan.is_public ? (
                                                <button
                                                    onClick={() =>
                                                        handlePublishToSquare(plan.id)
                                                    }
                                                    disabled={publishingId === plan.id}
                                                    className="p-2 text-gray-400 hover:text-emerald-500 transition-colors disabled:opacity-50"
                                                    title={t.dashboard.publishToSquare || "Publish to Travel Square"}
                                                >
                                                    {publishingId === plan.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4" />
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="p-2 text-emerald-500" title={t.dashboard.published || "Published"}>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            )}
                                            <button
                                                onClick={() =>
                                                    handleDeleteTrip(plan.id)
                                                }
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
                <div className="mt-12 mb-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1">
                        <div className="relative bg-white rounded-[calc(1.5rem-4px)] p-8">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-bl-full" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full" />
                            
                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                    <div className="flex items-start gap-5">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                                <Globe className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                                                <span className="text-white text-xs font-bold">✦</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                {t.square.title}
                                            </h2>
                                            <p className="text-gray-500 mt-1 max-w-md">
                                                {t.square.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/square"
                                        className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                        <span>{t.square.title}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </Link>
                                </div>

                                {/* Feature badges */}
                                <div className="flex flex-wrap gap-3 mt-6">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                        {t.square.popular}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                        {t.square.latest}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm">
                                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                                        {t.square.likes}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm">
                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                        {t.square.favorites}
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
