import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 在浏览器端检查环境变量是否配置
if (typeof window !== "undefined") {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error(
            "❌ Supabase 环境变量未配置！请确保在 Vercel 上设置了以下环境变量：\n" +
            "  - NEXT_PUBLIC_SUPABASE_URL\n" +
            "  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY"
        );
    }
}

// 使用惰性初始化，避免在构建时因缺少环境变量而报错
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
    if (!supabaseInstance) {
        if (!supabaseUrl || !supabaseAnonKey) {
            if (typeof window === "undefined") {
                // 服务端构建时，返回一个不会实际执行查询的模拟对象
                return createClient("https://placeholder.supabase.co", "placeholder-key");
            }
            throw new Error(
                "Supabase 环境变量未配置。请设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY（或 NEXT_PUBLIC_SUPABASE_ANON_KEY）"
            );
        }
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
}

export const supabase = getSupabaseClient();

export async function getCurrentUser() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

export async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
            },
        },
    });

    if (error) throw error;

    if (data.user) {
        await supabase.from("user_profiles").insert({
            id: data.user.id,
            email: data.user.email,
            name: name,
            created_at: new Date().toISOString(),
        });
    }

    return data;
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) throw error;
}

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) throw error;
    return data as any;
}

export async function updateProfile(
    userId: string,
    updates: { name?: string; avatar_url?: string }
) {
    const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", userId);

    if (error) throw error;
}

export async function getTripPlans(userId: string) {
    const { data, error } = await supabase
        .from("trip_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as any[];
}

export async function getTripPlan(tripId: string) {
    const { data, error } = await supabase
        .from("trip_plans")
        .select("*")
        .eq("id", tripId)
        .single();

    if (error) throw error;
    return data as any;
}

export async function createTripPlan(trip: {
    user_id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget: number;
}) {
    // First ensure the user profile exists to avoid foreign key violation
    const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", trip.user_id)
        .maybeSingle();

    if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({
                id: trip.user_id,
                email: trip.user_id + "@temp.com",
                name: "User",
                created_at: new Date().toISOString(),
            });

        if (profileError) {
            // If we can't create the profile, try to get the user email from auth
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                await supabase.from("user_profiles").upsert({
                    id: trip.user_id,
                    email: user.email,
                    name: user.user_metadata?.name || "User",
                    created_at: new Date().toISOString(),
                });
            }
        }
    }

    const { data, error } = await supabase
        .from("trip_plans")
        .insert(trip)
        .select()
        .single();

    if (error) throw error;
    return data as any;
}

export async function updateTripPlan(
    tripId: string,
    updates: {
        title?: string;
        destination?: string;
        start_date?: string;
        end_date?: string;
        budget?: number;
        is_public?: boolean;
        share_code?: string;
    }
) {
    const { error } = await supabase
        .from("trip_plans")
        .update(updates)
        .eq("id", tripId);

    if (error) throw error;
}

export async function deleteTripPlan(tripId: string) {
    const { error } = await supabase
        .from("trip_plans")
        .update({ is_deleted: true })
        .eq("id", tripId);

    if (error) throw error;
}

export async function getTripDetails(tripId: string) {
    const { data, error } = await supabase
        .from("trip_details")
        .select("*")
        .eq("trip_id", tripId)
        .order("day_number", { ascending: true });

    if (error) throw error;
    return data as any[];
}

export async function saveTripDetails(
    tripId: string,
    details: { day_number: number; content: any }[]
) {
    const detailsToInsert = details.map((d) => ({
        trip_id: tripId,
        day_number: d.day_number,
        content: d.content,
    }));

    const { error } = await supabase.from("trip_details").insert(detailsToInsert);

    if (error) throw error;
}

export async function deleteTripDetails(tripId: string) {
    const { error } = await supabase
        .from("trip_details")
        .delete()
        .eq("trip_id", tripId);

    if (error) throw error;
}

export async function getAllUsers() {
    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as any[];
}

export async function deleteUser(userId: string) {
    const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", userId);

    if (error) throw error;
}

export async function getStatistics() {
    const { data: users, error: usersError } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact" });

    if (usersError) throw usersError;

    const { data: trips, error: tripsError } = await supabase
        .from("trip_plans")
        .select("budget")
        .eq("is_deleted", false);

    if (tripsError) throw tripsError;

    const totalUsers = users?.length || 0;
    const totalTrips = trips?.length || 0;
    const totalBudget = trips?.reduce((sum: number, t: any) => sum + (t.budget || 0), 0) || 0;
    const avgBudget = totalTrips > 0 ? Math.round(totalBudget / totalTrips) : 0;

    return {
        totalUsers,
        totalTrips,
        totalBudget,
        avgBudget,
    };
}

