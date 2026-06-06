import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@/components/ScrollToTop";
import NetworkStatus from "@/components/NetworkStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI Mini Travel Planner - 智能旅行规划师",
    description:
        "输入预算、时间和兴趣，AI 自动为你生成完整的旅行方案。路线、住宿、景点、预算，一站式搞定！",
    keywords: [
        "旅行规划",
        "AI旅行",
        "智能旅行",
        "行程规划",
        "旅游计划",
        "travel planner",
        "AI travel",
    ],
    authors: [{ name: "AI Mini Travel Planner" }],
    openGraph: {
        title: "AI Mini Travel Planner - 智能旅行规划师",
        description:
            "输入预算、时间和兴趣，AI 自动为你生成完整的旅行方案。",
        type: "website",
        locale: "zh_CN",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Travel Planner",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
        <html lang="zh-CN" className="smooth-scroll">
            <head>
                {/* PWA tags */}
                <meta name="application-name" content="Travel Planner" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta
                    name="apple-mobile-web-app-title"
                    content="Travel Planner"
                />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />

                {/* iOS splash screen */}
                <meta
                    name="apple-touch-startup-image"
                    content="/splash.png"
                />

                {/* Theme color for browser chrome */}
                <meta
                    name="theme-color"
                    content="#ffffff"
                    media="(prefers-color-scheme: light)"
                />
                <meta
                    name="theme-color"
                    content="#0f172a"
                    media="(prefers-color-scheme: dark)"
                />

                {/* Preconnect to important origins */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body className={inter.className}>
                <NetworkStatus />
                {children}
                <ScrollToTop />
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            borderRadius: "12px",
                            padding: "12px 16px",
                            fontSize: "14px",
                            maxWidth: "90vw",
                        },
                        success: {
                            className: "toast-success",
                            iconTheme: {
                                primary: "#ffffff",
                                secondary: "#059669",
                            },
                        },
                        error: {
                            className: "toast-error",
                            iconTheme: {
                                primary: "#ffffff",
                                secondary: "#dc2626",
                            },
                        },
                    }}
                />
            </body>
        </html>
    );
}