import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { success: false, error: "Supabase not configured" },
                { status: 500 }
            );
        }

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        });

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { destination, budget, startDate, endDate, interests } = body;

        // Here you would call your AI service
        // For now, return a mock response
        const mockResponse = {
            success: true,
            data: {
                days: [
                    {
                        date: startDate,
                        activities: [
                            {
                                time: "09:00",
                                name: `${destination}著名景点参观`,
                                description: `在${destination}体验精彩的景点参观`,
                                duration: "2小时",
                                cost: Math.floor(budget / 5),
                                category: "观光",
                                location: `${destination}市中心`,
                            },
                        ],
                        meals: {
                            breakfast: `${destination}当地特色早餐店`,
                            lunch: `${destination}热门餐厅`,
                            dinner: `${destination}景观餐厅`,
                        },
                        hotel: `${destination}精品酒店`,
                        budget: {
                            transportation: Math.floor(budget * 0.3),
                            meals: Math.floor(budget * 0.3),
                            tickets: Math.floor(budget * 0.25),
                            shopping: Math.floor(budget * 0.15),
                            total: budget,
                        },
                        tips: ["建议早点出发", "注意天气变化，携带雨具"],
                    },
                ],
                hotel: `${destination}精品酒店`,
                budget: {
                    transportation: Math.floor(budget * 0.3),
                    accommodation: Math.floor(budget * 0.35),
                    meals: Math.floor(budget * 0.2),
                    tickets: Math.floor(budget * 0.15),
                    total: budget,
                },
                tips: [
                    `建议提前预订${destination}的景点门票`,
                    "注意保管好个人财物",
                    "尝试当地特色美食",
                ],
            },
        };

        return NextResponse.json(mockResponse);
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
