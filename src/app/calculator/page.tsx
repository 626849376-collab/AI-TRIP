"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import {
    Calculator,
    MapPin,
    Plus,
    Trash2,
    Plane,
    Train,
    Bus,
    Car,
    Footprints,
    ArrowRight,
    ArrowLeft,
    Users,
    Calendar,
    Route,
    DollarSign,
    RefreshCw,
    PieChart,
    TrendingUp,
    Hotel,
    UtensilsCrossed,
    Ticket,
    MoreHorizontal,
    Menu,
    X,
    Globe,
} from "lucide-react";
import toast from "react-hot-toast";

interface RouteStop {
    id: string;
    name: string;
    transportMode: string;
    distance: number;
    days: number;
}

interface CostResult {
    totalCost: number;
    transportCost: number;
    accommodationCost: number;
    foodCost: number;
    attractionCost: number;
    otherCost: number;
    perPersonCost: number;
    totalDistance: number;
    totalDays: number;
}

const transportIcons: Record<string, any> = {
    plane: Plane,
    train: Train,
    bus: Bus,
    car: Car,
    walk: Footprints,
};

const transportRates: Record<string, { perKm: number; base: number }> = {
    plane: { perKm: 0.8, base: 500 },
    train: { perKm: 0.5, base: 100 },
    bus: { perKm: 0.3, base: 50 },
    car: { perKm: 0.6, base: 200 },
    walk: { perKm: 0, base: 0 },
};

