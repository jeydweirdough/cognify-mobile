import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const THEME_COLOR = '#8B5CF6';

export default function LoadingScreen() {
    // 1. Setup Animation Values
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const moveAnim = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        // 2. The Entrance Animation (Slide Up + Bounce)
        Animated.parallel([
            Animated.spring(moveAnim, {
                toValue: 0,
                friction: 6,
                tension: 80,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // 3. The "Breathing" Loop
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.05,
                        duration: 1500,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                ])
            ).start();
        });
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <Animated.View
                style={{
                    transform: [
                        { translateY: moveAnim },
                        { scale: scaleAnim }
                    ],
                    alignItems: 'center',
                }}
            >
                <Text style={styles.logoText}>COGNIFY</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 48,
        color: '#FFFFFF',
        letterSpacing: 4,
        textTransform: 'uppercase',

        // 👇 UPDATED TO POPPINS BOLD
        fontFamily: 'Poppins_700Bold',

        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
});