"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import {
    MapPin,
    Sparkles,
    Calendar,
    Wallet,
    ArrowRight,
    Globe,
    Shield,
    Download,
    Menu,
    X,
    Compass,
    Sun,
    Coffee,
    Camera,
    XCircle,
    Languages,
    Calculator,
} from "lucide-react";

export default function HomePage() {
    const router = useRouter();
    const { user, setUser, setLoading } = useAuthStore();
    const { language, toggleLanguage } = useLanguageStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

    const t = translations[language];

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, [setUser, setLoading]);

    const featureIcons = [Sparkles, Calendar, Wallet, Globe, Shield, Download];
    const featureColors = [
        "from-emerald-400 to-green-500",
        "from-green-400 to-emerald-500",
        "from-emerald-400 to-teal-500",
        "from-teal-400 to-green-500",
        "from-green-400 to-emerald-500",
        "from-emerald-400 to-green-500",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
            {/* Static background decoration (optimized for mobile) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-72 h-72">
                    <div className="absolute inset-0 rounded-full bg-emerald-300/5" />
                </div>
                <div className="absolute top-3/4 right-1/4 w-96 h-96">
                    <div className="absolute inset-0 rounded-full bg-green-300/5" />
                </div>
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64">
                    <div className="absolute inset-0 rounded-full bg-emerald-200/8" />
                </div>
                <div className="absolute top-1/2 right-1/3 w-80 h-80">
                    <div className="absolute inset-0 rounded-full bg-teal-300/5" />
                </div>

                {/* Static wave SVG at bottom (no animation) */}
                <div className="absolute bottom-0 left-0 right-0 h-48 opacity-30">
                    <svg
                        className="absolute bottom-0 w-full h-full text-emerald-100"
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                    >
                        <path
                            fill="currentColor"
                            d="M0,160 C320,280 480,40 720,160 C960,280 1120,40 1440,160 L1440,320 L0,320 Z"
                        />
                    </svg>
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-emerald-50/50" />
            </div>

            {/* Feature Detail Modal */}
            {selectedFeature !== null && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedFeature(null)}
                >
                    <div
                        className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 m-4 animate-slide-up modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedFeature(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors icon-button"
                        >
                            <XCircle className="w-5 h-5 text-emerald-600" />
                        </button>
                        <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${featureColors[selectedFeature]} flex items-center justify-center mb-5`}
                        >
                            {(() => {
                                const Icon = featureIcons[selectedFeature];
                                return <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />;
                            })()}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                            {t.features.items[selectedFeature].title}
                        </h3>
                        <p className="text-emerald-800/60 leading-relaxed text-base sm:text-lg mb-6">
                            {t.features.items[selectedFeature].detail}
                        </p>

                        {/* Benefits List */}
                        <div className="space-y-3 mb-6">
                            <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">
                                {t.features.keyBenefits}
                            </h4>
                            <div className="space-y-2">
                                {t.features.items[selectedFeature].benefits.map((benefit, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
                                    >
                                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${featureColors[selectedFeature]} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-emerald-800/80 text-sm leading-relaxed">
                                            {benefit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedFeature(null)}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300 touch-target"
                        >
                            {t.modal.close}
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 border-b border-emerald-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            href="/"
                            className="flex items-center gap-2 group touch-target"
                        >
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all duration-300">
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                Travel Planner
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            <a
                                href="#features"
                                className="text-emerald-700/70 hover:text-emerald-600 transition-colors font-medium"
                            >
                                {t.nav.features}
                            </a>
                            <a
                                href="#about"
                                className="text-emerald-700/70 hover:text-emerald-600 transition-colors font-medium"
                            >
                                {t.nav.about}
                            </a>
                            <Link
                                href="/calculator"
                                className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 transition-colors font-medium"
                            >
                                <Calculator className="w-4 h-4" />
                                {t.calculator?.title || "旅游计算器"}
                            </Link>

                            {/* Language Toggle */}
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-sm font-medium touch-target"
                            >
                                <Languages className="w-4 h-4" />
                                {language === "zh" ? "한국어" : language === "ko" ? "English" : "中文"}
                            </button>

                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300 touch-target"
                                >
                                    {t.nav.dashboard}
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/auth/login"
                                        className="text-emerald-700/70 hover:text-emerald-600 transition-colors font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-50 touch-target"
                                    >
                                        {t.nav.login}
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300 touch-target"
                                    >
                                        {t.nav.register}
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-2 md:hidden">
                            <button
                                onClick={toggleLanguage}
                                className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors icon-button"
                                title={language === "zh" ? "한국어" : language === "ko" ? "English" : "中文"}
                            >
                                <Languages className="w-5 h-5 text-emerald-600" />
                            </button>
                            <button
                                className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors icon-button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? (
                                    <X className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <Menu className="w-5 h-5 text-emerald-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t border-emerald-100 animate-fade-in">
                            <div className="flex flex-col gap-2">
                                <a
                                    href="#features"
                                    className="text-emerald-700 hover:bg-emerald-50 rounded-xl px-4 py-3 transition-colors touch-target"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t.nav.features}
                                </a>
                                <a
                                    href="#about"
                                    className="text-emerald-700 hover:bg-emerald-50 rounded-xl px-4 py-3 transition-colors touch-target"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t.nav.about}
                                </a>
                                <Link
                                    href="/calculator"
                                    className="flex items-center gap-2 text-orange-600 hover:bg-orange-50 rounded-xl px-4 py-3 transition-colors touch-target"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Calculator className="w-5 h-5" />
                                    <span>{t.calculator?.title || "旅游计算器"}</span>
                                </Link>
                                {user ? (
                                    <Link
                                        href="/dashboard"
                                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-3 rounded-xl text-center font-medium mt-2 touch-target"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {t.nav.dashboard}
                                    </Link>
                                ) : (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <Link
                                            href="/auth/login"
                                            className="text-center text-emerald-700 hover:bg-emerald-50 rounded-xl px-4 py-3 transition-colors touch-target"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {t.nav.login}
                                        </Link>
                                        <Link
                                            href="/auth/register"
                                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-3 rounded-xl text-center font-medium touch-target"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {t.nav.register}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {t.hero.badge}
                        </div>
                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
                            <span className="text-gray-900">
                                {t.hero.title1}
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 bg-clip-text text-transparent">
                                {t.hero.title2}
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl text-emerald-800/60 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                            {t.hero.description}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-base sm:text-lg font-medium hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300 inline-flex items-center gap-2 w-full sm:w-auto justify-center touch-target"
                                >
                                    {t.hero.start}
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/register"
                                        className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-base sm:text-lg font-medium hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300 inline-flex items-center gap-2 w-full sm:w-auto justify-center touch-target"
                                    >
                                        {t.hero.cta}
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        className="text-emerald-700 bg-white/80 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-base sm:text-lg font-medium border border-emerald-200 hover:bg-white hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 w-full sm:w-auto text-center touch-target"
                                    >
                                        {t.hero.login}
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Floating icons decoration */}
                        <div className="hidden lg:block mt-16 relative">
                            <div className="flex justify-center gap-6">
                                {[Compass, Sun, Coffee, Camera].map(
                                    (Icon, i) => (
                                        <div
                                            key={i}
                                            className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-100 flex items-center justify-center shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300"
                                            style={{
                                                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                                                animationDelay: `${i * 0.3}s`,
                                            }}
                                        >
                                            <Icon className="w-6 h-6 text-emerald-500" />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 sm:py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                {t.features.title}
                            </span>
                        </h2>
                        <p className="text-base sm:text-lg text-emerald-800/60 max-w-2xl mx-auto px-4 sm:px-0">
                            {t.features.subtitle}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {t.features.items.map((feature, index) => {
                            const Icon = featureIcons[index];
                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedFeature(index)}
                                    className="group relative p-6 sm:p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-emerald-100 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-500 text-left w-full touch-target"
                                >
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative z-10">
                                        <div
                                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${featureColors[index]} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                                        >
                                            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-emerald-800/60 leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <div className="mt-3 sm:mt-4 flex items-center gap-1 text-emerald-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>
                                                {t.features.viewDetails}
                                            </span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16 sm:py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                {t.about.title}
                            </span>
                        </h2>
                        <p className="text-base sm:text-lg text-emerald-800/60 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                            {t.about.description}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        {t.about.stats.map((stat, index) => (
                            <div
                                key={index}
                                className="p-6 sm:p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-emerald-100 text-center hover:shadow-xl hover:shadow-emerald-100/50 hover:border-emerald-300 transition-all duration-300"
                            >
                                <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm sm:text-base text-emerald-700/70 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-24 relative">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 relative overflow-hidden">
                        <div className="absolute inset-0">
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                                {t.cta.title}
                            </h2>
                            <p className="text-emerald-100 mb-6 sm:mb-8 text-base sm:text-lg max-w-xl mx-auto px-4 sm:px-0">
                                {t.cta.description}
                            </p>
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-base sm:text-lg font-medium hover:shadow-xl hover:shadow-black/10 transition-all duration-300 touch-target"
                                >
                                    {t.cta.dashboard}
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Link>
                            ) : (
                                <Link
                                    href="/auth/register"
                                    className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-base sm:text-lg font-medium hover:shadow-xl hover:shadow-black/10 transition-all duration-300 touch-target"
                                >
                                    {t.cta.button}
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-8 sm:py-12 border-t border-emerald-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group touch-target">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all duration-300">
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base sm:text-lg font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:to-green-500 transition-all duration-300">
                                AI Mini Travel Planner
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-sm font-medium touch-target"
                            >
                                <Languages className="w-4 h-4" />
                                {language === "zh" ? "한국어" : language === "ko" ? "English" : "中文"}
                            </button>
                            <div className="text-emerald-700/50 text-xs sm:text-sm">
                                {t.footer.copyright}
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    );
}