import { getCurrentUserProfile, getStudentReportAnalytics, listSubjects } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Colors = {
    text: "#333333",
    primary: "#6A2A94",
    background: "#F8F8F8",
};

const Fonts = {
    regular: "LexendDeca-Regular",
};

const STATUS_TAGS = {
    Strong: { text: "Strong", bgColor: "#D5F5E3", textColor: "#27AE60" },
    Weak: { text: "Weak", bgColor: "#FADBD8", textColor: "#E74C3C" },
    "Needs Improvement": { text: "Needs Improvement", bgColor: "#FCF3CF", textColor: "#F1C40F" },
    Developing: { text: "Developing", bgColor: "#D4E6F1", textColor: "#3498DB" },
} as const;

type StatusKey = keyof typeof STATUS_TAGS;

interface SubjectData {
    id: string;
    title: string;
    percentage: number;
    status: StatusKey;
    color: string;
}

const COLORS = ["#34D399", "#F97316", "#EC4899", "#3498DB", "#6A2A94", "#22C55E", "#EAB308", "#3B82F6"];


function mapPercentageToStatus(p: number): StatusKey {
    if (p >= 85) return "Strong";
    if (p >= 60) return "Developing";
    if (p >= 40) return "Needs Improvement";
    return "Weak";
}

// cards layout replaces circular progress

// --- SUBJECT ITEM COMPONENT (UPDATED) ---

interface SubjectItemProps {
    data: SubjectData;
}

const SubjectItem: React.FC<SubjectItemProps> = ({ data }) => {
    const statusData = STATUS_TAGS[data.status];

    const handlePress = () => {
        router.push({
            pathname: "/progress/[id]",
            params: { id: data.id },
        });
    };

    return (
        <TouchableOpacity style={[overviewStyles.metricCard, { backgroundColor: `${data.color}33` }]} onPress={handlePress}>
            <View style={overviewStyles.metricHeader}>
                <Text style={overviewStyles.metricTitle}>{data.title}</Text>
                <View style={overviewStyles.iconCircle}>
                    <Feather name="arrow-up-right" size={16} color={data.color} />
                </View>
            </View>
            <Text style={[overviewStyles.metricValue, { color: Colors.text }]}>{Math.round(data.percentage)}%</Text>
            <View style={[overviewStyles.statusPill, { backgroundColor: statusData.bgColor }]}>
                <Text style={[overviewStyles.statusText, { color: statusData.textColor }]}>{statusData.text}</Text>
            </View>
        </TouchableOpacity>
    );
};

// --- MAIN COMPONENT ---

