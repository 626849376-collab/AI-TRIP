"use client";

import { useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import { supabase, toggleTripVisibility, publishTripToSquare } from "@/lib/supabase";
import {
    Share2,
    Link,
    Globe,
    Lock,
    Check,
    Loader2,
    X,
    Copy,
    Upload,
    CheckCircle2,
    Sparkles,
    Leaf,
    Users,
} from "lucide-react";
import toast from "react-hot-toast";

interface ShareModalProps {
    tripId: string;
    isPublic: boolean;
    onClose: () => void;
    onVisibilityChange: (isPublic: boolean) => void;
}

export default function ShareModal({
    tripId,
    isPublic,
    onClose,
    onVisibilityChange,
}: ShareModalProps) {
    const { language } = useLanguageStore();
    const t = translations[language];
    const [isGenerating, setIsGenerating] = useState(false);
    const [shareLink, setShareLink] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);
    const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const generateShareLink = async () => {
        setIsGenerating(true);
        try {
            if (!isPublic) {
                const newVisibility = await toggleTripVisibility(tripId);
                onVisibilityChange(newVisibility);
            }
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/trip/${tripId}`;
            setShareLink(link);
            toast.success(t.share.linkGenerated);
        } catch (error) {
            console.error("Error generating share link:", error);
            toast.error("生成链接失败");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setIsCopied(true);
            toast.success(t.share.linkCopied);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error("Error copying to clipboard:", error);
        }
    };

    const handleToggleVisibility = async () => {
        setIsTogglingVisibility(true);
        try {
            const newVisibility = await toggleTripVisibility(tripId);
            onVisibilityChange(newVisibility);
            toast.success(newVisibility ? "已发布到旅行广场" : "已设为私密");
        } catch (error) {
            console.error("Error toggling visibility:", error);
            toast.error("操作失败，请检查网络连接");
        } finally {
            setIsTogglingVisibility(false);
        }
    };

    const handlePublishToSquare = async () => {
        setIsPublishing(true);
        try {
            await publishTripToSquare(tripId);
            onVisibilityChange(true);
            toast.success("🎉 行程已成功发布到旅行广场！");
        } catch (error) {
            console.error("Error publishing to square:", error);
            toast.error("发布失败，请稍后重试");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-200/30">
                            <Share2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {t.share.title}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                与社区分享你的旅行计划
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl hover:bg-emerald-50 flex items-center justify-center transition-all icon-button"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Publish to Square - Main Action */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPublic ? 'bg-emerald-100' : 'bg-emerald-500'}`}>
                                {isPublic ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <Upload className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {isPublic ? "已发布到旅行广场" : "发布到旅行广场"}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {isPublic
                                        ? "你的行程已对所有人可见"
                                        : "让其他旅行者发现你的精彩行程"}
                                </p>
                            </div>
                            {isPublic && (
                                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 rounded-full">
                                    <Globe className="w-3 h-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-700">公开</span>
                                </div>
                            )}
                        </div>

                        {!isPublic ? (
                            <button
                                onClick={handlePublishToSquare}
                                disabled={isPublishing}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                            >
                                {isPublishing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        发布中...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        发布到旅行广场
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleToggleVisibility}
                                disabled={isTogglingVisibility}
                                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-emerald-200 text-emerald-700 py-3 rounded-xl font-medium hover:bg-emerald-50 hover:border-emerald-300 transition-all disabled:opacity-50 touch-target"
                            >
                                {isTogglingVisibility ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Lock className="w-5 h-5" />
                                )}
                                设为私密
                            </button>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-emerald-100">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                                <Users className="w-3.5 h-3.5" />
                                <span>对所有人可见</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                                <Leaf className="w-3.5 h-3.5" />
                                <span>绿色出行</span>
                            </div>
                        </div>
                    </div>

                    {/* Generate Share Link */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Link className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-700">分享链接</span>
                        </div>
                        <button
                            onClick={generateShareLink}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-emerald-100 text-emerald-700 py-2.5 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all disabled:opacity-50 touch-target"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Link className="w-5 h-5" />
                            )}
                            <span className="text-sm font-medium">{t.share.generateLink}</span>
                        </button>

                        {shareLink && (
                            <div className="mt-3 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-emerald-200 outline-none"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all icon-button"
                                >
                                    {isCopied ? (
                                        <Check className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                    >
                        {t.modal.close}
                    </button>
                </div>
            </div>
        </div>
    );
}
