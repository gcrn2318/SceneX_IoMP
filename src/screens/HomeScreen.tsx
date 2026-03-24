import * as React from 'react';
import { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    Extrapolate,
    FadeInDown,
    FadeInRight,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useCases } from '../store/caseStore';

const { width } = Dimensions.get('window');

// ------------------------------------------------------------------
// SXHeaderBar Component
// ------------------------------------------------------------------
const SXHeaderBar = () => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 3000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-width, width]) }]
    }));

    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.greetingText}>WELCOME BACK</Text>
                    <Text style={styles.usernameText}>Agent Onyx</Text>
                </View>
                <TouchableOpacity activeOpacity={0.8} style={styles.avatarContainer}>
                    <LinearGradient
                        colors={['#3B82F6', '#8B5CF6']}
                        style={styles.avatarBorder}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.avatarInner}>
                            <Ionicons name="person" size={18} color="#E2E8F0" />
                        </View>
                    </LinearGradient>
                    <View style={styles.statusBlinker} />
                </TouchableOpacity>
            </View>
            <View style={styles.gradientStripContainer}>
                <LinearGradient
                    colors={['rgba(59,130,246,0.1)', 'rgba(139,92,246,0.5)', 'rgba(59,130,246,0.1)']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                <Animated.View style={[styles.shimmerEffect, shimmerStyle]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

// ------------------------------------------------------------------
// SXHeroPanel Component
// ------------------------------------------------------------------
const SXHeroPanel = ({ onQuickAnalyze }: { onQuickAnalyze: () => void }) => {
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: interpolate(pulse.value, [1, 1.5], [0.8, 0]),
    }));

    return (
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.heroContainer}>
            <LinearGradient
                colors={['rgba(15,23,42,0.8)', 'rgba(2,4,10,0.9)']}
                style={StyleSheet.absoluteFillObject}
                borderRadius={24}
            />
            <View style={styles.heroGlowBorder} />
            
            <View style={styles.heroContent}>
                <View style={styles.sysStatusRow}>
                    <View style={styles.pulseContainer}>
                        <Animated.View style={[styles.pulseRing, pulseStyle]} />
                        <View style={styles.pulseDot} />
                    </View>
                    <Text style={styles.sysStatusText}>SECURE CHANNEL ACTIVE</Text>
                </View>

                <Text style={styles.heroTitle}>SYSTEM NOMINAL</Text>
                <Text style={styles.heroSubtitle}>SceneX tactical intelligence is ready for deployment.</Text>

                <TouchableOpacity
                    style={styles.quickAnalyzeBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onQuickAnalyze();
                    }}
                >
                    <LinearGradient
                        colors={['#2563EB', '#1D4ED8']}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                    <Ionicons name="scan-outline" size={20} color="#FFF" />
                    <Text style={styles.quickAnalyzeText}>QUICK ANALYZE</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

// ------------------------------------------------------------------
// SXActionGrid Component
// ------------------------------------------------------------------
const SXGlassCard = ({ icon, label, onPress, delay }: any) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
        glowOpacity.value = withTiming(1, { duration: 150 });
        if (Haptics.selectionAsync) Haptics.selectionAsync();
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        glowOpacity.value = withTiming(0, { duration: 300 });
    };

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={styles.cardWrapper}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <Animated.View style={[styles.glassCard, animatedStyle]}>
                    <LinearGradient
                        colors={['rgba(30,41,59,0.5)', 'rgba(15,23,42,0.3)']}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <Animated.View style={[styles.cardGlow, glowStyle]}>
                        <LinearGradient
                            colors={['rgba(59,130,246,0.3)', 'transparent']}
                            style={StyleSheet.absoluteFillObject}
                        />
                    </Animated.View>
                    <View style={styles.cardIconWrapper}>
                        <Ionicons name={icon} size={28} color="#60A5FA" />
                    </View>
                    <Text style={styles.cardLabel}>{label}</Text>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

