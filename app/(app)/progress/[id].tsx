import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { Fonts } from "../../../constants/cognify-theme";

// --- Configuration ---
const Colors = {
    yellowBackground: "#FDFFB8", 
    whiteCard: "#FFFFFF",
    appBackground: "#ffffffff", 
    text: "#333333",
    secondaryText: "#A9A9A9", 
    primary: "#6A2A94", 
    darkPurple: "#4B0082", 
    progressTrack: "#EEEEEE",
    gradientStart: "#9932CC", 
    gradientEnd: "#BA55D3",
    activityIcon: "#7B68EE", 
    performanceIcon: "#FF6347", 
    bloomLevelLine: "#E9967A", 
    lineSeparator: "#E0E0E0",
    passPercent: "#333333", 
};


interface SubjectDetailData {
    id: string;
    title: string;
    passProbability: number;
    learningCompleted: number;
    assessmentCompleted: number;
    bloomPerformance: Record<string, number>; // Level name: score (0-100)
}

const SUBJECT_DETAILS: Record<string, SubjectDetailData> = {
    p1: {
        id: "p1",
        title: "Psychological Assessment",
        passProbability: 92,
        learningCompleted: 7,
        assessmentCompleted: 8,
        bloomPerformance: {
            remembering: 85,
            understanding: 75,
            applying: 65,
            analyzing: 55,
            evaluating: 45,
        },
    },
    p2: {
        id: "p2",
        title: "Development Psychology", 
        passProbability: 38,
        learningCompleted: 2,
        assessmentCompleted: 1,
        bloomPerformance: {
            remembering: 40,
            understanding: 30,
            applying: 15,
            analyzing: 5,
            evaluating: 0,
        },
    },
    p3: {
        id: "p3",
        title: "Abnormal Psychology",
        passProbability: 55,
        learningCompleted: 4,
        assessmentCompleted: 3,
        bloomPerformance: {
            remembering: 60,
            understanding: 50,
            applying: 35,
            analyzing: 25,
            evaluating: 15,
        },
    },
    p4: {
        id: "p4",
        title: "Development Psychology",
        passProbability: 68,
        learningCompleted: 5,
        assessmentCompleted: 6,
        bloomPerformance: {
            remembering: 70,
            understanding: 60,
            applying: 50,
            analyzing: 40,
            evaluating: 30,
        },
    },
};
// --- Components ---

interface SemiCircleProgressProps {
    percentage: number;
    colorStart: string;
    colorEnd: string;
    radius?: number;
    strokeWidth?: number;
}

const SemiCircleProgress: React.FC<SemiCircleProgressProps> = ({
    percentage,
    colorStart,
    colorEnd,
    radius = 120, // Increased radius for a larger look like in the image
    strokeWidth = 18, // Increased stroke width
}) => {
    // Half circumference, as it's a semi-circle
    const circumference = Math.PI * (radius - strokeWidth / 2);
    // Stroke dashoffset for progress: 100% - percentage
    const progressOffset = ((100 - percentage) / 100) * circumference;

    return (
        <View style={progressStyles.progressContainer}>
            <Svg
                // Adjusted height to account for the semi-circle and stroke width
                height={radius + strokeWidth / 2} 
                width={radius * 2}
                viewBox={`0 0 ${radius * 2} ${radius + strokeWidth / 2}`}
            >
                <Defs>
                    <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={colorStart} />
                        <Stop offset="100%" stopColor={colorEnd} />
                    </LinearGradient>
                </Defs>

                {/* Track */}
                <Circle
                    stroke={Colors.progressTrack}
                    fill="none"
                    cx={radius}
                    cy={radius}
                    r={radius - strokeWidth / 2}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    // Rotate 180 degrees to start the semi-circle at the top
                    rotation="-180"
                    origin={`${radius}, ${radius}`}
                />

                {/* Progress Circle */}
                <Circle
                    stroke="url(#gradient)"
                    fill="none"
                    cx={radius}
                    cy={radius}
                    r={radius - strokeWidth / 2}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    rotation="-180"
                    origin={`${radius}, ${radius}`}
                />
            </Svg>
            <View style={progressStyles.textContainer}>
                <Text style={progressStyles.subLabel}>Likely to Pass</Text>
                <Text style={progressStyles.percentageText}>{percentage}%</Text>
                <Text style={progressStyles.label}>Pass Probability</Text>
            </View>
        </View>
    );
};

