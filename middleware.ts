import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // Handle CORS for cross-origin requests (ngrok, etc.)
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = [
        "http://localhost:3000",
        "http://0.0.0.0:3000",
        "http://192.168.10.132:3000",
    ];
    // Allow any ngrok domain
    const isNgrok = origin.includes("ngrok-free.dev") ||
        origin.includes("ngrok.io") ||
        origin.includes("ngrok.app");

    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Add CORS headers for cross-origin requests
    if (origin && (allowedOrigins.includes(origin) || isNgrok)) {
        supabaseResponse.headers.set("Access-Control-Allow-Origin", origin);
        supabaseResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        supabaseResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        supabaseResponse.headers.set("Access-Control-Allow-Credentials", "true");
    }

    // Handle preflight requests
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true",
            },
        });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    // Refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes
    const protectedPaths = ["/dashboard", "/trip", "/profile", "/admin"];
    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
    }

    // Auth pages - redirect to dashboard if already logged in
    const authPaths = ["/auth/login", "/auth/register"];
    const isAuthPath = authPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isAuthPath && user) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
