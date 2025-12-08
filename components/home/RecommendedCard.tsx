import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FONT_FAMILY, PRIMARY_COLOR } from "@/constants/cognify-theme";
import { getDiagnosticRecommendations, getSubjectTopics, listSubjects } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { useFocusEffect } from "@react-navigation/native";

interface RecommendedCardProps {
  hasTakenAssessment?: boolean;
  weakestSubject?: string;
  onCardPress?: () => void;
}

export default function RecommendedCard({
  hasTakenAssessment,
  weakestSubject,
  onCardPress,
}: RecommendedCardProps) {
  const { user, token } = useAuth() as any;
  const [localHasTaken, setLocalHasTaken] = useState(false);
  const [recommendedSubjects, setRecommendedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Strip " - Diagnostic" suffix from subject names
  const cleanSubjectName = (name: string): string => {
    return String(name || "").replace(/\s*-\s*Diagnostic\s*$/i, "").trim();
  };

  const findSubjectIdForTitle = async (key: string): Promise<string | null> => {
    const cleanKey = cleanSubjectName(key);
    try {
      const items = await listSubjects();
      const lower = cleanKey.toLowerCase();
      
      for (const it of items as any[]) {
        const id = String(it?.id ?? "");
        const title = cleanSubjectName(String(it?.title ?? ""));
        
        if (!id && !title) continue;
        
        // Direct ID match
        if (id === cleanKey) return id;
        
        // Title match (case-insensitive)
        if (title && title.toLowerCase() === lower) return id || null;
      }
    } catch {}
    
    // Fallback: try fetching directly
    try {
      const s = await getSubjectTopics(cleanKey);
      const sid = String(s?.id ?? "");
      if (sid) return sid;
    } catch {}
    
    return null;
  };

  const navigateToSubject = async (title: string) => {
    const id = await findSubjectIdForTitle(title);
    if (id) {
      const cleanTitle = cleanSubjectName(title);
      router.push({ 
        pathname: "/(app)/subject/[id]", 
        params: { id, subjectTitle: cleanTitle } 
      });
    } else {
      console.warn(`Could not find subject ID for: ${title}`);
    }
  };

  const resolveSubjectTitles = async (subjects: string[]) => {
    try {
      const items = await listSubjects();
      const byId = new Map<string, string>();
      const byTitleLower = new Map<string, string>();
      const byTitleLowerToId = new Map<string, string>();
      
      items.forEach((it: any) => {
        const id = String(it?.id ?? "");
        const rawTitle = String(it?.title ?? "");
        const title = cleanSubjectName(rawTitle);
        
        if (id) byId.set(id, title);
        if (title) {
          const lower = title.toLowerCase();
          byTitleLower.set(lower, title);
          if (id) byTitleLowerToId.set(lower, id);
        }
      });

      const resolved = await Promise.all(
        subjects.map(async (s) => {
          const cleanKey = cleanSubjectName(String(s));
          const lower = cleanKey.toLowerCase();
          
          // Try ID lookup
          const id = byId.has(cleanKey) ? cleanKey : (byTitleLowerToId.get(lower) ?? null);
          
          if (id) {
            try {
              const d = await getSubjectTopics(id);
              return cleanSubjectName(String(d?.title ?? byId.get(id) ?? cleanKey));
            } catch {
              return byId.get(id) ?? cleanKey;
            }
          }
          
          // Try direct fetch as fallback
          try {
            const d = await getSubjectTopics(cleanKey);
            return cleanSubjectName(String(d?.title ?? byTitleLower.get(lower) ?? cleanKey));
          } catch {
            return byTitleLower.get(lower) ?? cleanKey;
          }
        })
      );
      
      return resolved;
    } catch {
      return subjects.map(cleanSubjectName);
    }
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        if (token && user?.id) {
          const data = await getDiagnosticRecommendations();
          const rec = Array.isArray(data?.recommendedSubjects) ? data.recommendedSubjects : [];
          const scores = Array.isArray(data?.subjectScores) ? data.subjectScores : [];
          let subjects: string[] = [];
          
          if (rec.length) {
            subjects = rec.slice(0, 2);
          } else if (scores.length) {
            const sorted = scores.slice().sort((a: any, b: any) => 
              (a.correct / a.total) - (b.correct / b.total)
            );
            subjects = sorted.slice(0, 2).map((s: any) => String(s.subject));
          }
          
          if (subjects.length) {
            const titles = await resolveSubjectTitles(subjects);
            setRecommendedSubjects(titles);
            setLocalHasTaken(true);
            return;
          }
        }

        // Fallback to local storage
        if (!user?.id) return;
        const key = `diagnostic_assessment_results:${user.id}`;
        const raw = await storage.getItem(key);
        if (!raw) return;
        
        const parsed = JSON.parse(raw);
        const recommendedFromBackend: string[] | undefined = parsed.recommendedSubjects;
        const scores: { subject: string; correct: number; total: number }[] = parsed.subjectScores || [];
        let subjects: string[] = [];
        
        if (recommendedFromBackend && recommendedFromBackend.length > 0) {
          subjects = recommendedFromBackend.slice(0, 2);
        } else if (scores.length > 0) {
          const sorted = scores.slice().sort((a, b) => 
            (a.correct / a.total) - (b.correct / b.total)
          );
          subjects = sorted.slice(0, 2).map(s => s.subject);
        }
        
        if (subjects.length === 0) return;
        const titles = await resolveSubjectTitles(subjects);
        setRecommendedSubjects(titles);
        setLocalHasTaken(true);
      } catch (e) {
        console.error('Failed to load recommendations', e);
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
  }, [user?.id, token]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      const refresh = async () => {
        try {
          setLoading(true);
          if (!user?.id) return;
          
          const key = `diagnostic_assessment_results:${user.id}`;
          const raw = await storage.getItem(key);
          if (!raw || !active) return;
          
          const parsed = JSON.parse(raw);
          const recommendedFromBackend: string[] | undefined = parsed.recommendedSubjects;
          const scores: { subject: string; correct: number; total: number }[] = parsed.subjectScores || [];
          let subjects: string[] = [];
          
          if (recommendedFromBackend && recommendedFromBackend.length > 0) {
            subjects = recommendedFromBackend.slice(0, 2);
          } else if (scores.length > 0) {
            const sorted = scores.slice().sort((a, b) => 
              (a.correct / a.total) - (b.correct / b.total)
            );
            subjects = sorted.slice(0, 2).map(s => s.subject);
          }
          
          if (subjects.length > 0) {
            const titles = await resolveSubjectTitles(subjects);
            setRecommendedSubjects(titles);
            setLocalHasTaken(true);
          }
        } catch (e) {
          console.error('Refresh failed', e);
        } finally {
          if (active) setLoading(false);
        }
      };
      refresh();
      return () => {
        active = false;
      };
    }, [user?.id])
  );

  let content;
  let title;

  const effectiveHasTaken = hasTakenAssessment ?? localHasTaken;
  const effectiveSubjects = recommendedSubjects.length > 0 
    ? recommendedSubjects 
    : (weakestSubject ? [cleanSubjectName(weakestSubject)] : []);

  if (loading) {
    title = "Loading";
    content = (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator color={PRIMARY_COLOR} />
      </View>
    );
  } else if (!effectiveHasTaken) {
    title = "Discover Your Learning Path";
    content = (
      <View style={styles.noAssessmentCard}>
        <Text style={styles.noAssessmentText}>
          Take Diagnostic to help us recommend the important subjects for your review!
        </Text>
      </View>
    );
  } else {
    title = "Recommend for You:";
    content = (
      <View>
        {effectiveSubjects.length === 0 ? (
          <Text style={styles.recommendedText}>No recommendation yet</Text>
        ) : (
          effectiveSubjects.map((subject, idx) => (
            <View key={`${subject}-${idx}`} style={styles.cardStack}>
              <View style={styles.backCard} />
              <TouchableOpacity
                style={styles.recommendedCard}
                activeOpacity={0.9}
                onPress={onCardPress || (() => navigateToSubject(subject))}
              >
                <Text style={styles.sectionSubtitle}>Subject:</Text>
                <View style={styles.recommendedContent}>
                  <Text style={styles.recommendedText}>{subject}</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
                <View style={styles.recommendedBadges}>
                  <View style={styles.badgeDiagnostic}>
                    <Text style={styles.badgeText}>BASED ON DIAGNOSTIC</Text>
                  </View>
                  <View style={styles.badgeStartFirst}>
                    <Text style={styles.badgeText}>START FIRST</Text>
                  </View>
                  <View style={styles.badgeWeak}>
                    <Text style={styles.badgeText}>{idx === 0 ? 'WEAKEST' : 'WEAK'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  sectionTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  recommendedCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#565454ff",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  cardStack: {
    position: "relative",
    marginTop: 8,
  },
  backCard: {
    position: "absolute",
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: "#e3e1e1ff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#9a9a9aff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  recommendedContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recommendedText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: "600",
    paddingBottom: 6,
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },
  arrowIcon: { fontSize: 24, color: PRIMARY_COLOR, marginLeft: 8 },
  recommendedBadges: { flexDirection: "row", marginBottom: 15 },
  badgeDiagnostic: {
    backgroundColor: "#CDE0FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeStartFirst: {
    backgroundColor: "#70E3BB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeWeak: {
    backgroundColor: "#FFAEAF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: "Poppins-Medium",
    color: "#000000",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  noAssessmentCard: {
    backgroundColor: "#F0F0FF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D0D0FF",
    marginTop: 8,
    alignItems: 'center',
  },
  noAssessmentText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    color: "#333",
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
});