interface BloomLevelLineProps {
    level: string;
    score: number; // Added score prop
}

const BloomLevelLine: React.FC<BloomLevelLineProps> = ({ level, score }) => {
    const progressWidth = `${score}%`;

    return (
        <View style={bloomStyles.lineContainer}>
            <View style={bloomStyles.levelHeader}>
                <Text style={bloomStyles.levelText}>{level}</Text>
            </View>
            
            <View style={bloomStyles.progressBarTrack}>
                <View style={[
                    bloomStyles.lineFill,
                    { width: progressWidth as `${number}%` | number } 
                ]} />
            </View>
            
            <View style={bloomStyles.separator} />
        </View>
    );
};

// --- Main Screen Component ---

const SubjectProgressDetailScreen: React.FC = () => {
    const { id } = useLocalSearchParams();
    const subjectId = Array.isArray(id) ? id[0] : id;

    const data = useMemo(() => SUBJECT_DETAILS[subjectId || "p1"], [subjectId]);

    if (!data) {
        return (
            <View style={[styles.scrollView, styles.centered]}>
                <Text style={styles.notFoundText}>Subject not found.</Text>
            </View>
        );
    }

    // Custom icons for the screenshot's visual style
    // The 'car' icon in the screenshot looks like a filled square with a car inside.
    const CarIcon = (props: { size: number, color: string, style?: any }) => (
        // Using a combination to simulate the look - Feather icons are simple
        <Feather name="truck" {...props} /> 
    );
    // The 'document' icon in the screenshot looks like a filled square with a chart/document inside.
    const DocIcon = (props: { size: number, color: string, style?: any }) => (
        <Feather name="file-text" {...props} /> 
    );


    return (
        <>
            {/* 1. Header Layout */}
            <View style={styles.headerContainer}>
                {/* Back button */}
                <View style={styles.backButton}>
                    <Feather
                        name="chevron-left"
                        size={24}
                        color="#333"
                        onPress={() => router.back()}
                    />
                </View>

                {/* Title */}
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{data.title}</Text>
                </View>
                {/* Spacer (to balance the back button on the left) */}
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.scrollView} 
                contentContainerStyle={styles.contentContainer}
            >
                {/* 2. Pass Probability Semi-Circle */}
                <SemiCircleProgress
                    percentage={data.passProbability}
                    colorStart={Colors.gradientStart}
                    colorEnd={Colors.gradientEnd}
                />
                
                <View style={styles.yellowContentWrapper}>

                    <View style={styles.cardContainer}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconWrapper, { backgroundColor: Colors.activityIcon }]}>
                                <CarIcon
                                    size={18}
                                    color={Colors.whiteCard}
                                />
                            </View>
                            <Text style={styles.cardTitle}>Activity Logged</Text>
                        </View>

                        {/* Data Rows */}
                        <View style={[activityStyles.row, activityStyles.firstRow]}>
                            <Text style={activityStyles.label}>Learning Completed</Text>
                            <Text style={activityStyles.value}>{data.learningCompleted}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Assessment Completed</Text>
                            <Text style={activityStyles.value}>{data.assessmentCompleted}</Text>
                        </View>
                    </View>

                    {/* 5. Performance by Bloom Levels Card */}
                    <View style={styles.cardContainer}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconWrapper, { backgroundColor: Colors.performanceIcon }]}>
                                <DocIcon
                                    size={18}
                                    color={Colors.whiteCard}
                                />
                            </View>
                            <Text style={styles.cardTitle}>Performance by Bloom Levels</Text>
                        </View>

                        {/* Bloom Level Progress Bars */}
                        {Object.entries(data.bloomPerformance).map(([level, score]) => (
                            <BloomLevelLine key={level} level={level} score={score} />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </>
    );
};

export default SubjectProgressDetailScreen;

// --- Styles ---

const styles = StyleSheet.create({
    // --- START: NEW HEADER STYLES ---
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 0.3,
        borderColor: Colors.lineSeparator,
        backgroundColor:"#F7F8FB",
        width: '100%',
    },
    backButton: {
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitleContainer: {
        alignItems: "center",
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        fontFamily: Fonts.regular, 
    },
    // --- END: NEW HEADER STYLES ---
    
    scrollView: {
        flex: 1,
        backgroundColor: Colors.appBackground, // Light background for the overall screen
    },
    contentContainer: {
        paddingBottom: 30,
        alignItems: "center",
    },
    
    // The wrapper that provides the yellow background ONLY to the card area
    yellowContentWrapper: {
        width: "100%",
        backgroundColor: Colors.yellowBackground,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 100,
        borderRadius: 45,
    },
    
    cardContainer: {
        width: "100%",
        backgroundColor: Colors.whiteCard, // All cards are white
        borderRadius: 16,
        padding: 30,
        marginBottom: 20,
        // Added subtle shadow to make the white cards pop against the yellow background
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2.22,
        elevation: 3,
    },
    
    // Removed activityCard style as it's no longer needed, all cards are white
    
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        paddingBottom: 0,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cardTitle: {
        fontFamily: Fonts.poppinsRegular,
        fontSize: 15,
        color: Colors.text,
        fontWeight: 'bold', 
    },
    notFoundText: {
        fontFamily: Fonts.poppinsRegular,
        fontSize: 14,
        color: Colors.text,
        marginTop: 50,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

const progressStyles = StyleSheet.create({
    progressContainer: {
        alignItems: "center",
        marginBottom: 30,
        marginTop: 20, 
        paddingHorizontal: 15, // Ensure the container doesn't exceed screen width
    },
    textContainer: {
        position: "absolute",
        // Position the text to be in the center-bottom of the semi-circle arc
        top: "30%", // Adjusted to be visually central
        alignItems: "center",
    },
    subLabel: {
        fontFamily: Fonts.poppinsRegular,
        fontSize: 14,
        color: Colors.secondaryText,
        marginBottom: 5,
    },
    percentageText: {
        fontFamily: Fonts.poppinsMedium,
        fontSize: 55, // Larger size
        color: Colors.passPercent,
        fontWeight: 'bold',
        lineHeight: 60,
    },
    label: {
        fontFamily: Fonts.poppinsRegular,
        fontSize: 14,
        color: Colors.secondaryText,
    },
});

const activityStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1, 
        borderBottomColor: Colors.lineSeparator,
        width: '100%',
    },
    firstRow: {
        paddingTop: 0, 
    },
    label: {
        fontFamily: Fonts.poppinsRegular,
        fontSize: 14,
        color: Colors.text,
    },
    value: {
        fontFamily: Fonts.poppinsMedium,
        fontSize: 16,
        color: Colors.text,
        fontWeight: "bold",
    },
});

const bloomStyles = StyleSheet.create({
    lineContainer: {
        paddingVertical: 10,
        paddingHorizontal: 0,
    },
    levelHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    levelText: {
        fontFamily: Fonts.poppinsRegular,
        fontSize: 14, 
        color: Colors.text,
        textTransform: "capitalize",
    },
    levelScore: { // New style for the score text (e.g., 85%)
        fontFamily: Fonts.poppinsMedium,
        fontSize: 14,
        color: Colors.text,
        fontWeight: 'bold',
    },
    progressBarTrack: {
        width: "100%", // The full track width
        height: 4, // Increased height for better visibility as a bar
        backgroundColor: Colors.progressTrack, // Light gray track
        borderRadius: 2,
        marginBottom: 2, 
        overflow: 'hidden', // Ensures the fill stays within the track boundaries
    },
    lineFill: {
        height: "100%", 
        backgroundColor: Colors.bloomLevelLine,
        borderRadius: 2,
        // The width is set inline based on the score prop
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.lineSeparator,
        marginTop: 10, 
    },
});