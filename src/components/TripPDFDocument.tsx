import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Chinese Font — client side uses absolute URL, SSR uses local path
if (typeof window !== 'undefined') {
    Font.register({
        family: 'NotoSC',
        src: `${window.location.origin}/fonts/NotoSansSC-Regular.woff`,
    });
} else {
    Font.register({
        family: 'NotoSC',
        src: 'd:/xiangmuwenjian1/public/fonts/NotoSansSC-Regular.woff',
    });
}

// Suppress the hyphenation warning — react-pdf tries to hyphenate CJK text
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
    page: {
        fontFamily: 'NotoSC',
        padding: 40,
        fontSize: 11,
        color: '#1f2937',
        lineHeight: 1.6,
    },
    // ── Cover ────────────────────────────────────────
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
        marginBottom: 12,
    },
    coverSubtitle: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 32,
    },
    coverGrid: {
        width: '100%',
        maxWidth: 360,
        border: '1pt solid #e5e7eb',
        borderRadius: 6,
        padding: 16,
        backgroundColor: '#f9fafb',
    },
    coverItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    coverItemLabel: {
        color: '#6b7280',
        fontSize: 11,
    },
    coverItemValue: {
        fontWeight: 'bold',
        color: '#111827',
        fontSize: 11,
    },
    coverFooter: {
        position: 'absolute',
        bottom: 40,
        fontSize: 9,
        color: '#9ca3af',
        textAlign: 'center',
    },
    // ── Section title ────────────────────────────────
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#059669',
        borderBottom: '1.5pt solid #059669',
        paddingBottom: 4,
        marginTop: 20,
        marginBottom: 12,
    },
    // ── Day card ─────────────────────────────────────
    dayHeader: {
        backgroundColor: '#ecfdf5',
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeft: '4pt solid #059669',
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
    // ── Activity item ─────────────────────────────────
    activityItem: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingLeft: 8,
        borderLeft: '1pt solid #d1fae5',
    },
    activityTime: {
        width: 52,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#059669',
    },
    activityContent: {
        flex: 1,
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
        flexWrap: 'wrap',
    },
    activityMetaItem: {
        fontSize: 9,
        color: '#9ca3af',
        marginRight: 10,
        marginTop: 2,
    },
    // ── Sub-blocks (meals / hotel) ────────────────────
    dayBlock: {
        backgroundColor: '#f9fafb',
        borderRadius: 4,
        padding: 8,
        marginTop: 6,
        marginBottom: 8,
        border: '1pt solid #f3f4f6',
    },
    blockLabel: {
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
    // ── Budget table ──────────────────────────────────
    table: {
        width: '100%',
        border: '1pt solid #e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#ecfdf5',
        fontWeight: 'bold',
        borderBottom: '1pt solid #e5e7eb',
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1pt solid #f3f4f6',
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    tableRowTotal: {
        flexDirection: 'row',
        backgroundColor: '#f0fdf4',
        fontWeight: 'bold',
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    tableCol1: { flex: 2, fontSize: 10 },
    tableCol2: { flex: 1, textAlign: 'right', fontSize: 10 },
    // ── Tips ─────────────────────────────────────────
    tipItem: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    tipBullet: {
        width: 12,
        fontSize: 10,
        color: '#059669',
    },
    tipContent: {
        flex: 1,
        fontSize: 10,
        color: '#4b5563',
    },
    // ── Page number ───────────────────────────────────
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
    },
});

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Activity {
    time?: string;
    duration?: string;
    name?: string;
    description?: string;
    location?: string;
    cost?: number;
}

interface BudgetBreakdown {
    transportation?: number;
    meals?: number;
    tickets?: number;
    shopping?: number;
}

interface Meals {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
}

interface DayContent {
    date?: string;
    hotel?: string;
    budget?: BudgetBreakdown;
    meals?: Meals;
    activities?: Activity[];
    tips?: string[];
}

interface DayDetail {
    day_number: number;
    content?: DayContent;
}

interface TripPDFDocumentProps {
    tripPlan: {
        title?: string;
        destination?: string;
        start_date?: string;
        end_date?: string;
        budget?: number;
    };
    tripDetails: DayDetail[];
}

// Safe number coerce
const n = (v: unknown) => Number(v) || 0;

// ─── Component ────────────────────────────────────────────────────────────────

