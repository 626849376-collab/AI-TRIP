"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    getCurrentUser,
    getTripPlan,
    getTripDetails,
    deleteTripPlan,
    publishTripToSquare,
} from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ConfirmDialog from "@/components/ConfirmDialog";
import SkeletonLoader from "@/components/SkeletonLoader";
import ShareModal from "@/components/ShareModal";
import {
    MapPin,
    ArrowLeft,
    Loader2,
    Calendar,
    Wallet,
    Download,
    Trash2,
    Sun,
    Moon,
    Coffee,
    Utensils,
    Hotel,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    Route,
    Printer,
    Share2,
    Globe,
    Upload,
    CheckCircle2,
    Sparkles,
    Leaf,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("@/components/RouteMap"), {
    ssr: false,
    loading: () => (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm">Loading map...</p>
        </div>
    ),
});

export default function TripDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user, setUser } = useAuthStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [tripPlan, setTripPlan] = useState<any>(null);
    const [tripDetails, setTripDetails] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedDay, setExpandedDay] = useState<number>(1);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push("/auth/login");
                    return;
                }
                setUser(currentUser);

                const plan = await getTripPlan(params.id as string);
                if (!plan || plan.is_deleted) {
                    toast.error(t.trip.notFound);
                    router.push("/dashboard");
                    return;
                }
                setTripPlan(plan);
                setIsPublic(plan.is_public || false);

                const details = await getTripDetails(params.id as string);
                setTripDetails(details);
            } catch (error) {
                console.error(error);
                toast.error(t.trip.loadFailed);
                router.push("/dashboard");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [params.id, router, setUser]);

    const handleDelete = async () => {
        try {
            await deleteTripPlan(params.id as string);
            toast.success(t.trip.deleteSuccess);
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(t.trip.deleteFailed);
        } finally {
            setDeleteConfirm(false);
        }
    };

    const handleExportPDF = () => {
        const plan = tripPlan;
        const details = tripDetails;
        if (!plan) return;

        const formatBudget = (n: number) => `¥${Number(n || 0).toLocaleString("zh-CN")}`;

        const daysHTML = details.map((day: any) => {
            const c = day.content || {};
            const acts: any[] = Array.isArray(c.activities) ? c.activities : [];
            const meals = c.meals || {};
            const budget = c.budget || {};

            const actsHTML = acts.map((a: any) => `
                <div class="act-row">
                    <span class="act-time">${a.time || ""}</span>
                    <div class="act-body">
                        <div class="act-name">${a.name || ""}</div>
                        ${a.description ? `<div class="act-desc">${a.description}</div>` : ""}
                        <div class="act-meta">
                            ${a.location ? `<span>📍 ${a.location}</span>` : ""}
                            ${a.duration ? `<span>⏱ ${a.duration}</span>` : ""}
                            ${Number(a.cost) > 0 ? `<span>¥${a.cost}</span>` : ""}
                        </div>
                    </div>
                </div>`).join("");

            const tipsHTML = Array.isArray(c.tips) && c.tips.length > 0
                ? `<div class="tips-block"><strong>💡 贴士</strong><ul>${c.tips.map((t: string) => `<li>${t}</li>`).join("")}</ul></div>`
                : "";

            return `
            <div class="day-card">
                <div class="day-header">
                    <span class="day-title">第 ${day.day_number} 天</span>
                    <span class="day-date">${c.date || ""}</span>
                </div>
                ${actsHTML}
                <div class="sub-block meals-block">
                    <strong>餐食安排</strong>
                    <div class="meals-row">
                        <span>早：${meals.breakfast || "自理"}</span>
                        <span>午：${meals.lunch || "自理"}</span>
                        <span>晚：${meals.dinner || "自理"}</span>
                    </div>
                </div>
                ${c.hotel ? `<div class="sub-block">🏨 <strong>住宿：</strong>${c.hotel}</div>` : ""}
                <div class="budget-row">
                    <span>交通 ${formatBudget(budget.transportation)}</span>
                    <span>餐饮 ${formatBudget(budget.meals)}</span>
                    <span>门票 ${formatBudget(budget.tickets)}</span>
                    <span>购物 ${formatBudget(budget.shopping)}</span>
                </div>
                ${tipsHTML}
            </div>`;
        }).join("");

        // Aggregate totals
        let trans = 0, mealsT = 0, ticketsT = 0, shoppingT = 0;
        details.forEach((d: any) => {
            const b = d.content?.budget || {};
            trans     += Number(b.transportation || 0);
            mealsT    += Number(b.meals || 0);
            ticketsT  += Number(b.tickets || 0);
            shoppingT += Number(b.shopping || 0);
        });
        const grand = trans + mealsT + ticketsT + shoppingT;

        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${plan.title || "旅行计划"}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "PingFang SC","Microsoft YaHei","Hiragino Sans GB",sans-serif; color: #1f2937; font-size: 13px; line-height: 1.7; }
  .page { max-width: 780px; margin: 0 auto; padding: 32px; }

  /* Cover */
  .cover { text-align: center; padding: 60px 0 40px; border-bottom: 2px solid #059669; margin-bottom: 32px; }
  .cover-bar { width: 60px; height: 5px; background: #059669; border-radius: 3px; margin: 0 auto 16px; }
  .cover-title { font-size: 26px; font-weight: 700; color: #059669; margin-bottom: 6px; }
  .cover-sub { font-size: 14px; color: #6b7280; margin-bottom: 28px; }
  .cover-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 380px; margin: 0 auto; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
  .cover-item { display: flex; justify-content: space-between; font-size: 13px; }
  .cover-label { color: #6b7280; }
  .cover-value { font-weight: 600; color: #111827; }

  /* Section */
  .section-title { font-size: 16px; font-weight: 700; color: #059669; border-bottom: 2px solid #059669; padding-bottom: 6px; margin: 28px 0 16px; }

  /* Day card */
  .day-card { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
  .day-header { display: flex; justify-content: space-between; align-items: center; background: #ecfdf5; border-left: 4px solid #059669; padding: 8px 14px; }
  .day-title { font-weight: 700; color: #047857; font-size: 14px; }
  .day-date { font-size: 12px; color: #047857; }

  /* Activity */
  .act-row { display: flex; gap: 10px; padding: 8px 14px; border-bottom: 1px solid #f3f4f6; }
  .act-time { min-width: 52px; font-weight: 600; color: #059669; font-size: 12px; padding-top: 2px; }
  .act-body { flex: 1; }
  .act-name { font-weight: 600; color: #111827; }
  .act-desc { font-size: 12px; color: #4b5563; margin-top: 2px; }
  .act-meta { display: flex; gap: 12px; font-size: 11px; color: #9ca3af; margin-top: 3px; }

  /* Sub blocks */
  .sub-block { padding: 8px 14px; background: #f9fafb; border-top: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
  .meals-block .meals-row { display: flex; gap: 20px; margin-top: 4px; color: #4b5563; }
  .budget-row { display: flex; gap: 16px; padding: 6px 14px; background: #f0fdf4; font-size: 12px; color: #047857; border-top: 1px solid #d1fae5; }
  .tips-block { padding: 8px 14px; background: #fffbeb; border-top: 1px solid #fef3c7; font-size: 12px; }
  .tips-block ul { margin-top: 4px; padding-left: 16px; color: #4b5563; }
  .tips-block li { margin-bottom: 2px; }

  /* Budget summary */
  .budget-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .budget-table th, .budget-table td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 13px; }
  .budget-table th { background: #ecfdf5; color: #047857; text-align: left; }
  .budget-table .total-row { background: #f0fdf4; font-weight: 700; }
  .budget-table td:last-child { text-align: right; }

  /* Footer */
  .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .day-card { page-break-inside: avoid; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">
  <!-- Cover -->
  <div class="cover">
    <div class="cover-bar"></div>
    <div class="cover-title">${plan.title || "旅行规划"}</div>
    <div class="cover-sub">AI 迷你旅行规划师 · 生成方案</div>
    <div class="cover-grid">
      <div class="cover-item"><span class="cover-label">目的地</span><span class="cover-value">${plan.destination || "-"}</span></div>
      <div class="cover-item"><span class="cover-label">预算</span><span class="cover-value">${formatBudget(plan.budget)}</span></div>
      <div class="cover-item"><span class="cover-label">出发</span><span class="cover-value">${plan.start_date || "-"}</span></div>
      <div class="cover-item"><span class="cover-label">返回</span><span class="cover-value">${plan.end_date || "-"}</span></div>
    </div>
  </div>

  <!-- Itinerary -->
  <div class="section-title">📅 详细日程安排</div>
  ${daysHTML}

  <!-- Budget -->
  <div class="section-title">💰 预算明细分析</div>
  <table class="budget-table">
    <thead><tr><th>消费类别</th><th>预估费用</th></tr></thead>
    <tbody>
      <tr><td>交通出行</td><td>${formatBudget(trans)}</td></tr>
      <tr><td>餐饮美食</td><td>${formatBudget(mealsT)}</td></tr>
      <tr><td>景区门票</td><td>${formatBudget(ticketsT)}</td></tr>
      <tr><td>休闲购物</td><td>${formatBudget(shoppingT)}</td></tr>
      <tr class="total-row"><td>总计预估消费</td><td>${formatBudget(grand)}</td></tr>
    </tbody>
  </table>

  <div class="footer">生成时间：${new Date().toLocaleDateString("zh-CN")} &nbsp;|&nbsp; AI Mini Travel Planner</div>
</div>

<script>
  window.onload = function() { window.print(); }
</script>
</body>
</html>`;

        const printWin = window.open("", "_blank", "width=900,height=700");
        if (!printWin) {
            toast.error("请允许浏览器弹出窗口以导出 PDF");
            return;
        }
        printWin.document.write(html);
        printWin.document.close();
        toast.success("请在打印对话框中选择「另存为 PDF」");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <SkeletonLoader type="detail" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={handleDelete}
                title={t.trip.deleteConfirm}
                message="此操作不可撤销，删除后所有行程数据将永久丢失。"
                confirmText="确认删除"
                cancelText="取消"
                variant="danger"
            />

            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 touch-target"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">{t.trip.back}</span>
                        </Link>
                        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
                            <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            <span className="font-semibold truncate max-w-[120px] sm:max-w-none">
                                {tripPlan?.destination}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            {user?.id === tripPlan?.user_id && (
                                <>
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors rounded-xl hover:bg-indigo-50 icon-button"
                                        title="分享行程"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(true)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 icon-button"
                                        title={t.trip.delete}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleExportPDF}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors rounded-xl hover:bg-primary-50 icon-button"
                                title={t.trip.exportPDF}
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </header>

            {/* Trip Info */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 page-enter">
                <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                        {tripPlan?.title}
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500">{t.trip.date}</p>
                                <p className="font-medium text-sm sm:text-base truncate">
                                    {formatDate(tripPlan?.start_date)} -{" "}
                                    {formatDate(tripPlan?.end_date)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500">{t.trip.destination}</p>
                                <p className="font-medium text-sm sm:text-base truncate">
                                    {tripPlan?.destination}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Wallet className="w-5 h-5 text-primary-500 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500">{t.trip.budget}</p>
                                <p className="font-medium text-sm sm:text-base">
                                    {formatCurrency(tripPlan?.budget)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Day by Day Itinerary */}
                {tripDetails.map((detail: any) => (
                    <div
                        key={detail.id}
                        className="bg-white rounded-2xl shadow-sm border mb-3 sm:mb-4 overflow-hidden"
                    >
                        <button
                            onClick={() =>
                                setExpandedDay(
                                    expandedDay === detail.day_number
                                        ? -1
                                        : detail.day_number
                                )
                            }
                            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors touch-target"
                            aria-expanded={expandedDay === detail.day_number}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                    <Sun className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="text-left min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                        {t.trip.day.replace("{day}", String(detail.day_number))}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                                        {formatDate(detail.content?.date)}
                                    </p>
                                </div>
                            </div>
                            {expandedDay === detail.day_number ? (
                                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                        </button>

                        {expandedDay === detail.day_number && (
                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-fade-in">
                                {/* Route Map */}
                                <div className="mb-4 sm:mb-6">
                                    <RouteMap
                                        activities={detail.content?.activities || []}
                                        destination={tripPlan?.destination || ""}
                                        dayNumber={detail.day_number}
                                    />
                                </div>

                                {/* Activities Timeline */}
                                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                    {detail.content?.activities?.map(
                                        (activity: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="flex gap-3 sm:gap-4"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full bg-primary-500 mt-1.5" />
                                                    {idx <
                                                        detail.content
                                                            .activities
                                                            .length -
                                                        1 && (
                                                            <div className="w-0.5 flex-1 bg-gray-200" />
                                                        )}
                                                </div>
                                                <div className="flex-1 bg-gray-50 rounded-lg p-3 sm:p-4 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs sm:text-sm font-medium text-primary-600">
                                                            {activity.time}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {activity.duration}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                                                        {activity.name}
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                                        {activity.description}
                                                    </p>
                                                    {activity.location && (
                                                        <p className="text-xs text-gray-400">
                                                            📍 {activity.location}
                                                        </p>
                                                    )}
                                                    <p className="text-sm font-medium text-primary-600 mt-1">
                                                        {formatCurrency(
                                                            activity.cost
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Meals */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Coffee className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm font-medium text-orange-700">
                                                {t.trip.breakfast}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-700">
                                            {detail.content?.meals?.breakfast}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Utensils className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm font-medium text-green-700">
                                                {t.trip.lunch}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-700">
                                            {detail.content?.meals?.lunch}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Moon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm font-medium text-purple-700">
                                                {t.trip.dinner}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-700">
                                            {detail.content?.meals?.dinner}
                                        </p>
                                    </div>
                                </div>

                                {/* Hotel */}
                                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hotel className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-blue-700">
                                            {t.trip.hotel}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-700">
                                        {detail.content?.hotel}
                                    </p>
                                </div>

                                {/* Day Budget */}
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">
                                        {t.trip.dayBudget}
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t.trip.transportation}
                                            </p>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {formatCurrency(
                                                    detail.content?.budget
                                                        ?.transportation
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t.trip.meals}
                                            </p>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {formatCurrency(
                                                    detail.content?.budget?.meals
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t.trip.tickets}
                                            </p>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {formatCurrency(
                                                    detail.content?.budget?.tickets
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {t.trip.shopping}
                                            </p>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {formatCurrency(
                                                    detail.content?.budget
                                                        ?.shopping
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tips */}
                                {detail.content?.tips?.length > 0 && (
                                    <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm font-medium text-yellow-700">
                                                {t.trip.tips}
                                            </span>
                                        </div>
                                        <ul className="space-y-1">
                                            {detail.content.tips.map(
                                                (tip: string, idx: number) => (
                                                    <li
                                                        key={idx}
                                                        className="text-xs sm:text-sm text-gray-700 flex items-start gap-2"
                                                    >
                                                        <span className="text-yellow-500 mt-0.5">
                                                            •
                                                        </span>
                                                        {tip}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <ShareModal
                    tripId={params.id as string}
                    isPublic={isPublic}
                    onClose={() => setShowShareModal(false)}
                    onVisibilityChange={(newVisibility) => {
                        setIsPublic(newVisibility);
                        setTripPlan((prev: any) => prev ? { ...prev, is_public: newVisibility } : prev);
                    }}
                />
            )}
        </div>
    );
}
