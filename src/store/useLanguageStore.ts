import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "zh" | "ko" | "en";

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: "zh",
            setLanguage: (lang) => set({ language: lang }),
            toggleLanguage: () =>
                set((state) => {
                    const languages: Language[] = ["zh", "ko", "en"];
                    const currentIndex = languages.indexOf(state.language);
                    const nextIndex = (currentIndex + 1) % languages.length;
                    return { language: languages[nextIndex] };
                }),
        }),
        {
            name: "language-storage",
        }
    )
);
