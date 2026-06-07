// AI Service - Main entry point for AI travel plan generation
// Automatically uses real AI API if configured, falls back to mock data

import { CreateTripInput, AIResponse } from "@/types";
import { getAIProviderConfig } from "@/lib/ai-config";

export async function generateTripPlan(input: CreateTripInput): Promise<AIResponse> {
    const config = getAIProviderConfig();

    // If using mock provider, use the built-in mock data
    if (config.provider === "mock") {
        const { generateMockTripPlan } = await import("./ai-mock-service");
        return generateMockTripPlan(input);
    }

    // Otherwise, use the real AI API
    const { generateTripPlanWithAI } = await import("./ai-api-service");
    return generateTripPlanWithAI(input);
}

// Re-export the status check function
export { checkAIProviderStatus } from "./ai-api-service";