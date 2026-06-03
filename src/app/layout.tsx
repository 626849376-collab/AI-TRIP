import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI Mini Travel Planner",
    description: "AI-powered travel planning service for college students, generate personalized travel plans with one click",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
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
                    }}
                />
            </body>
        </html>
    );
}
