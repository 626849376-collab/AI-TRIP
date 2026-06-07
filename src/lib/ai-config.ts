// AI API Configuration
// Supports multiple AI providers: OpenAI, Claude (Anthropic), DeepSeek, and Mock

export type AIProvider = "openai" | "claude" | "deepseek" | "mock";

export interface AIProviderConfig {
    provider: AIProvider;
    apiKey: string;
    model: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface AIProviderOption {
    value: AIProvider;
    label: string;
    labelEn: string;
    labelKo: string;
    description: string;
    descriptionEn: string;
    descriptionKo: string;
    models: string[];
    defaultModel: string;
    baseUrl?: string;
}

export const AI_PROVIDER_OPTIONS: AIProviderOption[] = [
    {
        value: "openai",
        label: "OpenAI",
        labelEn: "OpenAI",
        labelKo: "OpenAI",
        description: "OpenAI GPT 系列模型，支持 GPT-4o、GPT-4o-mini 等",
        descriptionEn: "OpenAI GPT series models, supports GPT-4o, GPT-4o-mini, etc.",
        descriptionKo: "OpenAI GPT 시리즈 모델, GPT-4o, GPT-4o-mini 등 지원",
        models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
        defaultModel: "gpt-4o-mini",
    },
    {
        value: "claude",
        label: "Claude (Anthropic)",
        labelEn: "Claude (Anthropic)",
        labelKo: "Claude (Anthropic)",
        description: "Anthropic Claude 系列模型，支持 Claude 3 Haiku、Sonnet 等",
        descriptionEn: "Anthropic Claude series models, supports Claude 3 Haiku, Sonnet, etc.",
        descriptionKo: "Anthropic Claude 시리즈 모델, Claude 3 Haiku, Sonnet 등 지원",
        models: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-opus-20240229"],
        defaultModel: "claude-3-haiku-20240307",
    },
    {
        value: "deepseek",
        label: "DeepSeek",
        labelEn: "DeepSeek",
        labelKo: "DeepSeek",
        description: "DeepSeek 大语言模型，性价比高，支持 DeepSeek-V2、DeepSeek-Chat",
        descriptionEn: "DeepSeek LLM, cost-effective, supports DeepSeek-V2, DeepSeek-Chat",
        descriptionKo: "DeepSeek 대규모 언어 모델, 비용 효율적, DeepSeek-V2, DeepSeek-Chat 지원",
        models: ["deepseek-chat", "deepseek-v2"],
        defaultModel: "deepseek-chat",
    },
    {
        value: "mock",
        label: "模拟数据 (Mock)",
        labelEn: "Mock Data",
        labelKo: "모의 데이터",
        description: "使用内置的模拟数据生成旅行计划，无需 API Key",
        descriptionEn: "Use built-in mock data to generate travel plans, no API key required",
        descriptionKo: "내장 모의 데이터를 사용하여 여행 계획 생성, API 키 불필요",
        models: ["mock-default"],
        defaultModel: "mock-default",
    },
];

export function getAIProviderConfig(): AIProviderConfig {
    const provider = (process.env.NEXT_PUBLIC_AI_PROVIDER || "mock") as AIProvider;

    const configs: Record<AIProvider, AIProviderConfig> = {
        openai: {
            provider: "openai",
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
            model: process.env.NEXT_PUBLIC_OPENAI_MODEL || "gpt-4o-mini",
            baseUrl: "https://api.openai.com/v1",
            maxTokens: 4096,
            temperature: 0.7,
        },
        claude: {
            provider: "claude",
            apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || "",
            model: process.env.NEXT_PUBLIC_CLAUDE_MODEL || "claude-3-haiku-20240307",
            baseUrl: "https://api.anthropic.com/v1",
            maxTokens: 4096,
            temperature: 0.7,
        },
        deepseek: {
            provider: "deepseek",
            apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || "",
            model: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL || "deepseek-chat",
            baseUrl: "https://api.deepseek.com/v1",
            maxTokens: 4096,
            temperature: 0.7,
        },
        mock: {
            provider: "mock",
            apiKey: "",
            model: "mock-default",
            maxTokens: 4096,
            temperature: 0.7,
        },
    };

    return configs[provider] || configs.mock;
}

export function getAIProviderLabel(provider: AIProvider, language: "zh" | "en" | "ko" = "zh"): string {
    const option = AI_PROVIDER_OPTIONS.find((opt) => opt.value === provider);
    if (!option) return provider;

    switch (language) {
        case "en":
            return option.labelEn;
        case "ko":
            return option.labelKo;
        default:
            return option.label;
    }
}

export function getAIProviderDescription(provider: AIProvider, language: "zh" | "en" | "ko" = "zh"): string {
    const option = AI_PROVIDER_OPTIONS.find((opt) => opt.value === provider);
    if (!option) return "";

    switch (language) {
        case "en":
            return option.descriptionEn;
        case "ko":
            return option.descriptionKo;
        default:
            return option.description;
    }
}