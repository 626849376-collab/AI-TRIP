"use client";

interface SkeletonLoaderProps {
    type?: "card" | "list" | "detail" | "form" | "profile";
    count?: number;
}

export default function SkeletonLoader({ type = "card", count = 3 }: SkeletonLoaderProps) {
    const renderSkeleton = () => {
        switch (type) {
            case "card":
                return (
                    <div className="bg-white rounded-2xl border p-6">
                        <div className="skeleton skeleton-title" />
                        <div className="skeleton skeleton-text" />
                        <div className="skeleton skeleton-text" style={{ width: "80%" }} />
                        <div className="flex gap-2 mt-4">
                            <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 8 }} />
                            <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 8 }} />
                        </div>
                    </div>
                );

            case "list":
                return (
                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border">
                        <div className="skeleton skeleton-avatar" />
                        <div className="flex-1">
                            <div className="skeleton skeleton-title" />
                            <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                        </div>
                    </div>
                );

            case "detail":
                return (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border p-6">
                            <div className="skeleton skeleton-title" style={{ width: "40%" }} />
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i}>
                                        <div className="skeleton skeleton-text" style={{ width: "50%" }} />
                                        <div className="skeleton skeleton-text" style={{ width: "80%" }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border p-6">
                                <div className="skeleton skeleton-title" style={{ width: "30%" }} />
                                <div className="space-y-3 mt-4">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="flex gap-3">
                                            <div className="skeleton" style={{ width: 12, height: 12, borderRadius: "50%" }} />
                                            <div className="flex-1">
                                                <div className="skeleton skeleton-text" style={{ width: "40%" }} />
                                                <div className="skeleton skeleton-text" style={{ width: "70%" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case "form":
                return (
                    <div className="bg-white rounded-2xl border p-6 space-y-5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i}>
                                <div className="skeleton skeleton-text" style={{ width: "30%", marginBottom: 8 }} />
                                <div className="skeleton" style={{ width: "100%", height: 44, borderRadius: 8 }} />
                            </div>
                        ))}
                        <div className="skeleton" style={{ width: "100%", height: 48, borderRadius: 8 }} />
                    </div>
                );

            case "profile":
                return (
                    <div className="bg-white rounded-2xl border p-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="skeleton skeleton-avatar" style={{ width: 96, height: 96 }} />
                            <div className="skeleton skeleton-title" style={{ width: "40%", marginTop: 16 }} />
                            <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i}>
                                    <div className="skeleton skeleton-text" style={{ width: "20%", marginBottom: 8 }} />
                                    <div className="skeleton" style={{ width: "100%", height: 44, borderRadius: 8 }} />
                                </div>
                            ))}
                            <div className="skeleton" style={{ width: "100%", height: 48, borderRadius: 8 }} />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-4 stagger-enter" role="status" aria-label="Loading">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i}>{renderSkeleton()}</div>
            ))}
            <span className="sr-only">Loading...</span>
        </div>
    );
}