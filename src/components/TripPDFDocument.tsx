import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Build font src based on environment
const getFontSrc = () => {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/fonts/NotoSansSC-Regular.woff`;
    }
    return 'd:/xiangmuwenjian1/public/fonts/NotoSansSC-Regular.woff';
};

// Register font with BOTH normal and bold weights using the same file.
// react-pdf crashes with hasOwnProperty when fontWeight:'bold' is used
// but no bold variant is registered.
Font.register({
    family: 'NotoSC',
    fonts: [
        { src: getFontSrc(), fontWeight: 'normal' },
        { src: getFontSrc(), fontWeight: 'bold' },
    ],
});

// Disable hyphenation for CJK text
Font.registerHyphenationCallback((word) => [word]);

// ─── Styles ───────────────────────────────────────────────────────────────────

const C = {
    green: '#059669',
    greenLight: '#ecfdf5',
    greenDark: '#047857',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray900: '#111827',
    white: '#ffffff',
};

const styles = StyleSheet.create({
    // ── Page ─────────────────────────────────────────
    page: {
        fontFamily: 'NotoSC',
        paddingTop: 40,
        paddingBottom: 50,
        paddingLeft: 40,
        paddingRight: 40,
        fontSize: 10,
        color: C.gray900,
        lineHeight: 1.6,
        backgroundColor: C.white,
    },

    // ── Cover ─────────────────────────────────────────
    coverWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverBar: {
        width: 72,
        height: 5,
        backgroundColor: C.green,
        marginBottom: 20,
    },
    coverTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: C.green,
        textAlign: 'center',
        marginBottom: 8,
    },
    coverSub: {
        fontSize: 13,
        color: C.gray500,
        marginBottom: 28,
    },
    coverCard: {
        width: 300,
        backgroundColor: C.gray50,
        borderWidth: 1,
        borderColor: C.gray200,
        borderStyle: 'solid',
        borderRadius: 6,
        padding: 14,
    },
    coverRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    coverLabel: {
        fontSize: 10,
        color: C.gray500,
    },
    coverValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: C.gray900,
    },
    coverFooter: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: C.gray400,
    },

    // ── Section heading ───────────────────────────────
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: C.green,
        marginBottom: 10,
        marginTop: 16,
        paddingBottom: 4,
        borderBottomWidth: 1.5,
        borderBottomColor: C.green,
        borderBottomStyle: 'solid',
    },

    // ── Day header ────────────────────────────────────
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: C.greenLight,
        borderLeftWidth: 3,
        borderLeftColor: C.green,
        borderLeftStyle: 'solid',
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginBottom: 6,
    },
    dayTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: C.greenDark,
    },
    dayDate: {
        fontSize: 9,
        color: C.greenDark,
    },

    // ── Activity ──────────────────────────────────────
    actRow: {
        flexDirection: 'row',
        marginBottom: 7,
        paddingLeft: 6,
        borderLeftWidth: 1,
        borderLeftColor: C.gray200,
        borderLeftStyle: 'solid',
    },
    actTime: {
        width: 50,
        fontSize: 9,
        fontWeight: 'bold',
        color: C.green,
    },
    actBody: {
        flex: 1,
    },
    actName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: C.gray900,
    },
    actDesc: {
        fontSize: 9,
        color: C.gray600,
        marginTop: 1,
    },
    actMeta: {
        flexDirection: 'row',
        marginTop: 2,
        flexWrap: 'wrap',
    },
    actMetaText: {
        fontSize: 8,
        color: C.gray400,
        marginRight: 8,
    },

    // ── Sub block (meals / hotel) ─────────────────────
    subBlock: {
        backgroundColor: C.gray50,
        borderWidth: 1,
        borderColor: C.gray100,
        borderStyle: 'solid',
        borderRadius: 4,
        padding: 7,
        marginTop: 5,
        marginBottom: 6,
    },
    subBlockTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: C.gray700,
        marginBottom: 3,
    },
    mealsRow: {
        flexDirection: 'row',
    },
    mealText: {
        flex: 1,
        fontSize: 9,
        color: C.gray600,
    },
    hotelText: {
        fontSize: 9,
        color: C.gray600,
    },

    // ── Budget table ──────────────────────────────────
    tableHead: {
        flexDirection: 'row',
        backgroundColor: C.greenLight,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: C.gray200,
        borderStyle: 'solid',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: C.gray100,
        borderBottomStyle: 'solid',
        borderLeftWidth: 1,
        borderLeftColor: C.gray200,
        borderLeftStyle: 'solid',
        borderRightWidth: 1,
        borderRightColor: C.gray200,
        borderRightStyle: 'solid',
    },
    tableTotal: {
        flexDirection: 'row',
        backgroundColor: '#f0fdf4',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: C.gray200,
        borderStyle: 'solid',
    },
    col1: { flex: 2, fontSize: 10 },
    col1Bold: { flex: 2, fontSize: 10, fontWeight: 'bold' },
    col2: { flex: 1, fontSize: 10, textAlign: 'right' },
    col2Bold: { flex: 1, fontSize: 10, textAlign: 'right', fontWeight: 'bold' },

    // ── Tips ──────────────────────────────────────────
    tipRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    tipDot: {
        width: 12,
        fontSize: 9,
        color: C.green,
    },
    tipText: {
        flex: 1,
        fontSize: 9,
        color: C.gray600,
    },

    // ── Page number ───────────────────────────────────
    pageNum: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: C.gray400,
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

interface DayContent {
    date?: string;
    hotel?: string;
    budget?: {
        transportation?: number;
        meals?: number;
        tickets?: number;
        shopping?: number;
    };
    meals?: {
        breakfast?: string;
        lunch?: string;
        dinner?: string;
    };
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

const num = (v: unknown): number => {
    const n = Number(v);
    return isFinite(n) ? n : 0;
};

const str = (v: unknown, fallback = ''): string =>
    v != null && String(v).trim() ? String(v).trim() : fallback;

// ─── Component ────────────────────────────────────────────────────────────────

export function TripPDFDocument({ tripPlan, tripDetails }: TripPDFDocumentProps) {
    const safeDetails: DayDetail[] = Array.isArray(tripDetails) ? tripDetails : [];

    // Totals
    let trans = 0, meals = 0, tickets = 0, shopping = 0;
    safeDetails.forEach((d) => {
        const b = d.content?.budget;
        if (b && typeof b === 'object') {
            trans    += num(b.transportation);
            meals    += num(b.meals);
            tickets  += num(b.tickets);
            shopping += num(b.shopping);
        }
    });
    const grand = trans + meals + tickets + shopping;

    // Tips
    const tips: string[] = [];
    safeDetails.forEach((d) => {
        if (Array.isArray(d.content?.tips)) {
            d.content!.tips!.forEach((t) => { if (t) tips.push(str(t)); });
        }
    });

    const today = new Date().toLocaleDateString('zh-CN');

    return (
        <Document>

            {/* ═══ Cover ═══ */}
            <Page size="A4" style={styles.page}>
                <View style={styles.coverWrapper}>
                    <View style={styles.coverBar} />
                    <Text style={styles.coverTitle}>{str(tripPlan?.title, '旅行规划')}</Text>
                    <Text style={styles.coverSub}>AI 迷你旅行规划师 · 生成方案</Text>

                    <View style={styles.coverCard}>
                        {[
                            ['目的地', str(tripPlan?.destination, '-')],
                            ['出发日期', str(tripPlan?.start_date, '-')],
                            ['返回日期', str(tripPlan?.end_date, '-')],
                            ['预算上限', tripPlan?.budget ? `Y${tripPlan.budget}` : '-'],
                        ].map(([label, value]) => (
                            <View key={label} style={styles.coverRow}>
                                <Text style={styles.coverLabel}>{label}</Text>
                                <Text style={styles.coverValue}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.coverFooter}>{`生成时间: ${today}   |   AI Mini Travel Planner`}</Text>
                <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* ═══ Itinerary ═══ */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>详细日程安排</Text>

                {safeDetails.map((day) => {
                    const c = day.content || {};
                    const acts: Activity[] = Array.isArray(c.activities) ? c.activities : [];
                    const m = c.meals || {};

                    return (
                        <View key={day.day_number} style={{ marginBottom: 12 }}>
                            <View style={styles.dayHeader}>
                                <Text style={styles.dayTitle}>{`第 ${day.day_number} 天`}</Text>
                                <Text style={styles.dayDate}>{str(c.date)}</Text>
                            </View>

                            {acts.map((a, i) => (
                                <View key={i} style={styles.actRow}>
                                    <Text style={styles.actTime}>{str(a.time)}</Text>
                                    <View style={styles.actBody}>
                                        <Text style={styles.actName}>{str(a.name)}</Text>
                                        {!!a.description && (
                                            <Text style={styles.actDesc}>{str(a.description)}</Text>
                                        )}
                                        <View style={styles.actMeta}>
                                            {!!a.location && (
                                                <Text style={styles.actMetaText}>{`[地点] ${a.location}`}</Text>
                                            )}
                                            {!!a.duration && (
                                                <Text style={styles.actMetaText}>{`[时长] ${a.duration}`}</Text>
                                            )}
                                            {num(a.cost) > 0 && (
                                                <Text style={styles.actMetaText}>{`[费用] Y${a.cost}`}</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <View style={styles.subBlock}>
                                <Text style={styles.subBlockTitle}>餐食安排</Text>
                                <View style={styles.mealsRow}>
                                    <Text style={styles.mealText}>{`早: ${str(m.breakfast, '自理')}`}</Text>
                                    <Text style={styles.mealText}>{`午: ${str(m.lunch, '自理')}`}</Text>
                                    <Text style={styles.mealText}>{`晚: ${str(m.dinner, '自理')}`}</Text>
                                </View>
                            </View>

                            {!!c.hotel && (
                                <View style={styles.subBlock}>
                                    <Text style={styles.subBlockTitle}>住宿推荐</Text>
                                    <Text style={styles.hotelText}>{str(c.hotel)}</Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* ═══ Budget & Tips ═══ */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>预算明细分析</Text>

                <View style={styles.tableHead}>
                    <Text style={styles.col1Bold}>消费类别</Text>
                    <Text style={styles.col2Bold}>预估费用</Text>
                </View>
                {[
                    ['交通出行', trans],
                    ['餐饮美食', meals],
                    ['景区门票', tickets],
                    ['休闲购物', shopping],
                ].map(([label, val]) => (
                    <View key={String(label)} style={styles.tableRow}>
                        <Text style={styles.col1}>{String(label)}</Text>
                        <Text style={styles.col2}>{`Y${val}`}</Text>
                    </View>
                ))}
                <View style={styles.tableTotal}>
                    <Text style={styles.col1Bold}>总计预估消费</Text>
                    <Text style={styles.col2Bold}>{`Y${grand}`}</Text>
                </View>

                {tips.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.sectionTitle}>AI 旅行小贴士</Text>
                        {tips.slice(0, 12).map((tip, i) => (
                            <View key={i} style={styles.tipRow}>
                                <Text style={styles.tipDot}>- </Text>
                                <Text style={styles.tipText}>{tip}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>

        </Document>
    );
}
