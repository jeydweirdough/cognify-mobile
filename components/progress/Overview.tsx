import {
    getCurrentUserProfile,
    getStudentReportAnalytics,
    listSubjects,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// --- CONFIGURATION CONSTANTS ---
const Colors = {
  text: "#2D1F2C", // Dark text for pastel cards
  subText: "#5A4A5A", // Softer dark text
  primary: "#48316D", // Deep Brand Purple
  background: "#FDFBF7", // Cream background (matches Profile/Home)
  white: "#FFFFFF",
  lightGray: "#F0F0F0",
};

const Fonts = {
  // Assuming 'LexendDeca-Regular' is available
  regular: "LexendDeca-Regular",
};

// Updated Status Tags to pop against pastel backgrounds
const STATUS_TAGS = {
  Strong: { text: "Strong", bgColor: "#FFFFFF", textColor: "#27AE60" },
  Developing: { text: "Developing", bgColor: "#FFFFFF", textColor: "#3498DB" },
  "Needs Improvement": {
    text: "Improve",
    bgColor: "#FFFFFF",
    textColor: "#F1C40F",
  },
  Weak: { text: "Weak", bgColor: "#FFFFFF", textColor: "#E74C3C" },
  "No Progress": {
    text: "No Data",
    bgColor: "rgba(255,255,255,0.6)",
    textColor: "#7F8C8D",
  },
} as const;

type StatusKey = keyof typeof STATUS_TAGS;

interface SubjectData {
  id: string;
  title: string;
  percentage: number;
  status: StatusKey;
  color: string; // The assigned accent color for the subject
}

// Unused legacy colors array kept for reference, but UI now uses SUBJECT_CARD_COLORS
const COLORS = ["#34D399", "#F97316", "#EC4899", "#3498DB"];

// NEW PALETTE: Matches the "Subjects" screen (Pastel Blue, Pink, Mint, Yellow)
const SUBJECT_CARD_COLORS = [
  "#E6F6FD", // Pastel Blue (Psych Assessment style)
  "#F3E5F5", // Pastel Lilac (Ind-Org style)
  "#E8F5E9", // Pastel Mint (Abnormal Psych style)
  "#FFF8E1", // Pastel Cream/Yellow (Dev Psych style)
];

function mapPercentageToStatus(p: number): StatusKey {
  const rp = Math.round(Number(p) || 0);
  if (rp <= 0) return "No Progress";
  if (p >= 85) return "Strong";
  if (p >= 60) return "Developing";
  if (p >= 40) return "Needs Improvement";
  return "Weak";
}

// --- SUBJECT PROGRESS CARD COMPONENT ---

interface SubjectItemProps {
  data: SubjectData;
  idx: number;
}

const SubjectItem: React.FC<SubjectItemProps> = ({ data, idx }) => {
  const statusData = STATUS_TAGS[data.status];
  const percentage = Math.round(data.percentage);
  const cardBgColor = SUBJECT_CARD_COLORS[idx % SUBJECT_CARD_COLORS.length];

  return (
    <TouchableOpacity
      style={[overviewStyles.subjectCard, { backgroundColor: cardBgColor }]}
    >
      <View style={overviewStyles.cardHeader}>
        <Text style={overviewStyles.subjectTitle} numberOfLines={2}>
          {data.title}
        </Text>
      </View>
      <View style={overviewStyles.cardBottomRow}>
        {percentage > 0 ? (
          <View style={overviewStyles.percentRow}>
            <Text style={overviewStyles.percentNumber}>{percentage}</Text>
            <Text style={overviewStyles.percentSymbol}>%</Text>
          </View>
        ) : (
          <View style={overviewStyles.leftCol} />
        )}
        <View
          style={[
            overviewStyles.statusPill,
            { backgroundColor: statusData.bgColor },
          ]}
        >
          <Text
            style={[overviewStyles.statusText, { color: statusData.textColor }]}
          >
            {statusData.text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- INSIGHT CARD COMPONENT (CONSOLIDATED ANALYSIS) ---

interface InsightCardProps {
  type: "weakest" | "strongest";
  dataList: SubjectData[];
}

const InsightCard: React.FC<InsightCardProps> = ({ type, dataList }) => {
  const isWeakest = type === "weakest";
  const iconName = isWeakest ? "alert-circle" : "zap";
  const title = isWeakest ? "Focus Area" : "Strength Area";
  // Softened border colors to match new aesthetic
  const accentColor = isWeakest ? "#FF8A65" : "#7986CB";
  const bgColor = isWeakest ? "#FFF3E0" : "#E8EAF6"; // Very light orange vs very light indigo

  const percentage = Math.round(dataList[0]?.percentage ?? 0);
  const titles = dataList.map((d) => d.title);
  const subjectText =
    titles.length <= 1
      ? titles[0] || ""
      : `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
  const textParts = isWeakest
    ? [
        "You're scoring ",
        `${percentage}%`,
        " in ",
        subjectText,
        ". Prioritize this subject for your next few study blocks.",
      ]
    : [
        "You're performing well at ",
        `${percentage}%`,
        " in ",
        subjectText,
        ". Use quick reviews here to lock in your mastery.",
      ];

  return (
    <View
      style={[
        overviewStyles.insightSection,
        { backgroundColor: bgColor, borderColor: accentColor },
      ]}
    >
      <View style={overviewStyles.insightHeader}>
        <Feather name={iconName} size={18} color={accentColor} />
        <Text
          style={[
            overviewStyles.insightTitle,
            { color: Colors.text, marginLeft: 8 },
          ]}
        >
          {title}
        </Text>
      </View>
      <Text style={overviewStyles.insightText}>
        {textParts[0]}
        <Text style={{ fontWeight: "bold", color: accentColor }}>
          {textParts[1]}
        </Text>
        {textParts[2]}
        <Text style={{ fontWeight: "bold", color: Colors.text }}>
          {textParts[3]}
        </Text>
        {textParts[4]}
      </Text>
    </View>
  );
};

// --- MAIN CONTENT RENDERER ---

const MainContent: React.FC<{ subjects: SubjectData[] }> = ({ subjects }) => {
  const sorted = [...subjects].sort((a, b) => a.percentage - b.percentage);
  const minRounded = sorted.length ? Math.round(sorted[0].percentage) : 0;
  const maxRounded = sorted.length
    ? Math.round(sorted[sorted.length - 1].percentage)
    : 0;
  const weakestList = subjects.filter(
    (s) => Math.round(s.percentage) === minRounded
  );
  const strongestList = subjects.filter(
    (s) => Math.round(s.percentage) === maxRounded
  );
  const isNoProgress =
    subjects.length > 0 && subjects.every((s) => Math.round(s.percentage) <= 0);

  return (
    <View>
      {/* Subject Grid List */}
      <View style={overviewStyles.gridList}>
        {subjects.map((subject, idx) => (
          <SubjectItem key={subject.id} data={subject} idx={idx} />
        ))}
      </View>

      {/* Personalized Learning Insights */}
      <View style={overviewStyles.analysisCard}>
        <Text style={overviewStyles.mainInsightTitle}>Learning Insights</Text>
        {isNoProgress ? (
          <View style={overviewStyles.insightContainer}>
            <View
              style={[
                overviewStyles.insightSection,
                {
                  backgroundColor: Colors.white,
                  borderColor: Colors.lightGray,
                },
              ]}
            >
              <View style={overviewStyles.insightHeader}>
                <Feather name="info" size={18} color={Colors.primary} />
                <Text
                  style={[
                    overviewStyles.insightTitle,
                    { color: Colors.text, marginLeft: 8 },
                  ]}
                >
                  No progress yet
                </Text>
              </View>
              <Text style={overviewStyles.insightText}>
                Start your diagnostic and study modules to generate insights and
                track your learning.
              </Text>
            </View>
          </View>
        ) : (
          subjects.length > 0 && (
            <View style={overviewStyles.insightContainer}>
              <InsightCard type="weakest" dataList={weakestList} />
              {subjects.length > 1 && (
                <InsightCard type="strongest" dataList={strongestList} />
              )}
            </View>
          )
        )}
        <View style={{ marginTop: 10, alignItems: "center" }}></View>
      </View>
    </View>
  );
};

// --- MAIN EXPORT COMPONENT (Data Fetching & Loading) ---

export const ProgressOverviewCard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Data fetching logic remains the same
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
        subjectPerf.forEach((sp) => {
          perfById[String(sp.subject_id)] = sp;
        });

        const progressReports = (profileRes?.student_info?.progress_report ||
          profileRes?.progress_report ||
          profileRes?.data?.student_info?.progress_report ||
          []) as any[];

        const progressById: Record<string, number> = {};
        progressReports.forEach((pr: any) => {
          const sid = String(pr.subject_id || pr.subjectId || "");
          const pct = Number(
            pr.overall_completeness ?? pr.completeness ?? pr.percentage ?? 0
          );
          if (sid) progressById[sid] = pct;
        });

        const subjectsList = Array.isArray(subjectsRes)
          ? subjectsRes
          : subjectsRes?.subjects ?? subjectsRes?.items ?? [];
        const locals = await Promise.all(
          (subjectsList || []).map(async (s: any) => {
            const sid = String(s.id || s.subject_id || s._id || s.uid || "");
            const modKey = sid ? `subject_module_progress:${sid}` : "";
            const assessKey = sid ? `subject_assessment_progress:${sid}` : "";
            let modPct = 0;
            let assessPct = 0;
            try {
              const raw = modKey ? await storage.getItem(modKey) : null;
              if (raw) {
                const parsed = JSON.parse(raw);
                modPct = Number(parsed?.percentage ?? 0) || 0;
              }
            } catch {}
            try {
              const raw = assessKey ? await storage.getItem(assessKey) : null;
              if (raw) {
                const parsed = JSON.parse(raw);
                assessPct = Number(parsed?.percentage ?? 0) || 0;
              }
            } catch {}
            return { sid, modPct, assessPct };
          })
        );

        const items: SubjectData[] = (subjectsList || [])
          .map((s: any, idx: number) => {
            const id = String(s.id || s.subject_id || s._id || s.uid || "");
            const title = String(
              s.title || s.subject_title || s.name || "Untitled Subject"
            );
            const perf = id ? perfById[id] : null;
            const local = locals.find((l) => l.sid === id) || {
              sid: id,
              modPct: 0,
              assessPct: 0,
            };
            const fromPerf =
              perf && perf.average_score != null
                ? Number(perf.average_score) || 0
                : null;
            const fromReport =
              id && progressById[id] != null
                ? Number(progressById[id]) || 0
                : null;
            const fromLocals = (() => {
              const a = Number(local.assessPct) || 0;
              const m = Number(local.modPct) || 0;
              if (a && m) return Math.round((a + m) / 2);
              return a || m || 0;
            })();
            const percentage = fromPerf ?? fromReport ?? fromLocals ?? 0;

            const status = mapPercentageToStatus(percentage);

            return {
              id,
              title,
              percentage,
              status,
              color: COLORS[idx % COLORS.length],
            };
          })
          .filter((s: SubjectData) => s.title !== "Untitled Subject");

        if (mounted) setSubjects(items);
      } catch (e: any) {
        const msg =
          e?.response?.data?.detail || e?.message || "Failed to load analytics";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      );
    }
    if (error) {
      return (
        <View style={{ paddingVertical: 10, paddingLeft: 4 }}>
          <Text style={{ color: "#E74C3C", fontSize: 14 }}>
            Error loading data: {error}
          </Text>
        </View>
      );
    }
    if (!subjects.length) {
      return (
        <View style={{ paddingVertical: 10, paddingLeft: 4 }}>
          <Text style={{ color: Colors.text, opacity: 0.7, fontSize: 14 }}>
            No subject analytics available yet. Start your learning journey!
          </Text>
        </View>
      );
    }
    return <MainContent subjects={subjects} />;
  }, [loading, error, subjects]);

  return (
    <View style={overviewStyles.container}>
      <Text style={overviewStyles.mainTitle}>Evaluation Overview</Text>
      {content}
    </View>
  );
};

// --- STYLES ---

const overviewStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 10,
  },
  mainTitle: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
    paddingLeft: 4,
  },
  gridList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },

  // --- Redesigned Subject Card Style (Pastel Look) ---
  subjectCard: {
    width: "48%", // slightly tighter
    height: 140,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    // Background color is set dynamically via props
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 8,
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  leftCol: {
    flex: 1,
  },
  percentNumber: {
    fontFamily: Fonts.regular,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: Colors.text, // Changed from White to Dark
  },
  percentSymbol: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.7,
    color: Colors.text, // Changed from White to Dark
    marginLeft: 2,
  },
  subjectTitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text, // Changed from White to Dark
    lineHeight: 20,
    flexShrink: 1,
  },

  // --- Status Pill Styles ---
  statusPill: {
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    // Bg color handled dynamically
  },
  statusText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    fontWeight: "700",
  },

  // --- Updated Analysis/Insight Card Styles ---
  analysisCard: {
    marginTop: 20,
  },
  mainInsightTitle: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
    paddingLeft: 4,
  },
  insightContainer: {
    // Holds both insight cards vertically
  },
  insightSection: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    // Border and BG handled dynamically
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  insightTitle: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    fontWeight: "700",
  },
  insightText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.subText,
    lineHeight: 22,
    marginTop: 4,
  },
});
