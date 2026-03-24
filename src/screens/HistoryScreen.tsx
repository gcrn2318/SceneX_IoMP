import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming, 
    runOnJS, 
    FadeInDown, 
    FadeOutLeft, 
    Layout,
    interpolateColor,
    interpolate
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

// --- TYPES ---
type HistoryType = 'video' | 'image' | 'audio' | 'document';

interface HistoryItem {
    id: string;
    type: HistoryType;
    prediction: string;
    description: string;
    confidence: number;
    timestamp: string;
}

// --- MOCK DATA ---
const INITIAL_HISTORY: HistoryItem[] = [
    {
        id: '1',
        type: 'video',
        prediction: 'DEEPFAKE DETECTED',
        description: 'Facial manipulation / lip-sync inconsistency',
        confidence: 98,
        timestamp: 'T-MINUS 2 HOURS',
    },
    {
        id: '2',
        type: 'image',
        prediction: 'AUTHENTIC RECORD',
        description: 'No EXIF tampering found',
        confidence: 92,
        timestamp: '14 OCT 2023 - 09:41',
    },
    {
        id: '3',
        type: 'audio',
        prediction: 'AI SYNTHESIZED',
        description: 'Vocal tract anomalies detected',
        confidence: 87,
        timestamp: '12 OCT 2023 - 18:22',
    },
    {
        id: '4',
        type: 'document',
        prediction: 'FORGED SIGNATURE',
        description: 'Vector paths mismatched',
        confidence: 94,
        timestamp: '08 OCT 2023 - 11:15',
    }
];

const FILTERS = ['ALL', 'VIDEO', 'IMAGE', 'AUDIO', 'DOCUMENT'];

const getTypeIcon = (type: HistoryType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
        case 'video': return 'videocam-outline';
        case 'image': return 'image-outline';
        case 'audio': return 'mic-outline';
        case 'document': return 'document-text-outline';
        default: return 'ellipse-outline';
    }
}

// Just implement simple min
const min = (a: number, b: number) => a < b ? a : b;

// --- COMPONENTS ---
const AnimatedFilterChip = ({ label, isActive, onPress }: { label: string, isActive: boolean, onPress: () => void }) => {
    const isAct = useSharedValue(isActive ? 1 : 0);
    
    React.useEffect(() => {
        isAct.value = withTiming(isActive ? 1 : 0, { duration: 300 });
    }, [isActive]);

    const rStyle = useAnimatedStyle(() => {
        const borderColor = interpolateColor(
            isAct.value,
            [0, 1],
            ['rgba(30, 41, 59, 0.8)', 'rgba(59, 130, 246, 0.8)']
        );
        const backgroundColor = interpolateColor(
            isAct.value,
            [0, 1],
            ['rgba(15, 23, 42, 0.6)', 'rgba(29, 78, 216, 0.25)']
        );
        const shadowOpacity = interpolate(isAct.value, [0, 1], [0, 0.6]);
        
        return {
            borderColor,
            backgroundColor,
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 10,
            shadowOpacity,
            elevation: isActive ? 4 : 0,
        };
    });

    return (
        <Pressable onPress={onPress}>
            <Animated.View style={[styles.filterChip, rStyle]}>
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {label}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

const SXHistoryCard = ({ item, index, onDelete }: { item: HistoryItem, index: number, onDelete: (id: string) => void }) => {
    const translateX = useSharedValue(0);
    const SWIPE_THRESHOLD = -70;
    
    const panGesture = Gesture.Pan()
        .activeOffsetX([-20, 20])
        .onUpdate((event) => {
            if (event.translationX < 0) {
                translateX.value = event.translationX;
            }
        })
        .onEnd(() => {
            if (translateX.value < SWIPE_THRESHOLD) {
                translateX.value = withTiming(-500, { duration: 250 }, (finished) => {
                    if (finished) {
                        runOnJS(onDelete)(item.id);
                    }
                });
            } else {
                translateX.value = withSpring(0, { damping: 15 });
            }
        });

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }]
    }));

    const rIconStyle = useAnimatedStyle(() => {
        const progress = Math.min(1, Math.max(0, translateX.value / SWIPE_THRESHOLD));
        return {
            transform: [{ scale: progress }],
            opacity: progress,
        };
    });

    const isDanger = item.prediction.includes('DEEPFAKE') || item.prediction.includes('SYNTHESIZED') || item.prediction.includes('FORGED');
    const badgeColor = isDanger ? '#EF4444' : '#10B981';

    return (
        <Animated.View 
            entering={FadeInDown.delay(min(index, 10) * 150).springify().damping(12).mass(0.9)}
            exiting={FadeOutLeft.duration(300)}
            layout={Layout.springify()}
            style={styles.timelineItem}
        >
            <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { shadowColor: badgeColor, shadowOpacity: 0.8, shadowRadius: 8, elevation: 4 }]} />
                <View style={styles.timelineLine} />
            </View>

            <View style={styles.cardWrapper}>
                <View style={styles.deleteBackground}>
                    <Animated.View style={[styles.deleteIconWrapper, rIconStyle, { shadowColor: '#EF4444', shadowOffset: {width: 0, height: 0}, shadowRadius: 10, shadowOpacity: 1, elevation: 8 }]}>
                        <Ionicons name="trash-outline" size={24} color="#EF4444" />
                    </Animated.View>
                </View>

                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.card, rStyle]}>
                        <LinearGradient
                            colors={['rgba(30,41,59,0.5)', 'rgba(15,23,42,0.8)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <View style={styles.cardHeader}>
                            <View style={styles.typeWrapper}>
                                <Ionicons name={getTypeIcon(item.type)} size={14} color="#94A3B8" />
                                <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                            </View>
                            <Text style={styles.timestamp}>{item.timestamp}</Text>
                        </View>
                        
                        <View style={styles.cardBody}>
                            <View style={[styles.thumbnailPlaceholder, { borderColor: badgeColor + '40' }]}>
                                <Ionicons name={getTypeIcon(item.type)} size={24} color={badgeColor} />
                                <View style={[styles.thumbnailGlow, { backgroundColor: badgeColor }]} />
                            </View>
                            
                            <View style={styles.cardContent}>
                                <Text style={[styles.predictionText, { color: badgeColor, textShadowColor: badgeColor + '80', textShadowRadius: 8 }]}>
                                    {item.prediction}
                                </Text>
                                <Text style={styles.descriptionText} numberOfLines={1}>
                                    {item.description}
                                </Text>
                                <View style={styles.confidenceBadge}>
                                    <Ionicons name="scan-outline" size={12} color="#60A5FA" />
                                    <Text style={styles.confidenceText}>{item.confidence}% CONFIDENT</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </GestureDetector>
            </View>
        </Animated.View>
    );
};

