// AI API Service - Supports OpenAI, Claude (Anthropic), DeepSeek
// This service makes real API calls to AI providers for travel plan generation

import { CreateTripInput, AIResponse, TripDayContent, TripBudget, DayBudget, Activity, MealPlan } from "@/types";
import { getAIProviderConfig, AIProviderConfig } from "@/lib/ai-config";
import { ATTRACTIONS, RESTAURANTS, HOTELS, TRAVEL_TIPS, DESTINATION_COORDS, Attraction } from "./travel-data";

// ============================================================
// Prompt Templates
// ============================================================

function buildTravelPlanPrompt(input: CreateTripInput): string {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return `你是一个专业的旅行规划师。请为以下旅行需求生成详细的行程计划。

## 旅行信息
- 出发城市：${input.departureCity}
- 目的地：${input.destination}
- 开始日期：${input.startDate}
- 结束日期：${input.endDate}
- 旅行天数：${numDays}天
- 总预算：${input.budget}元
- 兴趣爱好：${input.interests.join("、")}
- 交通偏好：${input.transportPreference}
- 住宿偏好：${input.accommodationPreference}

## 要求
请为每一天生成详细的行程，包括：
1. 日期（YYYY-MM-DD格式）
2. 活动列表（每个活动包含：时间、名称、描述、时长、费用、类别）
3. 三餐推荐（早餐、午餐、晚餐的餐厅名称）
4. 酒店推荐（酒店名称和地址）
5. 每日预算明细（交通、餐饮、门票、购物、总计）
6. 每日小贴士（2-3条）

## 输出格式
请严格按照以下 JSON 格式输出，不要包含任何其他文字：

{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "HH:MM",
          "name": "活动名称",
          "description": "活动描述",
          "duration": "X小时",
          "cost": 0,
          "category": "类别"
        }
      ],
      "meals": {
        "breakfast": "早餐餐厅",
        "lunch": "午餐餐厅",
        "dinner": "晚餐餐厅"
      },
      "hotel": "酒店名称（地址）",
      "budget": {
        "transportation": 0,
        "meals": 0,
        "tickets": 0,
        "shopping": 0,
        "total": 0
      },
      "tips": ["小贴士1", "小贴士2", "小贴士3"]
    }
  ],
  "hotel": "推荐酒店名称（地址）- 评分X.X，约¥XXX/晚",
  "budget": {
    "transportation": 0,
    "accommodation": 0,
    "meals": 0,
    "tickets": 0,
    "total": 0
  },
  "tips": ["旅行建议1", "旅行建议2", "旅行建议3", "旅行建议4", "旅行建议5"]
}

请确保：
- 活动时间合理，从早上8点到晚上9点
- 每天至少3-4个活动
- 预算分配合理
- 推荐真实存在的景点和餐厅
- 所有费用单位为人民币（元）`;
}

// ============================================================
// API Call Functions
// ============================================================

