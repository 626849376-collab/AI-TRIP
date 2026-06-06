import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI Mini Travel Planner",
    description: "AI-powered travel planning service for college students, generate personalized travel plans with one click",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    viewportFit: "cover",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <head>
                {/* PWA meta tags for mobile */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                {/* Prevent text size adjustment on orientation change */}
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
            </head>
            <body className={inter.className}>
                {children}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: "#363636",
                            color: "#fff",
                        },
                        // Mobile-friendly toast
                        success: {
                            style: {
                                background: "#059669",
                                color: "#fff",
                                fontSize: "14px",
                                padding: "12px 16px",
                                borderRadius: "12px",
                            },
                        },
                        error: {
                            style: {
                                background: "#dc2626",
                                color: "#fff",
                                fontSize: "14px",
                                padding: "12px 16px",
                                borderRadius: "12px",
                            },
                        },
                    }}
                />
            </body>
        </html>
    );
}