export default function CalculatorPage() {
    const { language } = useLanguageStore();
    const t = translations[language];
    const tc = t.calculator;

    const [stops, setStops] = useState<RouteStop[]>([
        { id: "1", name: "", transportMode: "plane", distance: 0, days: 1 },
        { id: "2", name: "", transportMode: "plane", distance: 0, days: 1 },
    ]);
    const [people, setPeople] = useState(1);
    const [result, setResult] = useState<CostResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const addStop = () => {
        const newId = (stops.length + 1).toString();
        setStops([...stops, { id: newId, name: "", transportMode: "plane", distance: 0, days: 1 }]);
    };

    const removeStop = (id: string) => {
        if (stops.length <= 2) {
            toast.error(tc.error);
            return;
        }
        setStops(stops.filter((s) => s.id !== id));
        setResult(null);
    };

    const updateStop = (id: string, field: keyof RouteStop, value: any) => {
        setStops(stops.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
        setResult(null);
    };

    const calculateCost = () => {
        // Validate
        for (const stop of stops) {
            if (!stop.name.trim()) {
                toast.error(tc.stopNameRequired);
                return;
            }
        }

        setIsCalculating(true);

        // Simulate calculation
        setTimeout(() => {
            let totalTransport = 0;
            let totalDistance = 0;
            let totalDays = 0;

            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i];
                const rate = transportRates[stop.transportMode] || transportRates.plane;
                totalTransport += rate.base + rate.perKm * stop.distance;
                totalDistance += stop.distance;
                totalDays += stop.days;
            }

            // Accommodation: average 200/night per person
            const accommodationCost = totalDays * 200 * people;

            // Food: average 150/day per person
            const foodCost = totalDays * 150 * people;

            // Attractions: average 100/day per person
            const attractionCost = totalDays * 100 * people;

            // Other: 10% of total
            const subtotal = totalTransport + accommodationCost + foodCost + attractionCost;
            const otherCost = subtotal * 0.1;

            const totalCost = subtotal + otherCost;
            const perPersonCost = totalCost / people;

            setResult({
                totalCost,
                transportCost: totalTransport,
                accommodationCost,
                foodCost,
                attractionCost,
                otherCost,
                perPersonCost,
                totalDistance,
                totalDays,
            });

            setIsCalculating(false);
            toast.success(tc.calculate + " " + tc.result);
        }, 800);
    };

    const resetCalculator = () => {
        setStops([
            { id: "1", name: "", transportMode: "plane", distance: 0, days: 1 },
            { id: "2", name: "", transportMode: "plane", distance: 0, days: 1 },
        ]);
        setPeople(1);
        setResult(null);
    };

    const formatCurrency = (amount: number) => {
        return `¥${amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            href="/"
                            className="flex items-center gap-2 group touch-target"
                        >
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-200 transition-all duration-300">
                                <Calculator className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                {tc.title}
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors px-3 py-2 rounded-xl hover:bg-orange-50 touch-target"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm font-medium">{t.trip.back}</span>
                            </Link>
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300 touch-target"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="text-sm">{t.nav.dashboard}</span>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-2 md:hidden">
                            <Link
                                href="/"
                                className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center hover:bg-orange-100 transition-colors icon-button"
                            >
                                <ArrowLeft className="w-5 h-5 text-orange-600" />
                            </Link>
                            <button
                                className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center hover:bg-orange-100 transition-colors icon-button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? (
                                    <X className="w-5 h-5 text-orange-600" />
                                ) : (
                                    <Menu className="w-5 h-5 text-orange-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Nav */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t border-orange-100 animate-fade-in">
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-orange-700 hover:bg-orange-50 rounded-xl px-4 py-3 transition-colors touch-target"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Globe className="w-5 h-5" />
                                    <span>{t.nav.dashboard}</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 page-enter">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 shadow-sm">
                        <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {tc.subtitle}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                        <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            {tc.title}
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
                        {tc.addRouteHint}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                    {/* Input Section */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* People Input */}
                        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{tc.people}</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setPeople(Math.max(1, people - 1))}
                                    className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 transition-colors flex items-center justify-center touch-target"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={people}
                                    onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 text-center text-lg font-semibold text-gray-900 bg-orange-50 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    min="1"
                                />
                                <button
                                    onClick={() => setPeople(people + 1)}
                                    className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 transition-colors flex items-center justify-center touch-target"
                                >
                                    +
                                </button>
                                <span className="text-sm text-gray-500 ml-2">{t.tripCreate.interests}</span>
                            </div>
                        </div>

                        {/* Route Stops */}
                        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                                        <Route className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">{tc.route}</h3>
                                </div>
                                <span className="text-sm text-gray-400">
                                    {stops.length} {tc.stops}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {stops.map((stop, index) => {
                                    const TransportIcon = transportIcons[stop.transportMode] || Plane;
                                    return (
                                        <div
                                            key={stop.id}
                                            className="relative bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100/50"
                                        >
                                            {/* Connection line */}
                                            {index < stops.length - 1 && (
                                                <div className="absolute left-8 top-14 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 to-amber-300 hidden sm:block" />
                                            )}

                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                {tc.stopName}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={stop.name}
                                                                onChange={(e) => updateStop(stop.id, "name", e.target.value)}
                                                                placeholder={tc.stopNamePlaceholder}
                                                                className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                {tc.transportMode}
                                                            </label>
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {["plane", "train", "bus", "car", "walk"].map((mode) => {
                                                                    const Icon = transportIcons[mode];
                                                                    const isActive = stop.transportMode === mode;
                                                                    return (
                                                                        <button
                                                                            key={mode}
                                                                            onClick={() => updateStop(stop.id, "transportMode", mode)}
                                                                            className={`p-2 rounded-lg transition-all touch-target ${isActive
                                                                                    ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-sm"
                                                                                    : "bg-white text-gray-400 hover:text-orange-500 hover:bg-orange-50 border border-orange-200"
                                                                                }`}
                                                                            title={(tc as any)[`transport${mode.charAt(0).toUpperCase() + mode.slice(1)}`]}
                                                                        >
                                                                            <Icon className="w-4 h-4" />
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                {tc.distance}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={stop.distance || ""}
                                                                onChange={(e) => updateStop(stop.id, "distance", Math.max(0, parseInt(e.target.value) || 0))}
                                                                placeholder={tc.distancePlaceholder}
                                                                className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                                                                min="0"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                {tc.days}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={stop.days}
                                                                onChange={(e) => updateStop(stop.id, "days", Math.max(1, parseInt(e.target.value) || 1))}
                                                                placeholder={tc.daysPlaceholder}
                                                                className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                                                                min="1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeStop(stop.id)}
                                                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all flex items-center justify-center touch-target"
                                                    title={tc.removeStop}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={addStop}
                                className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-orange-200 text-orange-500 hover:border-orange-400 hover:bg-orange-50 transition-all font-medium flex items-center justify-center gap-2 touch-target"
                            >
                                <Plus className="w-4 h-4" />
                                {tc.addStop}
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={calculateCost}
                                disabled={isCalculating}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 touch-target"
                            >
                                {isCalculating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        {tc.calculating}
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="w-4 h-4" />
                                        {tc.calculate}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={resetCalculator}
                                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 touch-target"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {tc.reset}
                            </button>
                        </div>
                    </div>

                    {/* Result Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 sm:p-6 sticky top-24">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900">{tc.result}</h3>
                            </div>

                            {result ? (
                                <div className="space-y-4 animate-fade-in">
                                    {/* Total Cost */}
                                    <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 text-white">
                                        <div className="text-sm text-orange-100 mb-1">{tc.totalCost}</div>
                                        <div className="text-2xl sm:text-3xl font-bold">
                                            {formatCurrency(result.totalCost)}
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-orange-100 text-sm">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{tc.perPerson}: {formatCurrency(result.perPersonCost)}</span>
                                        </div>
                                    </div>

                                    {/* Route Summary */}
                                    <div className="bg-orange-50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Route className="w-4 h-4 text-orange-500" />
                                            <span className="text-sm font-semibold text-gray-700">{tc.routeSummary}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div>
                                                <div className="text-lg font-bold text-orange-600">{result.totalDistance}</div>
                                                <div className="text-xs text-gray-500">km</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-orange-600">{result.totalDays}</div>
                                                <div className="text-xs text-gray-500">{tc.totalDays}</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-orange-600">{stops.length}</div>
                                                <div className="text-xs text-gray-500">{tc.stops}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <PieChart className="w-4 h-4 text-orange-500" />
                                            <span className="text-sm font-semibold text-gray-700">{tc.costBreakdown}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { label: tc.transportCost, value: result.transportCost, color: "bg-blue-500" },
                                                { label: tc.accommodationCost, value: result.accommodationCost, color: "bg-purple-500" },
                                                { label: tc.foodCost, value: result.foodCost, color: "bg-green-500" },
                                                { label: tc.attractionCost, value: result.attractionCost, color: "bg-pink-500" },
                                                { label: tc.otherCost, value: result.otherCost, color: "bg-gray-400" },
                                            ].map((item) => {
                                                const percentage = result.totalCost > 0 ? (item.value / result.totalCost) * 100 : 0;
                                                return (
                                                    <div key={item.label} className="flex items-center gap-3">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-gray-600 truncate">{item.label}</span>
                                                                <span className="font-medium text-gray-900">{formatCurrency(item.value)}</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                                        <Calculator className="w-8 h-8 text-orange-300" />
                                    </div>
                                    <p className="text-sm text-gray-400">{tc.noRoute}</p>
                                    <p className="text-xs text-gray-300 mt-1">{tc.addRouteHint}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}