export const ProgressOverviewCard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchAnalytics = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                const [subjectsRes, analyticsRes, profileRes] = await Promise.all([
                    listSubjects(),
                    getStudentReportAnalytics(user.id),
                    getCurrentUserProfile(),
                ]);
                const data = analyticsRes?.data || analyticsRes;
                const subjectPerf = (data?.subject_performance || []) as any[];
                const perfById: Record<string, any> = {};
                subjectPerf.forEach((sp) => { perfById[String(sp.subject_id)] = sp; });
                const progressReports = (
                    (profileRes?.student_info?.progress_report) ||
                    (profileRes?.progress_report) ||
                    (profileRes?.data?.student_info?.progress_report) ||
                    []
                ) as any[];
                const progressById: Record<string, number> = {};
                progressReports.forEach((pr: any) => {
                    const sid = String(pr.subject_id || pr.subjectId || "");
                    const pct = Number(pr.overall_completeness ?? pr.completeness ?? pr.percentage ?? 0);
                    if (sid) progressById[sid] = pct;
                });
                const subjectsList = Array.isArray(subjectsRes)
                    ? subjectsRes
                    : (subjectsRes?.subjects ?? subjectsRes?.items ?? []);

                const items: SubjectData[] = (subjectsList || []).map((s: any, idx: number) => {
                    const id = String(s.id || s.subject_id || s._id || s.uid || "");
                    const title = String(s.title || s.subject_title || s.name || "Untitled Subject");
                    const perf = id ? perfById[id] : null;
                    const percentage = (perf && perf.average_score != null)
                        ? Number(perf.average_score) || 0
                        : (id && progressById[id] != null)
                            ? Number(progressById[id]) || 0
                            : 0;
                    const status = mapPercentageToStatus(percentage);
                    return {
                        id,
                        title,
                        percentage,
                        status,
                        color: COLORS[idx % COLORS.length],
                    };
                });
                if (mounted) setSubjects(items);
            } catch (e: any) {
                const msg = e?.response?.data?.detail || e?.message || "Failed to load analytics";
                if (mounted) setError(msg);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchAnalytics();
        return () => { mounted = false; };
    }, [user?.id]);

    const content = useMemo(() => {
        if (loading) {
            return (
                <View style={{ paddingVertical: 16 }}>
                    <ActivityIndicator color={Colors.primary} />
                </View>
            );
        }
        if (error) {
            return (
                <Text style={{ color: "#E74C3C", paddingLeft: 4 }}>{error}</Text>
            );
        }
        if (!subjects.length) {
            return (
                <Text style={{ color: Colors.text, opacity: 0.7, paddingLeft: 4 }}>No subject analytics available yet.</Text>
            );
        }
        const sorted = [...subjects].sort((a, b) => a.percentage - b.percentage);
        const weakest = sorted[0];
        const strongest = sorted[sorted.length - 1];
        const analysisText = subjects.length === 1
            ? `You're focused on ${weakest.title}. Progress is ${Math.round(weakest.percentage)}%. Keep momentum with short, consistent study sessions and spaced review.`
            : `You're weakest in ${weakest.title} (${Math.round(weakest.percentage)}%). Make this your next study block. You're strong in ${strongest.title} (${Math.round(strongest.percentage)}%)—use it to build confidence, then rotate back to challenge.`;
        const weakestText = `You're weakest in ${weakest.title} (${Math.round(weakest.percentage)}%). Make this your next study block.`;
        const strongestText = `You're strong in ${strongest.title} (${Math.round(strongest.percentage)}%). Use it to build confidence, then rotate back to challenge.`;

        return (
            <View>
                <View style={overviewStyles.gridList}>
                    {subjects.map((subject) => (
                        <SubjectItem key={subject.id} data={subject} />
                    ))}
                </View>
                {subjects.length === 1 ? (
                    <View style={overviewStyles.analysisCard}>
                        <View style={overviewStyles.analysisRow}>
                            <View style={overviewStyles.analysisTextCol}>
                                <Text style={overviewStyles.analysisTitle}>Learning Insights</Text>
                                <Text style={overviewStyles.analysisText}>{analysisText}</Text>
                            </View>
                            <View style={overviewStyles.analysisImageCol}>
                                <Image source={require("@/assets/images/focusmore.png")} style={overviewStyles.analysisImage} />
                            </View>
                        </View>
                    </View>
                ) : (
                    <View>
                        <View style={overviewStyles.analysisCard}>
                            <View style={overviewStyles.analysisRow}>
                                <View style={overviewStyles.analysisTextCol}>
                                    <Text style={overviewStyles.analysisTitle}>Focus Now 🧐 </Text>
                                    <Text style={overviewStyles.analysisText}>{weakestText}</Text>
                                </View>
                                <View style={overviewStyles.analysisImageCol}>
                                    <Image source={require("@/assets/images/focusmore.png")} style={overviewStyles.analysisImage} />
                                </View>
                            </View>
                        </View>
                        <View style={overviewStyles.analysisCard}>
                            <View style={overviewStyles.analysisRow}>
                                <View style={overviewStyles.analysisTextCol}>
                                    <Text style={overviewStyles.analysisTitle}>Keep Going 😙</Text>
                                    <Text style={overviewStyles.analysisText}>{strongestText}</Text>
                                </View>
                                <View style={overviewStyles.analysisImageCol}>
                                    <Image source={require("@/assets/images/youregood.png")} style={overviewStyles.analysisImage} />
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    }, [loading, error, subjects]);

    return (
        <View style={overviewStyles.container}>
            <Text style={overviewStyles.mainTitle}>Learning Pathway Status</Text>
            {content}
        </View>
    );
};

// --- STYLES ---

const overviewStyles = StyleSheet.create({
    container: {
        marginBottom: 20,
        marginTop: 10
    },
    mainTitle: {
        fontFamily: Fonts.regular,
        fontSize: 18,
        color: Colors.text,
        marginBottom: 10,
        paddingLeft: 4,
    },
    gridList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    metricCard: {
        width: '49%',
        height: 140,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 0.5,
        borderColor: '#c9c9caff',
        justifyContent: 'space-between',
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metricTitle: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: Colors.text,
        opacity: 0.8,
    },
    iconCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    metricValue: {
        fontFamily: Fonts.regular,
        fontSize: 28,
        letterSpacing: 0.5,
    },
    statusPill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        fontFamily: Fonts.regular,
        fontSize: 11,
    }
    ,
    analysisCard: {
        marginTop: 10,
        borderRadius: 18,
        padding: 16,
        backgroundColor: "#fcfcfcff",
        borderWidth: 0.5,
        borderColor: '#4242aaff',
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },

    analysisTitle: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: Colors.primary,
        letterSpacing: 0.3,
        marginBottom: 8,
    },

    analysisText: {
        fontFamily: Fonts.regular,
        fontSize: 12.5,
        color: Colors.text,
        lineHeight: 20,
        opacity: 0.85,
    },
    analysisRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    analysisTextCol: {
        width: '60%',
        paddingRight: 10,
    },
    analysisImageCol: {
        width: '40%',
        alignItems: 'flex-end',
    },
    analysisImage: {
        width: '100%',
        height: 100,
        resizeMode: 'contain',
    },

});
