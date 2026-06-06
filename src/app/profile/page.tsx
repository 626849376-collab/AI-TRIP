"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getProfile, updateProfile, signOut } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
    MapPin,
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Camera,
    LogOut,
    Save,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const router = useRouter();
    const { user, profile, setUser, setProfile, clearAuth } = useAuthStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
                setName(userProfile?.name || "");
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [router, setUser, setProfile]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error(t.profile.nameRequired);
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile(user!.id, { name });
            setProfile({ ...profile!, name });
            toast.success(t.profile.saveSuccess);
        } catch (error: any) {
            toast.error(t.profile.saveFailed);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            clearAuth();
            router.push("/");
            toast.success(t.profile.signOutSuccess);
        } catch (error: any) {
            toast.error(t.profile.signOutFailed);
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
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 touch-target"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">{t.profile.back}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-600" />
                            <span className="font-semibold text-sm sm:text-base">{t.profile.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors touch-target"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.profile.signOut}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Profile Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-6 sm:mb-8">
                        <div className="relative mb-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors icon-button">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                            {profile?.name || t.profile.name}
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm">{profile?.email}</p>
                    </div>

                    {/* Edit Form */}
                    <div className="space-y-5 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.profile.name}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.profile.email}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={profile?.email || ""}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {t.profile.emailNote}
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full gradient-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-target"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t.profile.saving}
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {t.profile.save}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}