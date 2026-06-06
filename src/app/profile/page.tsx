"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getProfile, updateProfile, signOut } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ConfirmDialog from "@/components/ConfirmDialog";
import SkeletonLoader from "@/components/SkeletonLoader";
import {
    MapPin,
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Camera,
    LogOut,
    Save,
    CheckCircle2,
    AlertCircle,
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
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

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
                toast.error("加载个人信息失败");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [router, setUser, setProfile]);

    // Track changes
    useEffect(() => {
        setHasChanges(name !== (profile?.name || ""));
    }, [name, profile?.name]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error(t.profile.nameRequired);
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile(user!.id, { name });
            setProfile({ ...profile!, name });
            setHasChanges(false);
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
        } finally {
            setShowSignOutConfirm(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && hasChanges) {
            handleSave();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <SkeletonLoader type="profile" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSignOutConfirm}
                onClose={() => setShowSignOutConfirm(false)}
                onConfirm={handleSignOut}
                title="确认退出登录"
                message="退出登录后需要重新登录才能使用所有功能。"
                confirmText="确认退出"
                cancelText="取消"
                variant="warning"
            />

            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
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
                                onClick={() => setShowSignOutConfirm(true)}
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
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 page-enter">
                <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-6 sm:mb-8">
                        <div className="relative mb-4 group">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                            </div>
                            <button
                                className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-primary-500 rounded-full flex items-center justify-center text-primary-500 hover:bg-primary-50 transition-colors shadow-md icon-button"
                                title="更换头像"
                                onClick={() => toast.success("头像功能即将上线")}
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            {/* Online status indicator */}
                            <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                            {profile?.name || t.profile.name}
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm">{profile?.email}</p>
                    </div>

                    {/* Edit Form */}
                    <div className="space-y-5 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t.profile.name}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="请输入您的昵称"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                                    maxLength={50}
                                />
                                {name.length > 0 && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                        {name.length}/50
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {t.profile.emailNote}
                            </p>
                        </div>

                        {/* Save button with unsaved changes indicator */}
                        <div className="pt-2">
                            {hasChanges && (
                                <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    您有未保存的更改
                                </p>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className="w-full gradient-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-target shadow-sm hover:shadow-md"
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
                </div>

                {/* Account Info Section */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 mt-4 sm:mt-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                        账户信息
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">注册时间</span>
                            <span className="text-sm text-gray-900 font-medium">
                                {profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString("zh-CN")
                                    : "未知"}
                            </span>
                        </div>
                        <div className="border-t" />
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">账户状态</span>
                            <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                                正常
                            </span>
                        </div>
                        <div className="border-t" />
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">用户 ID</span>
                            <span className="text-sm text-gray-400 font-mono truncate max-w-[200px]">
                                {user?.id?.slice(0, 12)}...
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}