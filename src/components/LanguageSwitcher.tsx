"use client";

import { useLanguageStore } from "@/store/useLanguageStore";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
    const { language, toggleLanguage } = useLanguageStore();

    const getLabel = () => {
        switch (language) {
            case "zh":
                return "한국어";
            case "ko":
                return "English";
            case "en":
                return "中文";
            default:
                return "中文";
        }
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors text-xs sm:text-sm font-medium touch-target"
            title={getLabel()}
        >
            <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{getLabel()}</span>
        </button>
    );
}