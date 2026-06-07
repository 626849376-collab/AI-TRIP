"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import {
    AIProvider,
    AI_PROVIDER_OPTIONS,
    getAIProviderConfig,
    getAIProviderLabel,
    getAIProviderDescription,
} from "@/lib/ai-config";
import { checkAIProviderStatus } from "@/services/ai-service";
import {
    Sparkles,
    Settings2,
    CheckCircle2,
    XCircle,
    Loader2,
    Eye,
    EyeOff,
    RefreshCw,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

interface AISettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AISettings({ isOpen, onClose }: AISettingsProps) {
    const { language } = useLanguageStore();
    const t = translations[language];

    const [selectedProvider, setSelectedProvider] = useState<AIProvider>("mock");
    const [apiKey, setApiKey] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [status, setStatus] = useState<{
        provider: string;
        isConfigured: boolean;
        isAvailable: boolean;
        message: string;
    } | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadCurrentConfig();
        }
    }, [isOpen]);

    const loadCurrentConfig = () => {
        const config = getAIProviderConfig();
        setSelectedProvider(config.provider);
        setApiKey(config.apiKey);
        setSelectedModel(config.model);
        setStatus(null);
    };

    const handleProviderChange = (provider: AIProvider) => {
        setSelectedProvider(provider);
        setApiKey("");
        setSelectedModel("");
        setStatus(null);

        // Set default model for the selected provider
        const option = AI_PROVIDER_OPTIONS.find((opt) => opt.value === provider);
        if (option) {
            setSelectedModel(option.defaultModel);
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setStatus(null);

        try {
            // Save current settings to localStorage for testing
            const testConfig = {
                provider: selectedProvider,
                apiKey: apiKey,
                model: selectedModel,
            };
            localStorage.setItem("ai_test_config", JSON.stringify(testConfig));

            const result = await checkAIProviderStatus();
            setStatus(result);

            if (result.isAvailable) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            setStatus({
                provider: selectedProvider,
                isConfigured: true,
                isAvailable: false,
                message: `连接测试失败: ${error.message}`,
            });
            toast.error("连接测试失败");
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save settings to localStorage (in a real app, this would be saved to the server)
            const settings = {
                provider: selectedProvider,
                apiKey: apiKey,
                model: selectedModel,
            };
            localStorage.setItem("ai_settings", JSON.stringify(settings));

            // Also update environment variables for the current session
            // Note: In production, these should be set on the server side
            if (typeof window !== "undefined") {
                // @ts-ignore
                window.__AI_SETTINGS = settings;
            }

            toast.success("AI 设置已保存");
            onClose();
        } catch (error: any) {
            toast.error("保存失败");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSelectedProvider("mock");
        setApiKey("");
        setSelectedModel("mock-default");
        setStatus(null);
        localStorage.removeItem("ai_settings");
        toast.success("已重置为模拟数据模式");
    };

    const currentOption = AI_PROVIDER_OPTIONS.find((opt) => opt.value === selectedProvider);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-10 px-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            AI 设置
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                    {/* Current Status */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                <Info className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                    当前 AI 提供商
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {getAIProviderLabel(selectedProvider, language)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {getAIProviderDescription(selectedProvider, language)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            选择 AI 提供商
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {AI_PROVIDER_OPTIONS.map((option) => {
                                const isSelected = selectedProvider === option.value;
                                const isMock = option.value === "mock";
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleProviderChange(option.value)}
                                        className={`p-3 rounded-xl border text-left transition-all ${isSelected
                                                ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                                                : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div
                                                className={`w-2 h-2 rounded-full ${isMock ? "bg-gray-400" : "bg-green-400"
                                                    }`}
                                            />
                                            <span className="text-sm font-medium text-gray-900">
                                                {language === "en"
                                                    ? option.labelEn
                                                    : language === "ko"
                                                        ? option.labelKo
                                                        : option.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                            {language === "en"
                                                ? option.descriptionEn
                                                : language === "ko"
                                                    ? option.descriptionKo
                                                    : option.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* API Key Input (for non-mock providers) */}
                    {selectedProvider !== "mock" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    API Key <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder={`输入 ${getAIProviderLabel(selectedProvider)} API Key`}
                                        className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm"
                                    />
                                    <button
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showApiKey ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    API Key 仅保存在本地，不会上传到服务器
                                </p>
                            </div>

                            {/* Model Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    模型选择
                                </label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm bg-white"
                                >
                                    {currentOption?.models.map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Advanced Settings */}
                            <div>
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <Settings2 className="w-4 h-4" />
                                    高级设置
                                    {showAdvanced ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                                {showAdvanced && (
                                    <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                自定义 API 地址
                                            </label>
                                            <input
                                                type="text"
                                                value={currentOption?.baseUrl || ""}
                                                placeholder="https://api.example.com/v1"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-xs"
                                                disabled
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                如需使用代理或自定义端点，请联系管理员配置
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Test Connection */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting || !apiKey}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isTesting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    测试连接
                                </button>

                                {status && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                        {status.isAvailable ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                <span className="text-green-700">{status.message}</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4 text-red-500" />
                                                <span className="text-red-700">{status.message}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Mock Provider Info */}
                    {selectedProvider === "mock" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-amber-800 mb-1">
                                        模拟数据模式
                                    </h4>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        当前使用内置的模拟数据生成旅行计划。如需使用真实的 AI 生成能力，
                                        请选择 OpenAI、Claude 或 DeepSeek 并配置相应的 API Key。
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || (selectedProvider !== "mock" && !apiKey)}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            保存设置
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            重置
                        </button>
                    </div>

                    {/* Footer Info */}
                    <div className="text-center">
                        <p className="text-xs text-gray-400">
                            提示：在生产环境中，建议在服务器端配置环境变量来设置 API Key
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}