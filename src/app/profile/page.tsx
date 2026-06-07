"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getProfile, updateProfile, signOut, deleteAccount } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ConfirmDialog from "@/components/ConfirmDialog";
import SkeletonLoader from "@/components/SkeletonLoader";
import {
    ArrowLeft,
    Loader2,
    Leaf,
    User,
    Mail,
    Camera,
    LogOut,
    Save,
    CheckCircle2,
    Sparkles,
    Shield,
    Clock,
    Fingerprint,
    Trash2,
    AlertTriangle,
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
                <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <SkeletonLoader type="profile" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
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
            <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 sticky top-0 z-50">
                <div className="max-w-lg mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-all duration-300 touch-target group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline font-medium">{t.profile.back}</span>
                        </Link>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                                <Leaf className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                {t.profile.title}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <button
                                onClick={() => setShowSignOutConfirm(true)}
                                className="flex items-center gap-1.5 text-sm text-emerald-500 hover:text-red-500 transition-all duration-300 touch-target px-3 py-2 rounded-xl hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.profile.signOut}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Profile Content */}
            <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-10 page-enter space-y-5 sm:space-y-6">
                {/* Profile Card */}
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg shadow-emerald-100/50 border border-emerald-100/50 p-6 sm:p-8 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-500 overflow-hidden">
                    {/* Decorative top gradient line */}
                    <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-full opacity-60" />

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8 sm:mb-10">
                        <div className="relative mb-5 group">
                            {/* Decorative ring */}
                            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-200 via-green-200 to-emerald-300 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:shadow-xl group-hover:shadow-emerald-200/50 transition-all duration-500 group-hover:scale-105">
                                <User className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                            </div>
                            <button
                                className="absolute bottom-0 right-0 w-9 h-9 bg-white border-2 border-emerald-400 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:border-emerald-500 hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-md icon-button"
                                title="更换头像"
                                onClick={() => toast.success("头像功能即将上线")}
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            {/* Online status indicator */}
                            <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1.5">
                            {profile?.name || t.profile.name}
                        </h1>
                        <div className="flex items-center gap-1.5 text-emerald-600/70 text-sm">
                            <Mail className="w-4 h-4" />
                            <span>{profile?.email}</span>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="space-y-6 sm:space-y-7">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-emerald-500" />
                                {t.profile.name}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="请输入您的昵称"
                                    className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all duration-300 placeholder:text-emerald-300 text-gray-700 hover:border-emerald-300"
                                    maxLength={50}
                                />
                                {name.length > 0 && (
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                                        {name.length}/50
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-emerald-500" />
                                {t.profile.email}
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={profile?.email || ""}
                                    disabled
                                    className="w-full px-4 py-3 border border-emerald-100 rounded-xl bg-emerald-50/30 text-emerald-600 cursor-not-allowed"
                                />
                                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                            </div>
                            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                {t.profile.emailNote}
                            </p>
                        </div>

                        {/* Save button with unsaved changes indicator */}
                        <div className="pt-2">
                            {hasChanges && (
                                <p className="text-xs text-emerald-600 mb-3 flex items-center gap-1.5 animate-slide-up">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    您有未保存的更改
                                </p>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 touch-target shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/50 hover:-translate-y-0.5 active:translate-y-0"
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
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg shadow-emerald-100/50 border border-emerald-100/50 p-6 sm:p-8 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-500">
                    <h2 className="text-base sm:text-lg font-bold text-emerald-800 mb-6 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        账户信息
                    </h2>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-emerald-50/50 transition-colors">
                            <div className="flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-emerald-600">注册时间</span>
                            </div>
                            <span className="text-sm text-gray-700 font-semibold">
                                {profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString("zh-CN")
                                    : "未知"}
                            </span>
                        </div>
                        <div className="border-t border-emerald-100/50 mx-4" />
                        <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-emerald-50/50 transition-colors">
                            <div className="flex items-center gap-2.5">
                                <Shield className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-emerald-600">账户状态</span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                </span>
                                正常
                            </span>
                        </div>
                        <div className="border-t border-emerald-100/50 mx-4" />
                        <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-emerald-50/50 transition-colors">
                            <div className="flex items-center gap-2.5">
                                <Fingerprint className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-emerald-600">用户 ID</span>
                            </div>
                            <span className="text-sm text-emerald-500 font-mono bg-emerald-50/50 px-3 py-1 rounded-lg border border-emerald-100/50">
                                {user?.id?.slice(0, 12)}...
                            </span>
                        </div>
                    </div>
                </div>

                {/* Delete Account Section */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg shadow-emerald-100/50 border border-red-100/50 p-6 sm:p-8 hover:shadow-xl hover:shadow-red-100/30 transition-all duration-500">
                    <h2 className="text-base sm:text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        危险区域
                    </h2>
                    <p className="text-sm text-gray-500 mb-4 ml-9">
                        删除账号后，所有数据将被永久清除，此操作不可撤销。
                    </p>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-300 font-medium touch-target group"
                    >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        删除此账号
                    </button>
                </div>

                {/* Delete Account Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={async () => {
                        setIsDeleting(true);
                        try {
                            await deleteAccount(user!.id);
                            clearAuth();
                            router.push("/");
                            toast.success("账号已成功删除");
                        } catch (error: any) {
                            toast.error("删除账号失败: " + (error?.message || "未知错误"));
                        } finally {
                            setIsDeleting(false);
                            setShowDeleteConfirm(false);
                        }
                    }}
                    title="确认删除账号"
                    message="此操作将永久删除您的账号、所有旅行计划、点赞和收藏数据，且无法恢复。确定要继续吗？"
                    confirmText={isDeleting ? "删除中..." : "确认删除"}
                    cancelText="取消"
                    variant="danger"
                    isLoading={isDeleting}
                />

                {/* Footer */}
                <div className="text-center py-4">
                    <p className="text-xs text-emerald-300 flex items-center justify-center gap-1.5">
                        <Leaf className="w-3 h-3" />
                        AI Mini Travel Planner · 绿色出行
                    </p>
                </div>
            </main>
        </div>
    );
}