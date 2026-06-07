import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: "缺少用户 ID" }, { status: 400 });
        }
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
        }
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });
        await supabaseAdmin.from("trip_likes").delete().eq("user_id", userId);
        await supabaseAdmin.from("trip_favorites").delete().eq("user_id", userId);
        const { data: userTrips } = await supabaseAdmin.from("trip_plans").select("id").eq("user_id", userId);
        if (userTrips && userTrips.length > 0) {
            const tripIds = userTrips.map(t => t.id);
            await supabaseAdmin.from("trip_details").delete().in("trip_id", tripIds);
            await supabaseAdmin.from("trip_likes").delete().in("trip_id", tripIds);
            await supabaseAdmin.from("trip_favorites").delete().in("trip_id", tripIds);
            await supabaseAdmin.from("trip_plans").delete().eq("user_id", userId);
        }
        await supabaseAdmin.from("user_profiles").delete().eq("id", userId);
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;
        return NextResponse.json({ success: true, message: "账号已成功删除" });
    } catch (error: any) {
        console.error("Delete account error:", error);
        return NextResponse.json({ error: error?.message || "删除账号失败" }, { status: 500 });
    }
}