async function callOpenAI(config: AIProviderConfig, prompt: string): Promise<string> {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                {
                    role: "system",
                    content: "你是一个专业的旅行规划助手，擅长生成详细的旅行行程计划。请始终以JSON格式输出。",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: config.maxTokens,
            temperature: config.temperature,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
}

async function callClaude(config: AIProviderConfig, prompt: string): Promise<string> {
    const response = await fetch(`${config.baseUrl}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: config.model,
            max_tokens: config.maxTokens,
            system: "你是一个专业的旅行规划助手，擅长生成详细的旅行行程计划。请始终以JSON格式输出。",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: config.temperature,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content[0]?.text || "";
}

async function callDeepSeek(config: AIProviderConfig, prompt: string): Promise<string> {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                {
                    role: "system",
                    content: "你是一个专业的旅行规划助手，擅长生成详细的旅行行程计划。请始终以JSON格式输出。",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: config.maxTokens,
            temperature: config.temperature,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
}

// ============================================================
// Response Parsing
// ============================================================

function parseAIResponse(text: string): AIResponse {
    try {
        // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
        let jsonStr = text;

        // Remove markdown code block markers if present
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }

        // Find the first { and last } to extract JSON object
        const firstBrace = jsonStr.indexOf("{");
        const lastBrace = jsonStr.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(jsonStr);

        // Validate and transform the response
        if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
            throw new Error("Invalid response: missing days array");
        }

        // Ensure each day has the required fields
        const days: TripDayContent[] = parsed.days.map((day: any) => ({
            date: day.date || "",
            activities: (day.activities || []).map((act: any) => ({
                time: act.time || "09:00",
                name: act.name || "活动",
                description: act.description || "",
                duration: act.duration || "1小时",
                cost: act.cost || 0,
                category: act.category || "其他",
            })),
            meals: {
                breakfast: day.meals?.breakfast || "当地早餐",
                lunch: day.meals?.lunch || "当地午餐",
                dinner: day.meals?.dinner || "当地晚餐",
            },
            hotel: day.hotel || "当地推荐酒店",
            budget: {
                transportation: day.budget?.transportation || 0,
                meals: day.budget?.meals || 0,
                tickets: day.budget?.tickets || 0,
                shopping: day.budget?.shopping || 0,
                total: day.budget?.total || 0,
            },
            tips: day.tips || ["祝旅途愉快！"],
        }));

        return {
            success: true,
            data: {
                days,
                hotel: parsed.hotel || "推荐酒店",
                budget: {
                    transportation: parsed.budget?.transportation || 0,
                    accommodation: parsed.budget?.accommodation || 0,
                    meals: parsed.budget?.meals || 0,
                    tickets: parsed.budget?.tickets || 0,
                    total: parsed.budget?.total || 0,
                },
                tips: parsed.tips || ["祝旅途愉快！"],
            },
        };
    } catch (error) {
        console.error("Failed to parse AI response:", error);
        console.error("Raw response:", text);
        throw new Error("AI 返回数据格式错误，请重试");
    }
}

// ============================================================
// Main API Function
// ============================================================

export async function generateTripPlanWithAI(input: CreateTripInput): Promise<AIResponse> {
    const config = getAIProviderConfig();

    // If using mock provider, fall back to the existing mock service
    if (config.provider === "mock") {
        const { generateTripPlan } = await import("./ai-service");
        return generateTripPlan(input);
    }

    // Validate API key
    if (!config.apiKey) {
        throw new Error(`请配置 ${config.provider} 的 API Key`);
    }

    const prompt = buildTravelPlanPrompt(input);

    let responseText: string;

    try {
        switch (config.provider) {
            case "openai":
                responseText = await callOpenAI(config, prompt);
                break;
            case "claude":
                responseText = await callClaude(config, prompt);
                break;
            case "deepseek":
                responseText = await callDeepSeek(config, prompt);
                break;
            default:
                throw new Error(`不支持的 AI 提供商: ${config.provider}`);
        }
    } catch (error: any) {
        console.error(`AI API call failed (${config.provider}):`, error);
        throw new Error(`AI 服务调用失败: ${error.message}`);
    }

    if (!responseText) {
        throw new Error("AI 返回了空响应，请重试");
    }

    return parseAIResponse(responseText);
}

// ============================================================
// AI Provider Status Check
// ============================================================

export async function checkAIProviderStatus(): Promise<{
    provider: string;
    isConfigured: boolean;
    isAvailable: boolean;
    message: string;
}> {
    const config = getAIProviderConfig();

    if (config.provider === "mock") {
        return {
            provider: "mock",
            isConfigured: true,
            isAvailable: true,
            message: "使用模拟数据模式",
        };
    }

    if (!config.apiKey) {
        return {
            provider: config.provider,
            isConfigured: false,
            isAvailable: false,
            message: `未配置 ${config.provider} API Key`,
        };
    }

    try {
        // Test the API with a simple request
        switch (config.provider) {
            case "openai": {
                const response = await fetch(`${config.baseUrl}/models`, {
                    headers: {
                        Authorization: `Bearer ${config.apiKey}`,
                    },
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return {
                    provider: "openai",
                    isConfigured: true,
                    isAvailable: true,
                    message: "OpenAI API 连接正常",
                };
            }
            case "claude": {
                const response = await fetch(`${config.baseUrl}/messages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": config.apiKey,
                        "anthropic-version": "2023-06-01",
                    },
                    body: JSON.stringify({
                        model: config.model,
                        max_tokens: 10,
                        messages: [{ role: "user", content: "test" }],
                    }),
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return {
                    provider: "claude",
                    isConfigured: true,
                    isAvailable: true,
                    message: "Claude API 连接正常",
                };
            }
            case "deepseek": {
                const response = await fetch(`${config.baseUrl}/models`, {
                    headers: {
                        Authorization: `Bearer ${config.apiKey}`,
                    },
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return {
                    provider: "deepseek",
                    isConfigured: true,
                    isAvailable: true,
                    message: "DeepSeek API 连接正常",
                };
            }
            default:
                return {
                    provider: config.provider,
                    isConfigured: false,
                    isAvailable: false,
                    message: "未知的 AI 提供商",
                };
        }
    } catch (error: any) {
        return {
            provider: config.provider,
            isConfigured: true,
            isAvailable: false,
            message: `API 连接失败: ${error.message}`,
        };
    }
}