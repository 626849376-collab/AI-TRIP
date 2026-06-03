import { CreateTripInput, AIResponse, TripDayContent, TripBudget, DayBudget, Activity, MealPlan } from "@/types";
import { ATTRACTIONS, RESTAURANTS, HOTELS, TRAVEL_TIPS, DESTINATION_COORDS, Attraction } from "./travel-data";

// Mock AI service that generates travel plans with real-world data
// In production, this would call an actual AI API

export async function generateTripPlan(input: CreateTripInput): Promise<AIResponse> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const days: TripDayContent[] = [];
    const dailyBudget = Math.floor(input.budget / numDays);

    for (let i = 0; i < numDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dayContent = generateDayContent(currentDate, input.destination, input.interests, dailyBudget, i + 1, numDays);
        days.push(dayContent);
    }

    const totalBudget: TripBudget = {
        transportation: Math.floor(input.budget * 0.3),
        accommodation: Math.floor(input.budget * 0.35),
        meals: Math.floor(input.budget * 0.2),
        tickets: Math.floor(input.budget * 0.15),
        total: input.budget,
    };

    const hotel = getHotelRecommendation(input.destination, input.accommodationPreference);

    return {
        success: true,
        data: {
            days,
            hotel: `${hotel.name}（${hotel.address}）- 评分${hotel.rating}，约¥${hotel.cost}/晚`,
            budget: totalBudget,
            tips: getTravelTips(input.destination, input.interests),
        },
    };
}

function generateDayContent(
    date: Date,
    destination: string,
    interests: string[],
    dailyBudget: number,
    dayNumber: number,
    totalDays: number
): TripDayContent {
    const attractions = ATTRACTIONS[destination] || ATTRACTIONS["东京"];
    const restaurants = RESTAURANTS[destination] || RESTAURANTS["东京"];

    // Filter attractions by interests if possible
    let filteredAttractions = attractions;
    if (interests && interests.length > 0) {
        const matched = attractions.filter(a => interests.some(i => a.category.includes(i)));
        if (matched.length >= 3) {
            filteredAttractions = matched;
        }
    }

    // Select 3-4 attractions for the day
    const dayAttractions: Attraction[] = [];
    const usedIndices = new Set<number>();
    const numAttractions = Math.min(3 + (dayNumber % 2), filteredAttractions.length);

    const startIdx = ((dayNumber - 1) * 3) % filteredAttractions.length;
    for (let i = 0; i < numAttractions; i++) {
        const idx = (startIdx + i) % filteredAttractions.length;
        if (!usedIndices.has(idx)) {
            dayAttractions.push(filteredAttractions[idx]);
            usedIndices.add(idx);
        }
    }

    // Pick restaurants
    const breakfast = restaurants.breakfast[dayNumber % restaurants.breakfast.length];
    const lunch = restaurants.lunch[(dayNumber + 1) % restaurants.lunch.length];
    const dinner = restaurants.dinner[(dayNumber + 2) % restaurants.dinner.length];

    // Calculate costs
    const attractionCost = dayAttractions.reduce((sum, a) => sum + a.cost, 0);
    const mealCost = Math.floor(dailyBudget * 0.4);
    const transportCost = Math.floor(dailyBudget * 0.2);

    // Build activities array
    const activities: Activity[] = dayAttractions.map((a, idx) => ({
        time: a.timeSlot,
        name: a.name,
        description: a.description,
        duration: a.duration,
        cost: a.cost,
        category: a.category,
        lat: a.lat,
        lng: a.lng,
    }));

    // Add meal activities with destination coordinates
    const destCoords = DESTINATION_COORDS[destination] || DESTINATION_COORDS["东京"];

    activities.push({
        time: "08:00",
        name: `早餐：${breakfast}`,
        description: `在${destination}享用当地特色早餐`,
        duration: "0.5小时",
        cost: Math.floor(mealCost * 0.2),
        category: "美食",
        lat: destCoords.lat + 0.01,
        lng: destCoords.lng - 0.01,
    });

    activities.push({
        time: "12:00",
        name: `午餐：${lunch}`,
        description: `品尝${destination}特色午餐`,
        duration: "1小时",
        cost: Math.floor(mealCost * 0.35),
        category: "美食",
        lat: destCoords.lat,
        lng: destCoords.lng,
    });

    activities.push({
        time: "18:00",
        name: `晚餐：${dinner}`,
        description: `体验${destination}地道晚餐`,
        duration: "1.5小时",
        cost: Math.floor(mealCost * 0.45),
        category: "美食",
        lat: destCoords.lat - 0.01,
        lng: destCoords.lng + 0.01,
    });

    // Sort by time
    activities.sort((a, b) => a.time.localeCompare(b.time));

    const meals: MealPlan = {
        breakfast,
        lunch,
        dinner,
    };

    const dayBudget: DayBudget = {
        transportation: transportCost,
        meals: mealCost,
        tickets: attractionCost,
        shopping: Math.floor(dailyBudget * 0.1),
        total: attractionCost + mealCost + transportCost + Math.floor(dailyBudget * 0.1),
    };

    const hotel = getHotelRecommendation(destination, undefined);

    return {
        date: date.toISOString().split("T")[0],
        activities,
        meals,
        hotel: `${hotel.name}（${hotel.address}）`,
        budget: dayBudget,
        tips: [
            `${destination}今日天气适宜出行`,
            `建议携带防晒用品和饮用水`,
            `提前查看景点开放时间，避免白跑一趟`,
        ],
    };
}

function getHotelRecommendation(destination: string, preference?: string): { name: string; cost: number; rating: number; address: string } {
    const hotels = HOTELS[destination] || HOTELS["东京"];
    let selected: string[];

    switch (preference) {
        case "budget":
            selected = hotels.budget;
            break;
        case "comfortable":
            selected = hotels.comfortable;
            break;
        case "luxury":
            selected = hotels.luxury;
            break;
        case "hostel":
            selected = hotels.hostel;
            break;
        default:
            selected = hotels.comfortable;
    }

    const name = selected[Math.floor(Math.random() * selected.length)];
    const cost = preference === "budget" ? 300 : preference === "luxury" ? 1200 : preference === "hostel" ? 150 : 600;
    const rating = preference === "budget" ? 3.5 : preference === "luxury" ? 4.8 : preference === "hostel" ? 4.0 : 4.2;

    return {
        name,
        cost: cost * 100,
        rating,
        address: `${destination}市中心区域`,
    };
}

function getTravelTips(destination: string, interests: string[]): string[] {
    const tips = TRAVEL_TIPS[destination] || TRAVEL_TIPS["东京"];
    const selected = tips.slice(0, 5);

    if (interests && interests.length > 0) {
        const interestTips = interests.map(i => {
            const tipMap: Record<string, string> = {
                "美食": `${destination}的当地美食非常丰富，建议尝试街头小吃和特色餐厅`,
                "自然": `${destination}周边有多个自然景点，建议安排一天户外活动`,
                "摄影": `${destination}的日出和日落时分是拍摄最佳时间`,
                "购物": `${destination}的免税店和当地特色商品值得购买`,
                "历史": `${destination}的历史遗迹建议请导游讲解，更有深度`,
                "动漫": `${destination}有多个动漫主题店和咖啡馆，是二次元爱好者的天堂`,
                "夜景": `${destination}的夜景非常迷人，建议登上观景台欣赏`,
                "咖啡馆": `${destination}的特色咖啡馆很多，适合悠闲地度过下午`,
            };
            return tipMap[i] || "";
        }).filter(Boolean);

        return [...selected, ...interestTips].slice(0, 8);
    }

    return selected;
}