export function TripPDFDocument({ tripPlan, tripDetails }: TripPDFDocumentProps) {
    const safeDetails = Array.isArray(tripDetails) ? tripDetails : [];

    // Aggregate budget totals
    let transTotal = 0, mealsTotal = 0, ticketsTotal = 0, shoppingTotal = 0;
    safeDetails.forEach((day) => {
        const b = day.content?.budget;
        if (b && typeof b === 'object') {
            transTotal    += n(b.transportation);
            mealsTotal    += n(b.meals);
            ticketsTotal  += n(b.tickets);
            shoppingTotal += n(b.shopping);
        }
    });
    const grandTotal = transTotal + mealsTotal + ticketsTotal + shoppingTotal;

    // Collect tips
    const allTips: string[] = [];
    safeDetails.forEach((day) => {
        if (Array.isArray(day.content?.tips)) {
            day.content!.tips!.forEach((t) => { if (t) allTips.push(String(t)); });
        }
    });

    const today = new Date().toLocaleDateString('zh-CN');

    return (
        <Document>
            {/* ── Page 1: Cover ── */}
            <Page size="A4" style={styles.page}>
                <View style={styles.coverContainer}>
                    <View style={styles.coverAccent} />
                    <Text style={styles.coverTitle}>{tripPlan?.title || '旅行规划'}</Text>
                    <Text style={styles.coverSubtitle}>AI 迷你旅行规划师 · 生成方案</Text>

                    <View style={styles.coverGrid}>
                        <View style={styles.coverItem}>
                            <Text style={styles.coverItemLabel}>目的地</Text>
                            <Text style={styles.coverItemValue}>{tripPlan?.destination || '-'}</Text>
                        </View>
                        <View style={styles.coverItem}>
                            <Text style={styles.coverItemLabel}>出发日期</Text>
                            <Text style={styles.coverItemValue}>{tripPlan?.start_date || '-'}</Text>
                        </View>
                        <View style={styles.coverItem}>
                            <Text style={styles.coverItemLabel}>返回日期</Text>
                            <Text style={styles.coverItemValue}>{tripPlan?.end_date || '-'}</Text>
                        </View>
                        <View style={[styles.coverItem, { marginBottom: 0 }]}>
                            <Text style={styles.coverItemLabel}>预算上限</Text>
                            <Text style={styles.coverItemValue}>
                                {tripPlan?.budget ? `Y ${tripPlan.budget}` : '-'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.coverFooter}>
                        {`生成时间: ${today}   |   AI Mini Travel Planner`}
                    </Text>
                </View>
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>

            {/* ── Page 2: Itinerary ── */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>详细日程安排</Text>

                {safeDetails.map((day) => {
                    const content = day.content || {};
                    const activities = Array.isArray(content.activities) ? content.activities : [];
                    const meals = content.meals || {};

                    return (
                        <View key={day.day_number} style={{ marginBottom: 14 }}>
                            {/* Day header */}
                            <View style={styles.dayHeader}>
                                <Text style={styles.dayTitle}>第 {day.day_number} 天</Text>
                                <Text style={styles.dayDate}>{content.date || ''}</Text>
                            </View>

                            {/* Activities */}
                            {activities.map((activity, idx) => (
                                <View key={idx} style={styles.activityItem}>
                                    <Text style={styles.activityTime}>{activity.time || ''}</Text>
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityName}>{activity.name || ''}</Text>
                                        {!!activity.description && (
                                            <Text style={styles.activityDesc}>{activity.description}</Text>
                                        )}
                                        <View style={styles.activityMeta}>
                                            {!!activity.location && (
                                                <Text style={styles.activityMetaItem}>
                                                    {`[地点] ${activity.location}`}
                                                </Text>
                                            )}
                                            {!!activity.duration && (
                                                <Text style={styles.activityMetaItem}>
                                                    {`[时长] ${activity.duration}`}
                                                </Text>
                                            )}
                                            {n(activity.cost) > 0 && (
                                                <Text style={styles.activityMetaItem}>
                                                    {`[费用] Y${activity.cost}`}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))}

                            {/* Meals */}
                            <View style={styles.dayBlock}>
                                <Text style={styles.blockLabel}>餐食安排</Text>
                                <View style={styles.mealsRow}>
                                    <Text style={styles.mealItem}>{`早: ${meals.breakfast || '自理'}`}</Text>
                                    <Text style={styles.mealItem}>{`午: ${meals.lunch || '自理'}`}</Text>
                                    <Text style={styles.mealItem}>{`晚: ${meals.dinner || '自理'}`}</Text>
                                </View>
                            </View>

                            {/* Hotel */}
                            {!!content.hotel && (
                                <View style={styles.dayBlock}>
                                    <Text style={styles.blockLabel}>住宿推荐</Text>
                                    <Text style={styles.hotelText}>{content.hotel}</Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>

            {/* ── Page 3: Budget & Tips ── */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>预算明细分析</Text>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableCol1}>消费类别</Text>
                        <Text style={styles.tableCol2}>预估费用</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol1}>交通出行</Text>
                        <Text style={styles.tableCol2}>{`Y ${transTotal}`}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol1}>餐饮美食</Text>
                        <Text style={styles.tableCol2}>{`Y ${mealsTotal}`}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol1}>景区门票</Text>
                        <Text style={styles.tableCol2}>{`Y ${ticketsTotal}`}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol1}>休闲购物</Text>
                        <Text style={styles.tableCol2}>{`Y ${shoppingTotal}`}</Text>
                    </View>
                    <View style={styles.tableRowTotal}>
                        <Text style={styles.tableCol1}>总计预估消费</Text>
                        <Text style={styles.tableCol2}>{`Y ${grandTotal}`}</Text>
                    </View>
                </View>

                {allTips.length > 0 && (
                    <View style={{ marginTop: 22 }}>
                        <Text style={styles.sectionTitle}>AI 旅行小贴士</Text>
                        {allTips.slice(0, 12).map((tip, idx) => (
                            <View key={idx} style={styles.tipItem}>
                                <Text style={styles.tipBullet}>{'* '}</Text>
                                <Text style={styles.tipContent}>{tip}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
}
