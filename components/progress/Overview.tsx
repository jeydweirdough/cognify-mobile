import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { getStudentReportAnalytics, listSubjects } from "@/lib/api";

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

function mapStatusToTag(status?: string): StatusKey {
    const s = (status || "").toLowerCase();
    if (s.includes("good")) return "Strong";
    if (s.includes("needs review") || s.includes("improvement")) return "Needs Improvement";
    return "Developing";
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
                const [subjectsRes, analyticsRes] = await Promise.all([
                    listSubjects(),
                    getStudentReportAnalytics(user.id),
                ]);
                const data = analyticsRes?.data || analyticsRes;
                const subjectPerf = (data?.subject_performance || []) as any[];
                const perfById: Record<string, any> = {};
                subjectPerf.forEach((sp) => { perfById[String(sp.subject_id)] = sp; });

                const items: SubjectData[] = (subjectsRes || []).map((s: any, idx: number) => {
                    const id = String(s.id || s.subject_id || s._id || s.uid || "");
                    const title = String(s.title || s.subject_title || s.name || "Untitled Subject");
                    const perf = id ? perfById[id] : null;
                    const percentage = perf ? Number(perf.average_score) || 0 : 0;
                    const status = perf ? mapStatusToTag(perf.status) : "Developing";
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
        return (
            <View style={overviewStyles.gridList}>
                {subjects.map((subject) => (
                    <SubjectItem key={subject.id} data={subject} />
                ))}
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
        marginTop:10
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
});