const SXActionGrid = () => {
    const navigation = useNavigation<NavigationProp<any>>();

    const actions = [
        { id: '1', label: 'ANALYZE SCENE', icon: 'scan-circle-outline', route: 'Image' },
        { id: '2', label: 'VIEW HISTORY', icon: 'time-outline', route: 'History' },
        { id: '3', label: 'EXTRACT FEATURES', icon: 'layers-outline', route: 'FeatureExtraction' },
        { id: '4', label: 'AI INTELLIGENCE', icon: 'git-network-outline', route: 'Analysis' },
    ];

    return (
        <View style={styles.gridContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>TACTICAL MODULES</Text>
            </View>
            <View style={styles.gridRow}>
                <SXGlassCard
                    icon={actions[0].icon}
                    label={actions[0].label}
                    delay={200}
                    onPress={() => navigation.navigate(actions[0].route)}
                />
                <SXGlassCard
                    icon={actions[1].icon}
                    label={actions[1].label}
                    delay={300}
                    onPress={() => navigation.navigate(actions[1].route)}
                />
            </View>
            <View style={styles.gridRow}>
                <SXGlassCard
                    icon={actions[2].icon}
                    label={actions[2].label}
                    delay={400}
                    onPress={() => navigation.navigate(actions[2].route)}
                />
                <SXGlassCard
                    icon={actions[3].icon}
                    label={actions[3].label}
                    delay={500}
                    onPress={() => navigation.navigate(actions[3].route)}
                />
            </View>
        </View>
    );
};

// ------------------------------------------------------------------
// SXRecentCasesPreview Component
// ------------------------------------------------------------------
const SXRecentCasesPreview = () => {
    const { cases } = useCases();
    const navigation = useNavigation<NavigationProp<any>>();

    // Show only the most recent 5 cases
    const recentCases = [...cases].reverse().slice(0, 5);

    const renderCaseCard = (c: any, index: number) => {
        const isHighConfidence = c.confidence.includes('HIGH');

        return (
            <Animated.View
                key={c.id}
                entering={FadeInRight.delay(600 + index * 100).duration(500)}
            >
                <TouchableOpacity
                    style={styles.recentCaseCard}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        // Using case ID to view details would be ideal, navigation logic depends on app routing
                        navigation.navigate('Cases'); 
                    }}
                >
                    <LinearGradient
                        colors={['rgba(30,41,59,0.4)', 'rgba(15,23,42,0.6)']}
                        style={StyleSheet.absoluteFillObject}
                        borderRadius={16}
                    />
                    <View style={styles.caseCardTop}>
                        <View style={styles.caseIconWrap}>
                            <Ionicons 
                                name={c.type === 'IMAGE' ? 'image' : 'videocam'} 
                                size={16} 
                                color={c.type === 'IMAGE' ? '#10B981' : '#8B5CF6'} 
                            />
                        </View>
                        <View style={[styles.confidenceBadge, { backgroundColor: isHighConfidence ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)' }]}>
                            <Text style={[styles.confidenceText, { color: isHighConfidence ? '#EF4444' : '#60A5FA' }]}>
                                {isHighConfidence ? 'HIGH CONF.' : 'VERIFIED'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.caseIdText}>{c.id}</Text>
                    <Text style={styles.caseDateText}>{new Date().toLocaleDateString()}</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.recentCasesContainer}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>RECENT CASES</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Cases')}>
                    <Text style={styles.viewAllText}>VIEW ALL</Text>
                </TouchableOpacity>
            </View>
            {recentCases.length === 0 ? (
                <View style={styles.emptyCases}>
                    <Ionicons name="folder-open-outline" size={32} color="#475569" />
                    <Text style={styles.emptyCasesText}>NO RECORDED CASES YET</Text>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.casesScrollContent}
                    decelerationRate="fast"
                    snapToInterval={width * 0.45 + 16}
                >
                    {recentCases.map((c, idx) => renderCaseCard(c, idx))}
                </ScrollView>
            )}
        </View>
    );
};

// ------------------------------------------------------------------
// Main Screen
// ------------------------------------------------------------------
export default function HomeScreen() {
    const navigation = useNavigation<NavigationProp<any>>();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#02040A', '#060B14']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    {/* Header */}
                    <SXHeaderBar />

                    {/* Hero Panel */}
                    <SXHeroPanel onQuickAnalyze={() => navigation.navigate('Image')} />

                    {/* Action Grid */}
                    <SXActionGrid />

                    {/* Recent Cases Preview */}
                    <SXRecentCasesPreview />

                    <View style={{ height: 100 }} />
                </ScrollView>
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
    scrollContent: {
        paddingTop: 8,
    },
    
    // Header Styles
    headerContainer: {
        marginBottom: 24,
        paddingTop: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    greetingText: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 4,
    },
    usernameText: {
        color: '#F8FAFC',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarBorder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        padding: 2,
    },
    avatarInner: {
        flex: 1,
        backgroundColor: '#0F172A',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBlinker: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#02040A',
    },
    gradientStripContainer: {
        height: 2,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    shimmerEffect: {
        ...StyleSheet.absoluteFillObject,
        width: '50%', // size of the white sheen
    },

    // Hero Panel Styles
    heroContainer: {
        marginHorizontal: 24,
        padding: 24,
        borderRadius: 24,
        position: 'relative',
        marginBottom: 32,
    },
    heroGlowBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(59,130,246,0.3)',
    },
    heroContent: {
        position: 'relative',
        zIndex: 1,
    },
    sysStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    pulseContainer: {
        width: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
    },
    pulseRing: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(16,185,129,0.4)',
    },
    sysStatusText: {
        color: '#10B981',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 2,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    heroSubtitle: {
        color: '#94A3B8',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 24,
    },
    quickAnalyzeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        overflow: 'hidden',
    },
    quickAnalyzeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
    },

    // Global Section Header
    sectionHeader: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },

    // Grid Styles
    gridContainer: {
        marginBottom: 32,
    },
    gridRow: {
        flexDirection: 'row',
        paddingHorizontal: 16, // using 16 so gap + padding totals to visually 24 margin roughly
        marginBottom: 16,
    },
    cardWrapper: {
        flex: 1,
        paddingHorizontal: 8,
    },
    glassCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderRadius: 20,
        padding: 20,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    cardGlow: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    cardIconWrapper: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(2,4,10,0.5)',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(59,130,246,0.2)',
        zIndex: 1,
    },
    cardLabel: {
        color: '#E2E8F0',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        textAlign: 'center',
        zIndex: 1,
    },

    // Recent Cases
    recentCasesContainer: {
        marginBottom: 24,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    viewAllText: {
        color: '#3B82F6',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    casesScrollContent: {
        paddingHorizontal: 24,
        gap: 16,
    },
    recentCaseCard: {
        width: width * 0.45,
        height: 130,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        marginRight: 16, // Use marginRight if gap isn't supported on old RN versions
    },
    caseCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    caseIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(2,4,10,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confidenceBadge: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    confidenceText: {
        fontSize: 7,
        fontWeight: '900',
        letterSpacing: 1,
    },
    caseIdText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    caseDateText: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '600',
    },
    emptyCases: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        backgroundColor: 'rgba(15,23,42,0.3)',
        marginHorizontal: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emptyCasesText: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        marginTop: 12,
    },
});
