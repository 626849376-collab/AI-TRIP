"use client";

import { useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import { supabase, toggleTripVisibility } from "@/lib/supabase";
import {
    Share2,
    Link,
    Globe,
    Lock,
    Check,
    Loader2,
    X,
    Copy,
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

    const generateShareLink = async () => {
        setIsGenerating(true);
        try {
            // Generate a unique share link
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/trip/${tripId}`;
            setShareLink(link);
            toast.success(t.share.linkGenerated);
        } catch (error) {
            console.error("Error generating share link:", error);
            toast.error(t.share.linkGenerated);
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
            toast.success(t.share.privacyUpdated);
        } catch (error) {
            console.error("Error toggling visibility:", error);
            toast.error(t.share.privacyUpdated);
        } finally {
            setIsTogglingVisibility(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Share2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {t.share.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Generate Share Link */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <button
                            onClick={generateShareLink}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Link className="w-5 h-5" />
                            )}
                            <span>{t.share.generateLink}</span>
                        </button>

                        {shareLink && (
                            <div className="mt-3 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    {isCopied ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Toggle Visibility */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {isPublic ? (
                                    <Globe className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Lock className="w-5 h-5 text-gray-400" />
                                )}
                                <span className="text-sm font-medium text-gray-700">
                                    {isPublic ? t.share.makePrivate : t.share.makePublic}
                                </span>
                            </div>
                            <button
                                onClick={handleToggleVisibility}
                                disabled={isTogglingVisibility}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? "bg-primary-600" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            {isPublic
                                ? t.share.makePrivate
                                : t.share.makePublic}
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {t.modal.close}
                    </button>
                </div>
            </div>
        </div>
    );
}