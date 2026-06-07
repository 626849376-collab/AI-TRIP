import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Chinese Font Noto Sans SC (WOFF)
if (typeof window !== 'undefined') {
    Font.register({
        family: 'Noto Sans SC',
        src: `${window.location.origin}/fonts/NotoSansSC-Regular.woff`,
    });
} else {
    // During server-side compilation or node tests, use local relative path
    Font.register({
        family: 'Noto Sans SC',
        src: 'd:/xiangmuwenjian1/public/fonts/NotoSansSC-Regular.woff',
    });
}

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Noto Sans SC',
        padding: 40,
        fontSize: 11,
        color: '#1f2937',
        lineHeight: 1.5,
    },
    // Cover Page Style
    coverContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    coverAccent: {
        width: 80,
        height: 6,
        backgroundColor: '#059669',
        borderRadius: 3,
        marginBottom: 24,
    },
    coverTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#059669',
        marginBottom: 16,
    },
    coverSubtitle: {
        fontSize: 16,
        color: '#4b5563',
        marginBottom: 32,
    },
    coverGrid: {
        width: '100%',
        maxWidth: 360,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#f9fafb',
    },
    coverItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    coverItemLabel: {
        color: '#6b7280',
    },
    coverItemValue: {
        fontWeight: 'bold',
        color: '#111827',
    },
    coverFooter: {
        position: 'absolute',
        bottom: 40,
        fontSize: 9,
        color: '#9ca3af',
    },
    // General Sections
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669',
        borderBottom: '2px solid #059669',
        paddingBottom: 4,
        marginTop: 20,
        marginBottom: 12,
    },
    // Day Card
    dayHeader: {
        backgroundColor: '#ecfdf5',
        padding: 8,
        borderRadius: 4,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeft: '4px solid #059669',
    },
    dayTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#047857',
    },
    dayDate: {
        fontSize: 10,
        color: '#047857',
    },
    // Activity Item
    activityItem: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingLeft: 8,
        borderLeft: '1px solid #e5e7eb',
    },
    activityTime: {
        width: 50,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#059669',
    },
    activityContent: {
        flex: 1,
        paddingBottom: 8,
    },
    activityName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#111827',
    },
    activityDesc: {
        fontSize: 10,
        color: '#4b5563',
        marginTop: 2,
    },
    activityMeta: {
        flexDirection: 'row',
        marginTop: 3,
        fontSize: 9,
        color: '#9ca3af',
    },
    activityMetaItem: {
        marginRight: 12,
    },
    // Daily block components
    dayBlock: {
        backgroundColor: '#f9fafb',
        borderRadius: 6,
        padding: 8,
        marginTop: 6,
        marginBottom: 12,
        border: '1px solid #f3f4f6',
    },
    blockTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    mealsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mealItem: {
        fontSize: 9,
        color: '#4b5563',
        flex: 1,
    },
    hotelText: {
        fontSize: 10,
        color: '#4b5563',
    },
    // Budget Page Table
    table: {
        width: '100%',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        overflow: 'hidden',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#ecfdf5',
        fontWeight: 'bold',
        borderBottom: '1px solid #e5e7eb',
        padding: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #e5e7eb',
        padding: 6,
    },
    tableRowLast: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        fontWeight: 'bold',
        padding: 6,
    },
    tableCol1: {
        flex: 2,
    },
    tableCol2: {
        flex: 1,
        textAlign: 'right',
    },
    // Tips list
    tipsList: {
        marginTop: 8,
    },
    tipItem: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    tipBullet: {
        width: 10,
        color: '#059669',
    },
    tipContent: {
        flex: 1,
        fontSize: 10,
        color: '#4b5563',
    },
    // Footer page number
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
    }
});

interface Activity {
    time: string;
    duration: string;
    name: string;
    description: string;
    location: string;
    cost: number;
}

interface BudgetBreakdown {
    transportation: number;
    meals: number;
    tickets: number;
    shopping: number;
}

interface Meals {
    breakfast: string;
    lunch: string;
    dinner: string;
}

interface DayDetail {
    day_number: number;
    content: {
        date: string;
        hotel: string;
        budget: BudgetBreakdown;
        meals: Meals;
        activities: Activity[];
        tips?: string[];
    };
}

interface TripPDFDocumentProps {
    tripPlan: {
        title: string;
        destination: string;
        start_date: string;
        end_date: string;
        budget: number;
    };
    tripDetails: DayDetail[];
}

