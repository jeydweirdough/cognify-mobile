import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

const Colors = {
  white: "#FFFFFF",
};

const Fonts = {
  bold: "System",
};

export const CircularProgress = ({ percentage }: { percentage: number }) => {
  const size = 70;
  const strokeWidth = 5;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progressStrokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF8D28" />
            <Stop offset="100%" stopColor="#FF8D28" />
          </LinearGradient>
        </Defs>

        <Circle
          stroke="#eee7f5ff"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <Circle
          stroke="url(#gradient)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressStrokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>

      <View style={styles.percentageTextContainer}>
        <Text style={styles.readinessPercentageText}>{percentage}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  percentageTextContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  readinessPercentageText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
});
