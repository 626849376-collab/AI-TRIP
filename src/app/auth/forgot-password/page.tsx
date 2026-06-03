"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/supabase";
import { MapPin, Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { language } = useLanguageStore();
    const t = translations[language];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error(t.forgotPassword.emailRequired);
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(email);
            setIsSent(true);
            toast.success(t.forgotPassword.sentSuccess);
        } catch (error: any) {
            toast.error(error.message || t.forgotPassword.sendFailed);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 mb-4"
                    >
                        <MapPin className="w-8 h-8 text-primary-600" />
                        <span className="text-2xl font-bold text-gray-900">
                            Travel Planner
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t.forgotPassword.title}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {t.forgotPassword.description}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {isSent ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {t.forgotPassword.sentTitle}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {t.forgotPassword.sentDescription}
                            </p>
                            <Link
                                href="/auth/login"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                {t.forgotPassword.backToLogin}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.forgotPassword.email}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder={t.forgotPassword.placeholder}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full gradient-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t.forgotPassword.sending}
                                    </>
                                ) : (
                                    t.forgotPassword.send
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {t.forgotPassword.backToLogin}
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
