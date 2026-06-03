export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    created_at: string;
}

export interface TripPlan {
    id: string;
    user_id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget: number;
    is_deleted: boolean;
    is_public: boolean;
    share_code?: string;
    likes_count: number;
    favorites_count: number;
    created_at: string;
}

export interface TripDetail {
    id: string;
    trip_id: string;
    day_number: number;
    content: TripDayContent;
}

export interface TripDayContent {
    date: string;
    activities: Activity[];
    meals: MealPlan;
    hotel: string;
    budget: DayBudget;
    tips: string[];
}

export interface Activity {
    time: string;
    name: string;
    description: string;
    duration: string;
    cost: number;
    category: string;
    location?: string;
    lat?: number;
    lng?: number;
}

export interface MealPlan {
    breakfast: string;
    lunch: string;
    dinner: string;
}

export interface DayBudget {
    transportation: number;
    meals: number;
    tickets: number;
    shopping: number;
    total: number;
}

export interface TripBudget {
    transportation: number;
    accommodation: number;
    meals: number;
    tickets: number;
    total: number;
}

export interface CreateTripInput {
    departureCity: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    interests: string[];
    transportPreference: string;
    accommodationPreference: string;
}

export type InterestTag =
    | "美食"
    | "自然"
    | "摄影"
    | "购物"
    | "历史"
    | "动漫"
    | "夜景"
    | "咖啡馆";

export const INTEREST_TAGS: InterestTag[] = [
    "美食",
    "自然",
    "摄影",
    "购物",
    "历史",
    "动漫",
    "夜景",
    "咖啡馆",
];

export const TRANSPORT_OPTIONS = [
    { value: "flight", label: "飞机" },
    { value: "train", label: "火车" },
    { value: "bus", label: "大巴" },
    { value: "self-drive", label: "自驾" },
];

export const ACCOMMODATION_OPTIONS = [
    { value: "budget", label: "经济型" },
    { value: "comfortable", label: "舒适型" },
    { value: "luxury", label: "豪华型" },
    { value: "hostel", label: "青旅" },
];

export interface AIResponse {
    success: boolean;
    data: {
        days: TripDayContent[];
        hotel: string;
        budget: TripBudget;
        tips: string[];
    };
}

export interface TripLike {
    id: string;
    trip_id: string;
    user_id: string;
    created_at: string;
}

export interface TripFavorite {
    id: string;
    trip_id: string;
    user_id: string;
    created_at: string;
}

export interface PublicTrip extends TripPlan {
    user_profile?: UserProfile;
    is_liked?: boolean;
    is_favorited?: boolean;
}