// --- MAIN SCREEN ---
export default function HistoryScreen() {
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [history, setHistory] = useState(INITIAL_HISTORY);

    const handleDelete = useCallback((id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    }, []);

    const filteredHistory = history.filter(item => 
        activeFilter === 'ALL' || item.type.toUpperCase() === activeFilter
    );

    return (
        <GestureHandlerRootView style={styles.container}>
            <LinearGradient
                colors={['#02040A', '#060B14']}
                style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>FORENSIC VAULT</Text>
                    <Text style={styles.subtitle}>SECURE HISTORY OF ANALYZED ASSETS</Text>
                </View>

                <View style={styles.filterContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                    >
                        {FILTERS.map(filter => (
                            <AnimatedFilterChip 
                                key={filter}
                                label={filter}
                                isActive={activeFilter === filter}
                                onPress={() => setActiveFilter(filter)}
                            />
                        ))}
                    </ScrollView>
                </View>

                <ScrollView 
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredHistory.length === 0 ? (
                        <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyState}>
                            <Ionicons name="archive-outline" size={64} color="rgba(96, 165, 250, 0.15)" />
                            <Text style={styles.emptyText}>NO RECORDS FOUND</Text>
                            <Text style={styles.emptySubtext}>ADJUST YOUR FILTERS OR ANALYZE NEW ASSETS</Text>
                        </Animated.View>
                    ) : (
                        filteredHistory.map((item, index) => (
                            <SXHistoryCard 
                                key={item.id}
                                item={item}
                                index={index}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </GestureHandlerRootView>
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
        padding: 24,
        paddingBottom: 20,
    },
    title: {
        color: '#60A5FA',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 4,
        marginBottom: 4,
    },
    subtitle: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
    },
    filterContainer: {
        marginBottom: 16,
    },
    filterScroll: {
        paddingHorizontal: 24,
        gap: 12,
        alignItems: 'center',
        paddingVertical: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    filterTextActive: {
        color: '#60A5FA',
        textShadowColor: 'rgba(96, 165, 250, 0.5)',
        textShadowRadius: 8,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        flexGrow: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 60,
    },
    emptyText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    emptySubtext: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timelineLeft: {
        width: 32,
        alignItems: 'center',
        marginRight: 12,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1E293B',
        borderWidth: 2,
        borderColor: '#02040A',
        marginTop: 24,
        zIndex: 10,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: '#1E293B',
        marginTop: -10,
        marginBottom: -30,
    },
    cardWrapper: {
        flex: 1,
        position: 'relative',
    },
    deleteBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 24,
    },
    deleteIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1E293B',
        padding: 16,
        backgroundColor: '#0F172A',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    typeText: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    timestamp: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    thumbnailPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    thumbnailGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.15,
    },
    cardContent: {
        flex: 1,
    },
    predictionText: {
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    descriptionText: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 8,
    },
    confidenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    confidenceText: {
        color: '#60A5FA',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    }
});
