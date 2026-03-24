import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    SharedValue,
    FadeInDown,
    FadeInRight,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = (width - CARD_WIDTH) / 2;

const CARDS = [
    {
        id: '1',
        title: 'AI FORENSIC ANALYSIS',
        description: 'Upload complex environments. Our neural nets instantly map patterns, highlight objects, and identify illicit anomalies.',
        iconName: 'scan',
        isAiRequired: true,
    },
    {
        id: '2',
        title: 'SCENE CLASSIFICATION',
        description: 'Advanced vision transformers predict the crime category in real-time. Uncover assault, vandalism or cyber-trespass footprints.',
        iconName: 'finger-print',
        isAiRequired: true,
    },
    {
        id: '3',
        title: 'EVIDENCE DETECTION',
        description: 'Autonomously flags microscopic evidence signatures, weapons, and behavioral irregularities within a fractured scene.',
        iconName: 'aperture',
        isAiRequired: true,
    },
    {
        id: '4',
        title: 'FEATURE EXTRACTION',
        description: 'Strip standard imagery into high-dimensional data points. Deep texture patterns are exposed for supreme interpretation.',
        iconName: 'layers',
        isAiRequired: false,
    },
    {
        id: '5',
        title: 'SECURE ARCHIVES',
        description: 'End-to-end encrypted ledger of every parsed entity. Instantly reopen, replay, and audit previous intelligence streams.',
        iconName: 'server',
        isAiRequired: false,
    },
];

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

const Card = ({ item, index, scrollX }: { item: any, index: number, scrollX: SharedValue<number> }) => {
    const pulseValue = useSharedValue(1);

    useEffect(() => {
        pulseValue.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const style = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * (CARD_WIDTH + 20),
            index * (CARD_WIDTH + 20),
            (index + 1) * (CARD_WIDTH + 20),
        ];

        const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);

        const rotateY = interpolate(
            scrollX.value,
            inputRange,
            [20, 0, -20],
            Extrapolation.CLAMP
        );
        const rotateX = interpolate(
            scrollX.value,
            inputRange,
            [-5, 0, -5],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [
                { scale },
                { perspective: 1200 },
                Platform.OS !== 'web' ? { rotateY: `${rotateY}deg` } : { rotateY: '0deg' },
                Platform.OS !== 'web' ? { rotateX: `${rotateX}deg` } : { rotateX: '0deg' }
            ],
        };
    });

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseValue.value }],
    }));

    return (
        <Animated.View style={[styles.cardContainer, style]}>
            <View style={styles.cardShadow}>
                <BlurView
                    intensity={60}
                    tint="dark"
                    style={styles.card}
                >
                    <View style={styles.cardInnerBorder}>

                        {/* Futuristic Grid Overlay Illusion */}
                        <View style={styles.gridOverlayContainer}>
                            <View style={styles.scanline} />
                        </View>

                        <View style={styles.iconWrapper}>
                            <Animated.View style={[styles.glowRing, glowStyle]} />
                            <LinearGradient
                                colors={['rgba(37, 99, 235, 0.2)', 'rgba(29, 78, 216, 0.05)']}
                                style={styles.iconBackground}
                            >
                                <Ionicons name={item.iconName as any} size={42} color="#60A5FA" />
                            </LinearGradient>
                        </View>

                        {item.isAiRequired && (
                            <View style={styles.aiBadge}>
                                <View style={styles.aiDot} />
                                <Text style={styles.aiBadgeText}>NEURAL CORE ACTIVE</Text>
                            </View>
                        )}

                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                </BlurView>
            </View>
        </Animated.View>
    );
};

const Dot = ({ index, scrollX }: { index: number, scrollX: SharedValue<number> }) => {
    const dotStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * (CARD_WIDTH + 20),
            index * (CARD_WIDTH + 20),
            (index + 1) * (CARD_WIDTH + 20),
        ];

        const width = interpolate(scrollX.value, inputRange, [6, 28, 6], Extrapolation.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0.2, 1, 0.2], Extrapolation.CLAMP);
        const backgroundColor = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);

        return {
            width,
            opacity,
            backgroundColor: backgroundColor === 1 ? '#60A5FA' : '#3B82F6',
            shadowColor: backgroundColor === 1 ? '#60A5FA' : 'transparent',
            shadowOpacity: backgroundColor === 1 ? 0.8 : 0,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 10,
        };
    });

    return <Animated.View style={[styles.dot, dotStyle]} />;
};

