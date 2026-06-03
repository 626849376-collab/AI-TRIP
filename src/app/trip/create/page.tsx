"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getProfile, createTripPlan, saveTripDetails } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import { generateTripPlan } from "@/services/ai-service";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
    MapPin,
    ArrowLeft,
    Loader2,
    Sparkles,
    Calendar,
    Wallet,
    Plane,
    Train,
    Bus,
    Car,
    Building2,
    Home,
    Hotel,
    Tent,
    Bed,
    X,
    Check,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    INTEREST_TAGS,
    TRANSPORT_OPTIONS,
    ACCOMMODATION_OPTIONS,
    CreateTripInput,
} from "@/types";

export default function CreateTripPage() {
    const router = useRouter();
    const { user, setUser, setProfile } = useAuthStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        departureCity: "",
        destination: "",
        startDate: "",
        endDate: "",
        budget: "",
        interests: [] as string[],
        transportPreference: "flight",
        accommodationPreference: "comfortable",
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
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [router, setUser, setProfile]);

    const toggleInterest = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            interests: prev.interests.includes(tag)
                ? prev.interests.filter((t) => t !== tag)
                : [...prev.interests, tag],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.departureCity ||
            !formData.destination ||
            !formData.startDate ||
            !formData.endDate ||
            !formData.budget
        ) {
            toast.error(t.tripCreate.required);
            return;
        }

        if (formData.interests.length === 0) {
            toast.error(t.tripCreate.selectInterest);
            return;
        }

        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            toast.error(t.tripCreate.dateError);
            return;
        }

        setIsGenerating(true);
        try {
            const input: CreateTripInput = {
                departureCity: formData.departureCity,
                destination: formData.destination,
                startDate: formData.startDate,
                endDate: formData.endDate,
                budget: parseInt(formData.budget),
                interests: formData.interests,
                transportPreference: formData.transportPreference,
                accommodationPreference: formData.accommodationPreference,
            };

            // Generate AI trip plan
            const aiResponse = await generateTripPlan(input);

            if (!aiResponse.success) {
                throw new Error(t.tripCreate.failed);
            }

            // Save trip plan to database
            const tripPlan = await createTripPlan({
                user_id: user!.id,
                title: `${formData.destination}${t.tripCreate.tripSuffix}`,
                destination: formData.destination,
                start_date: formData.startDate,
                end_date: formData.endDate,
                budget: parseInt(formData.budget),
            });

            // Save trip details
            const details = aiResponse.data.days.map((day, index) => ({
                day_number: index + 1,
                content: day,
            }));

            await saveTripDetails(tripPlan.id, details);

            toast.success(t.tripCreate.success);
            router.push(`/trip/${tripPlan.id}`);
        } catch (error: any) {
            toast.error(error.message || t.tripCreate.failed);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const transportIcons: Record<string, React.ReactNode> = {
        flight: <Plane className="w-4 h-4" />,
        train: <Train className="w-4 h-4" />,
        bus: <Bus className="w-4 h-4" />,
        "self-drive": <Car className="w-4 h-4" />,
    };

    const accommodationIcons: Record<string, React.ReactNode> = {
        budget: <Bed className="w-4 h-4" />,
        comfortable: <Building2 className="w-4 h-4" />,
        luxury: <Hotel className="w-4 h-4" />,
        hostel: <Home className="w-4 h-4" />,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>{t.tripCreate.back}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-600" />
                            <span className="font-semibold">{t.tripCreate.title}</span>
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Departure & Destination */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.tripCreate.departureCity} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.departureCity}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            departureCity: e.target.value,
                                        }))
                                    }
                                    placeholder={t.tripCreate.placeholderDeparture}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.tripCreate.destination} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.destination}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            destination: e.target.value,
                                        }))
                                    }
                                    placeholder={t.tripCreate.placeholderDestination}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.tripCreate.startDate} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                startDate: e.target.value,
                                            }))
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.tripCreate.endDate} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                endDate: e.target.value,
                                            }))
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.tripCreate.budget} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            budget: e.target.value,
                                        }))
                                    }
                                    placeholder={t.tripCreate.placeholderBudget}
                                    min="0"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Interests */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t.tripCreate.interests} <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleInterest(tag)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.interests.includes(tag)
                                            ? "bg-primary-500 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {formData.interests.includes(tag) && (
                                            <Check className="w-3 h-3 inline mr-1" />
                                        )}
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Transport Preference */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t.tripCreate.transportPreference}
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {TRANSPORT_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                transportPreference:
                                                    option.value,
                                            }))
                                        }
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${formData.transportPreference ===
                                            option.value
                                            ? "border-primary-500 bg-primary-50 text-primary-700"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                            }`}
                                    >
                                        {transportIcons[option.value]}
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Accommodation Preference */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t.tripCreate.accommodationPreference}
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {ACCOMMODATION_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                accommodationPreference:
                                                    option.value,
                                            }))
                                        }
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${formData.accommodationPreference ===
                                            option.value
                                            ? "border-primary-500 bg-primary-50 text-primary-700"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                            }`}
                                    >
                                        {accommodationIcons[option.value]}
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="w-full gradient-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t.tripCreate.generating}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    {t.tripCreate.generate}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}