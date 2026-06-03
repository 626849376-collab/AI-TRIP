"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getCurrentUser, getProfile } from "@/lib/supabase";

export function useAuth() {
    const router = useRouter();
    const { user, profile, isLoading, setUser, setProfile, setLoading, clearAuth } = useAuthStore();

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    const userProfile = await getProfile(currentUser.id);
                    setProfile(userProfile);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [setUser, setProfile, setLoading]);

    const requireAuth = () => {
        if (!isLoading && !user) {
            router.push("/auth/login");
            return false;
        }
        return true;
    };

    return {
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        requireAuth,
        clearAuth,
    };
}