export default function OnboardingScreen({ navigation }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const flatListRef = useRef<Animated.FlatList<any>>(null);

    const completeOnboarding = async () => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        try {
            await AsyncStorage.setItem('hasSeenIntro', 'true');
            navigation.replace('Auth');
        } catch (e) {
            console.log('Error saving onboarding state:', e);
        }
    };

    const handleNext = () => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (currentIndex < CARDS.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            completeOnboarding();
        }
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        }
    });

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    return (
        <View style={styles.container}>
            {/* Cinematic Background */}
            <LinearGradient
                colors={['#02040A', '#091122', '#02040A']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.safeArea}>
                <Animated.View
                    entering={FadeInDown.duration(800).delay(100)}
                    style={styles.header}
                >
                    <View style={styles.logoContainer}>
                        <Ionicons name="shield-checkmark" size={22} color="#3B82F6" />
                        <Text style={styles.logoText}>SceneX</Text>
                    </View>
                    <TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
                        <Text style={styles.skipText}>SKIP</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInRight.duration(1000).delay(200)} style={styles.carouselWrapper}>
                    <Animated.FlatList
                        ref={flatListRef}
                        data={CARDS}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH + 20}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: SPACING }}
                        keyExtractor={(item) => item.id}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                        renderItem={({ item, index }) => <Card item={item} index={index} scrollX={scrollX} />}
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(800).delay(400)} style={styles.footer}>
                    <View style={styles.dotContainer}>
                        {CARDS.map((_, index) => (
                            <Dot key={index.toString()} index={index} scrollX={scrollX} />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.nextButtonOuter}
                        activeOpacity={0.8}
                        onPress={handleNext}
                    >
                        <LinearGradient
                            colors={currentIndex === CARDS.length - 1 ? ['#2563EB', '#1D4ED8'] : ['rgba(37, 99, 235, 0.2)', 'rgba(30, 58, 138, 0.4)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.nextButtonInner,
                                currentIndex === CARDS.length - 1 && styles.getStartedInner
                            ]}
                        >
                            {currentIndex === CARDS.length - 1 ? (
                                <Text style={styles.getStartedText}>INITIALIZE</Text>
                            ) : (
                                <Ionicons name="chevron-forward" size={24} color="#60A5FA" />
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#02040A',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 10,
        zIndex: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoText: {
        color: '#E2E8F0',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    skipText: {
        color: '#60A5FA',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    carouselWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        width: CARD_WIDTH,
        marginHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardShadow: {
        width: '100%',
        shadowColor: '#3B82F6',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 20 },
        shadowRadius: 40,
        elevation: 20,
    },
    card: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    cardInnerBorder: {
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.2)',
        borderRadius: 24,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        alignItems: 'flex-start',
    },
    gridOverlayContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.03,
        overflow: 'hidden',
        pointerEvents: 'none',
    },
    scanline: {
        width: '100%',
        height: 2,
        backgroundColor: '#FFFFFF',
        marginTop: '50%',
        shadowColor: '#FFF',
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    iconWrapper: {
        marginBottom: 32,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.3)',
        zIndex: 2,
    },
    glowRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        zIndex: 1,
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        gap: 6,
    },
    aiDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#34D399',
        shadowColor: '#34D399',
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    aiBadgeText: {
        color: '#34D399',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 16,
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    },
    description: {
        fontSize: 15,
        color: '#94A3B8',
        lineHeight: 24,
        letterSpacing: 0.2,
        fontWeight: '400',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: Platform.OS === 'android' ? 40 : 20,
        paddingTop: 10,
    },
    dotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        height: 4,
        borderRadius: 2,
    },
    nextButtonOuter: {
        padding: 4,
        borderRadius: 34,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    nextButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    getStartedInner: {
        width: 'auto',
        paddingHorizontal: 32,
        borderRadius: 28,
        height: 56,
        shadowColor: '#2563EB',
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
    },
    getStartedText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 2,
    },
});