// ============================================
// 分享功能
// ============================================

export async function generateShareCode(tripId: string): Promise<string> {
    // Generate a random 8-character share code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let shareCode = "";
    for (let i = 0; i < 8; i++) {
        shareCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Update trip plan with share code and make it public
    const { error } = await supabase
        .from("trip_plans")
        .update({
            share_code: shareCode,
            is_public: true,
        })
        .eq("id", tripId);

    if (error) throw error;
    return shareCode;
}

export async function getTripByShareCode(shareCode: string) {
    const { data, error } = await supabase
        .from("trip_plans")
        .select("*")
        .eq("share_code", shareCode)
        .eq("is_public", true)
        .eq("is_deleted", false)
        .single();

    if (error) throw error;
    return data as any;
}

// ============================================
// 点赞功能
// ============================================

export async function toggleLike(tripId: string, userId: string): Promise<boolean> {
    // Check if already liked - use maybeSingle() instead of single() to avoid error when no rows
    const { data: existing } = await supabase
        .from("trip_likes")
        .select("id")
        .eq("trip_id", tripId)
        .eq("user_id", userId)
        .maybeSingle();

    if (existing) {
        // Unlike
        const { error } = await supabase
            .from("trip_likes")
            .delete()
            .eq("trip_id", tripId)
            .eq("user_id", userId);

        if (error) throw error;
        return false; // is now not liked
    } else {
        // Like
        const { error } = await supabase
            .from("trip_likes")
            .insert({ trip_id: tripId, user_id: userId });

        if (error) throw error;
        return true; // is now liked
    }
}

export async function checkIfLiked(tripId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from("trip_likes")
        .select("id")
        .eq("trip_id", tripId)
        .eq("user_id", userId)
        .maybeSingle();

    return !!data;
}

// ============================================
// 收藏功能
// ============================================

export async function toggleFavorite(tripId: string, userId: string): Promise<boolean> {
    // Check if already favorited - use maybeSingle() instead of single() to avoid error when no rows
    const { data: existing } = await supabase
        .from("trip_favorites")
        .select("id")
        .eq("trip_id", tripId)
        .eq("user_id", userId)
        .maybeSingle();

    if (existing) {
        // Unfavorite
        const { error } = await supabase
            .from("trip_favorites")
            .delete()
            .eq("trip_id", tripId)
            .eq("user_id", userId);

        if (error) throw error;
        return false; // is now not favorited
    } else {
        // Favorite
        const { error } = await supabase
            .from("trip_favorites")
            .insert({ trip_id: tripId, user_id: userId });

        if (error) throw error;
        return true; // is now favorited
    }
}

export async function checkIfFavorited(tripId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from("trip_favorites")
        .select("id")
        .eq("trip_id", tripId)
        .eq("user_id", userId)
        .maybeSingle();

    return !!data;
}

// ============================================
// 旅行广场
// ============================================

export async function getPublicTrips(page: number = 1, pageSize: number = 12) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from("trip_plans")
        .select(`
            *,
            user_profiles(name, avatar_url)
        `, { count: "exact" })
        .eq("is_public", true)
        .eq("is_deleted", false)
        .order("likes_count", { ascending: false })
        .range(from, to);

    if (error) throw error;
    return { data: data as any[], count: count || 0 };
}


export async function toggleTripVisibility(tripId: string): Promise<boolean> {
    // Get current trip plan
    const { data: trip, error: getError } = await supabase
        .from("trip_plans")
        .select("is_public")
        .eq("id", tripId)
        .single();

    if (getError) throw getError;

    const newVisibility = !trip?.is_public;

    const { error } = await supabase
        .from("trip_plans")
        .update({ is_public: newVisibility })
        .eq("id", tripId);

    if (error) throw error;
    return newVisibility;
}


export async function publishTripToSquare(tripId: string): Promise<void> {
    const { error } = await supabase
        .from("trip_plans")
        .update({ is_public: true })
        .eq("id", tripId);

    if (error) throw error;
}

export async function getUserFavorites(userId: string) {
    const { data, error } = await supabase
        .from("trip_favorites")
        .select(`
            trip_id,
            trip_plans(
                *,
                user_profiles(name, avatar_url)
            )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as any[];
}