export function TripPDFDocument({ tripPlan, tripDetails }: TripPDFDocumentProps) {
    // Calculate total budget categories
    let transTotal = 0;
    let mealsTotal = 0;
    let ticketsTotal = 0;
    let shoppingTotal = 0;

    tripDetails.forEach((day) => {
        const b = day.content?.budget;
        if (b) {
            transTotal += Number(b.transportation || 0);
            mealsTotal += Number(b.meals || 0);
            ticketsTotal += Number(b.tickets || 0);
            shoppingTotal += Number(b.shopping || 0);
        }
    });

    const calculatedTotal = transTotal + mealsTotal + ticketsTotal + shoppingTotal;

    // Collect all tips across days
    const allTips: string[] = [];
    tripDetails.forEach((day) => {
        if (day.content?.tips && Array.isArray(day.content.tips)) {
            day.content.tips.forEach(t => allTips.push(t));
        }
    });

    return (
        <Document>
            {/* Page 1: Cover */}
            <Page size="A4" style={styles.page}>
                <View style={styles.coverContainer}>
                    <View style={styles.coverAccent} />
                    <Text style={styles.coverTitle}>{tripPlan.title || '旅行规划'}</Text>
                    <Text style={styles.coverSubtitle}>AI 迷你旅行规划师生成方案</Text>
                    
                    <View style={styles.coverGrid}>
                        <View style={styles.coverItem}>
                            <Text style={styles.coverItemLabel}>目的地</Text>
                            <Text style={styles.coverItemValue}>{tripPlan.destination}</Text>
                        </View>
                        <View style={styles.coverItem}>
                            <Text style={styles.coverItemLabel}>开始日期</Text>
                            <Text style={styles.coverItemValue}>{tripPlan.start_date}</Text>
                        </View>
                        <View style={styles.coverItem}>
                            <Text style={styles.coverItemLabel}>结束日期</Text>
                            <Text style={styles.coverItemValue}>{tripPlan.end_date}</Text>
                        </View>
                        <View style={styles.coverItem}>
                            <Text style={styles.coverItemLabel}>设定预算</Text>
                            <Text style={styles.coverItemValue}>¥{tripPlan.budget}</Text>
                        </View>
                    </View>

                    <Text style={styles.coverFooter}>生成时间: {new Date().toLocaleDateString('zh-CN')} | AI Mini Travel Planner</Text>
                </View>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* Page 2: Itinerary details */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>详细日程表</Text>

                {tripDetails.map((day) => (
                    <View key={day.day_number} style={{ marginBottom: 16 }}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayTitle}>第 {day.day_number} 天</Text>
                            <Text style={styles.dayDate}>{day.content?.date || ''}</Text>
                        </View>

                        {/* Activities */}
                        {day.content?.activities?.map((activity, idx) => (
                            <View key={idx} style={styles.activityItem}>
                                <Text style={styles.activityTime}>{activity.time}</Text>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityName}>{activity.name}</Text>
                                    <Text style={styles.activityDesc}>{activity.description}</Text>
                                    <View style={styles.activityMeta}>
                                        {activity.location && (
                                            <Text style={styles.activityMetaItem}>📍 {activity.location}</Text>
                                        )}
                                        {activity.duration && (
                                            <Text style={styles.activityMetaItem}>⏱️ 停留: {activity.duration}</Text>
                                        )}
                                        {activity.cost > 0 && (
                                            <Text style={styles.activityMetaItem}>花费: ¥{activity.cost}</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}

                        {/* Daily Meals & Hotel */}
                        <View style={styles.dayBlock}>
                            <Text style={styles.blockTitle}>餐食安排</Text>
                            <View style={styles.mealsRow}>
                                <Text style={styles.mealItem}>早餐: {day.content?.meals?.breakfast || '自理'}</Text>
                                <Text style={styles.mealItem}>午餐: {day.content?.meals?.lunch || '自理'}</Text>
                                <Text style={styles.mealItem}>晚餐: {day.content?.meals?.dinner || '自理'}</Text>
                            </View>
                        </View>

                        {day.content?.hotel && (
                            <View style={styles.dayBlock}>
                                <Text style={styles.blockTitle}>住宿推荐</Text>
                                <Text style={styles.hotelText}>🏨 {day.content.hotel}</Text>
                            </View>
                        )}
                    </View>
                ))}
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* Page 3: Budget & Tips */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>预算明细分析</Text>
                
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableCol1}>消费类别</Text>
                        <Text style={styles.tableCol2}>预估费用</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol1}>交通出行</Text>
                        <Text style={styles.tableCol2}>¥{transTotal}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol1}>餐饮美食</Text>
                        <Text style={styles.tableCol2}>¥{mealsTotal}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol1}>景区门票</Text>
                        <Text style={styles.tableCol2}>¥{ticketsTotal}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol1}>休闲购物</Text>
                        <Text style={styles.tableCol2}>¥{shoppingTotal}</Text>
                    </View>
                    <View style={styles.tableRowLast}>
                        <Text style={styles.tableCol1}>总计预估消费</Text>
                        <Text style={styles.tableCol2}>¥{calculatedTotal}</Text>
                    </View>
                </View>

                {allTips.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                        <Text style={styles.sectionTitle}>AI 旅行小贴士</Text>
                        <View style={styles.tipsList}>
                            {allTips.slice(0, 10).map((tip, idx) => (
                                <View key={idx} style={styles.tipItem}>
                                    <Text style={styles.tipBullet}>•</Text>
                                    <Text style={styles.tipContent}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>
        </Document>
    );
}
