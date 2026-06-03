"use client";

import { useLanguageStore, Language } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languages: { code: Language; label: string; flag: string }[] = [
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
];

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentLang = languages.find((l) => l.code === language);
    const t = translations[language];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
                title={t.language.label}
            >
                <Globe className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">
                    {currentLang?.flag} {currentLang?.label}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${language === lang.code
                                    ? "bg-primary-50 text-primary-700 font-medium"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                            {language === lang.code && (
                                <span className="ml-auto text-primary-600">
                                    ✓
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
