"use client";

import { useState, useEffect, useCallback } from "react";
import { getTripPlans, getTripDetails, deleteTripPlan } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useTrips(userId: string | undefined) {
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadTrips = useCallback(async () => {
        if (!userId) return;
        try {
            const data = await getTripPlans(userId);
            setTrips(data);
        } catch (error) {
            console.error("Error loading trips:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadTrips();
    }, [loadTrips]);

    const deleteTrip = async (tripId: string) => {
        if (!confirm("确定要删除这个旅行计划吗？")) return;
        try {
            await deleteTripPlan(tripId);
            setTrips((prev) => prev.filter((t) => t.id !== tripId));
            toast.success("旅行计划已删除");
        } catch (error: any) {
            toast.error("删除失败");
        }
    };

    return {
        trips,
        isLoading,
        deleteTrip,
        refreshTrips: loadTrips,
    };
}

export function useTripDetails(tripId: string | undefined) {
    const [details, setDetails] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!tripId) return;
        const load = async () => {
            try {
                const data = await getTripDetails(tripId);
                setDetails(data);
            } catch (error) {
                console.error("Error loading trip details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [tripId]);

    return {
        details,
        isLoading,
    };
}
