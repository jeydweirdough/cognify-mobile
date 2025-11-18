import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

// Define local constants based on the existing file (ProgressScreen.tsx)
const Colors = {
    text: "#333333",
    primary: "#6A2A94", // Main text color for the component
    background: "#F8F8F8", // Card background for contrast
};

const Fonts = {
    semiBold: "LexendDeca-Medium",
};

// --- DATA STRUCTURE & TYPES ---

// Status tag definitions for consistent coloring
const STATUS_TAGS = {
    Strong: { text: "Strong", bgColor: "#D5F5E3", textColor: "#27AE60" }, // Greenish
    Weak: { text: "Weak", bgColor: "#FADBD8", textColor: "#E74C3C" }, // Pinkish/Reddish
    "Needs Improvement": { text: "Needs Improvement", bgColor: "#FCF3CF", textColor: "#F1C40F" }, // Yellowish
    Developing: { text: "Developing", bgColor: "#D4E6F1", textColor: "#3498DB" }, // Bluish
    // Add any other statuses here
} as const; // 'as const' makes the keys literal strings

type StatusKey = keyof typeof STATUS_TAGS;

interface SubjectData {
    id: string;
    title: string;
    percentage: number; // 0 to 100
    status: StatusKey;
    color: string; // Color for the progress circle
}

const MOCK_SUBJECT_DATA: SubjectData[] = [
    { id: 'p1', title: "Psychological Assessment", percentage: 92, status: "Strong", color: "#34D399" }, // Aqua/Teal color
    { id: 'p2', title: "Development Psychology", percentage: 38, status: "Weak", color: "#F97316" }, // Orange color
    { id: 'p3', title: "Abnormal Psychology", percentage: 55, status: "Needs Improvement", color: "#EC4899" }, // Pink color
    { id: 'p4', title: "Development Psychology", percentage: 68, status: "Developing", color: "#F97316" }, // Orange color (reused)
];

// --- PROGRESS CIRCLE COMPONENT ---

interface CircularProgressProps {
    percentage: number;
    color: string;
    radius?: number;
    strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, color, radius = 24, strokeWidth = 4 }) => {
    const circumference = 2 * Math.PI * radius;
    const progress = (100 - percentage) / 100 * circumference;

    return (
        <View style={{ width: radius * 2, height: radius * 2, marginRight: 15 }}>
            <Svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
                {/* Background circle */}
                <Circle
                    stroke="#E5E7EB" // Light gray background
                    fill="none"
                    cx={radius}
                    cy={radius}
                    r={radius - strokeWidth / 2}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <Circle
                    stroke={color}
                    fill="none"
                    cx={radius}
                    cy={radius}
                    r={radius - strokeWidth / 2}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={progress}
                    strokeLinecap="round"
                    // Rotate to start at the top
                    transform={`rotate(-90, ${radius}, ${radius})`}
                />
            </Svg>
            <View style={overviewStyles.progressTextContainer}>
                <Text style={[overviewStyles.progressText, { color: Colors.text }]}>
                    {percentage}
                    {/* Only show % if it's not a round number like 55 (p3) */}
                    {percentage !== 55 ? "%" : ""} 
                </Text>
            </View>
        </View>
    );
};

// --- SUBJECT ITEM COMPONENT ---

interface SubjectItemProps {
    data: SubjectData;
}

const SubjectItem: React.FC<SubjectItemProps> = ({ data }) => {
    const statusData = STATUS_TAGS[data.status];

    return (
        // Using TouchableOpacity to suggest navigability
        <TouchableOpacity style={overviewStyles.itemContainer}>
            
            {/* 1. Circular Progress Indicator */}
            <CircularProgress percentage={data.percentage} color={data.color} />

            {/* 2. Text and Status Tag */}
            <View style={overviewStyles.textColumn}>
                <Text style={overviewStyles.subjectTitle}>{data.title}</Text>
                <View style={[overviewStyles.tag, { backgroundColor: statusData.bgColor }]}>
                    <Text style={[overviewStyles.tagText, { color: statusData.textColor }]}>
                        {statusData.text}
                    </Text>
                </View>
            </View>

            {/* 3. Arrow Icon */}
            <Feather name="chevron-right" size={24} color="#A0A0A0" />
        </TouchableOpacity>
    );
};

// --- MAIN COMPONENT ---

export const ProgressOverviewCard: React.FC = () => {
    return (
        <View style={overviewStyles.container}>
            <Text style={overviewStyles.mainTitle}>Progress Overview:</Text>

            {/* Card Body */}
            <View style={overviewStyles.card}>
                {MOCK_SUBJECT_DATA.map((subject, index) => (
                    <SubjectItem 
                        key={subject.id} 
                        data={subject} 
                    />
                ))}
            </View>
        </View>
    );
};

// --- STYLES ---

const overviewStyles = StyleSheet.create({
    container: {
        marginBottom: 30,
    },
    mainTitle: {
        fontFamily: Fonts.semiBold,
        fontSize: 18,
        color: Colors.text,
        marginBottom: 10,
        paddingLeft: 4, 
    },
    card: {
        backgroundColor: Colors.background, // Use white/light background for the list card
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#838383', // Very light border
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#d2cacaff',
    },
    textColumn: {
        flex: 1,
        marginRight: 10,
    },
    subjectTitle: {
        fontFamily: Fonts.semiBold,
        fontSize: 16,
        color: Colors.text,
    },
    tag: {
        alignSelf: 'flex-start',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginTop: 4,
    },
    tagText: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
    },
    progressTextContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        // The color is set dynamically based on Colors.text
    }
});