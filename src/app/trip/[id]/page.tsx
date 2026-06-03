"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    getCurrentUser,
    getTripPlan,
    getTripDetails,
    deleteTripPlan,
} from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
    MapPin,
    ArrowLeft,
    Loader2,
    Calendar,
    Wallet,
    Download,
    Trash2,
    Sun,
    Moon,
    Coffee,
    Utensils,
    Hotel,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    Route,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import ShareModal from "@/components/ShareModal";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("@/components/RouteMap"), {
    ssr: false,
    loading: () => (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm">Loading map...</p>
        </div>
    ),
});

export default function TripDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user, setUser } = useAuthStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [tripPlan, setTripPlan] = useState<any>(null);
    const [tripDetails, setTripDetails] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedDay, setExpandedDay] = useState<number>(1);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push("/auth/login");
                    return;
                }
                setUser(currentUser);

                const plan = await getTripPlan(params.id as string);
                if (!plan || plan.is_deleted) {
                    toast.error(t.trip.notFound);
                    router.push("/dashboard");
                    return;
                }
                setTripPlan(plan);

                const details = await getTripDetails(params.id as string);
                setTripDetails(details);
            } catch (error) {
                console.error(error);
                toast.error(t.trip.loadFailed);
                router.push("/dashboard");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [params.id, router, setUser]);

    const handleDelete = async () => {
        if (!confirm(t.trip.deleteConfirm)) return;
        try {
            await deleteTripPlan(params.id as string);
            toast.success(t.trip.deleteSuccess);
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(t.trip.deleteFailed);
        }
    };

    const handleExportPDF = () => {
        toast.success(t.trip.exportComingSoon);
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
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>{t.trip.back}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-600" />
                            <span className="font-semibold">
                                {tripPlan?.destination}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExportPDF}
                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                title={t.trip.exportPDF}
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title={t.trip.delete}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </header>

            {/* Trip Info */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {tripPlan?.title}
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Calendar className="w-5 h-5 text-primary-500" />
                            <div>
                                <p className="text-sm text-gray-500">{t.trip.date}</p>
                                <p className="font-medium">
                                    {formatDate(tripPlan?.start_date)} -{" "}
                                    {formatDate(tripPlan?.end_date)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <MapPin className="w-5 h-5 text-primary-500" />
                            <div>
                                <p className="text-sm text-gray-500">{t.trip.destination}</p>
                                <p className="font-medium">
                                    {tripPlan?.destination}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Wallet className="w-5 h-5 text-primary-500" />
                            <div>
                                <p className="text-sm text-gray-500">{t.trip.budget}</p>
                                <p className="font-medium">
                                    {formatCurrency(tripPlan?.budget)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Day by Day Itinerary */}
                {tripDetails.map((detail: any) => (
                    <div
                        key={detail.id}
                        className="bg-white rounded-2xl shadow-sm border mb-4 overflow-hidden"
                    >
                        <button
                            onClick={() =>
                                setExpandedDay(
                                    expandedDay === detail.day_number
                                        ? -1
                                        : detail.day_number
                                )
                            }
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <Sun className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900">
                                        {t.trip.day.replace("{day}", String(detail.day_number))}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(detail.content?.date)}
                                    </p>
                                </div>
                            </div>
                            {expandedDay === detail.day_number ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {expandedDay === detail.day_number && (
                            <div className="px-6 pb-6 animate-fade-in">
                                {/* Route Map */}
                                <div className="mb-6">
                                    <RouteMap
                                        activities={detail.content?.activities || []}
                                        destination={tripPlan?.destination || ""}
                                        dayNumber={detail.day_number}
                                    />
                                </div>

                                {/* Activities Timeline */}
                                <div className="space-y-4 mb-6">
                                    {detail.content?.activities?.map(
                                        (activity: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="flex gap-4"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full bg-primary-500 mt-1.5" />
                                                    {idx <
                                                        detail.content
                                                            .activities
                                                            .length -
                                                        1 && (
                                                            <div className="w-0.5 flex-1 bg-gray-200" />
                                                        )}
                                                </div>
                                                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-primary-600">
                                                            {activity.time}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {activity.duration}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 mb-1">
                                                        {activity.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {activity.description}
                                                    </p>
                                                    {activity.location && (
                                                        <p className="text-xs text-gray-400">
                                                            📍 {activity.location}
                                                        </p>
                                                    )}
                                                    <p className="text-sm font-medium text-primary-600 mt-1">
                                                        {formatCurrency(
                                                            activity.cost
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Meals */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Coffee className="w-4 h-4 text-orange-500" />
                                            <span className="text-sm font-medium text-orange-700">
                                                {t.trip.breakfast}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {detail.content?.meals?.breakfast}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Utensils className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium text-green-700">
                                                {t.trip.lunch}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {detail.content?.meals?.lunch}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Moon className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm font-medium text-purple-700">
                                                {t.trip.dinner}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {detail.content?.meals?.dinner}
                                        </p>
                                    </div>
                                </div>

                                {/* Hotel */}
                                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hotel className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-blue-700">
                                            {t.trip.hotel}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {detail.content?.hotel}
                                    </p>
                                </div>

                                {/* Day Budget */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                        {t.trip.dayBudget}
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t.trip.transportation}
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {formatCurrency(
                                                    detail.content?.budget
                                                        ?.transportation
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t.trip.meals}
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {formatCurrency(
                                                    detail.content?.budget?.meals
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t.trip.tickets}
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {formatCurrency(
                                                    detail.content?.budget?.tickets
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t.trip.shopping}
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {formatCurrency(
                                                    detail.content?.budget
                                                        ?.shopping
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tips */}
                                {detail.content?.tips?.length > 0 && (
                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm font-medium text-yellow-700">
                                                {t.trip.tips}
                                            </span>
                                        </div>
                                        <ul className="space-y-1">
                                            {detail.content.tips.map(
                                                (tip: string, idx: number) => (
                                                    <li
                                                        key={idx}
                                                        className="text-sm text-gray-700 flex items-start gap-2"
                                                    >
                                                        <span className="text-yellow-500 mt-0.5">
                                                            •
                                                        </span>
                                                        {tip}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
