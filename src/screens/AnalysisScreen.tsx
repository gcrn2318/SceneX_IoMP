import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    Image,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
    FadeIn,
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function AnalysisScreen({ navigation }: any) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    const scannerY = useSharedValue(-height * 0.2);
    const scannerOpacity = useSharedValue(0);

    const startAnalysis = () => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsProcessing(true);
        scannerOpacity.value = withTiming(1, { duration: 500 });
        scannerY.value = withRepeat(
            withSequence(
                withTiming(height * 0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-height * 0.1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        let p = 0;
        const interval = setInterval(() => {
            p += 1;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                completeAnalysis();
            }
        }, 50);
    };

    const completeAnalysis = () => {
        setIsProcessing(false);
        setAnalysisComplete(true);
        scannerOpacity.value = withTiming(0, { duration: 500 });
        if (Haptics.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const scannerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scannerY.value }],
        opacity: scannerOpacity.value
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#02040A', '#060B14']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>NEURAL ANALYZER</Text>
                    <View style={{ width: 40 }} />
                </View>

                {!analysisComplete ? (
                    <View style={styles.content}>
                        <View style={styles.uploadArea}>
                            <View style={styles.uploadDashed}>
                                <Ionicons name="cloud-upload-outline" size={48} color="rgba(96, 165, 250, 0.3)" />
                                <Text style={styles.uploadPlaceholder}>DROP EVIDENCE FOR INGESTION</Text>
                                <Text style={styles.uploadSubtext}>IMAGE, VIDEO, OR RAW BINARY</Text>
                            </View>

                            {isProcessing && (
                                <Animated.View style={[styles.scannerLine, scannerStyle]}>
                                    <LinearGradient
                                        colors={['transparent', 'rgba(59, 130, 246, 0.8)', 'transparent']}
                                        style={StyleSheet.absoluteFillObject}
                                    />
                                    <View style={styles.scannerGlow} />
                                </Animated.View>
                            )}
                        </View>

                        {isProcessing ? (
                            <View style={styles.processingHub}>
                                <Text style={styles.statusText}>PHASE {progress < 30 ? 'I: DECRYPTING' : progress < 70 ? 'II: EXTRACTING' : 'III: CLASSIFYING'}</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                                </View>
                                <Text style={styles.progressValue}>{progress}%</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.startBtn}
                                activeOpacity={0.8}
                                onPress={startAnalysis}
                            >
                                <LinearGradient
                                    colors={['#2563EB', '#1D4ED8']}
                                    style={styles.startBtnGradient}
                                >
                                    <Text style={styles.startBtnText}>INITIALIZE SCAN</Text>
                                    <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <Animated.ScrollView entering={FadeInDown} style={styles.resultsScroll}>
                        <View style={styles.resultCard}>
                            <View style={styles.matchBadge}>
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                <Text style={styles.matchText}>98.4% CONFIDENCE MATCH</Text>
                            </View>
                            <Text style={styles.resultTitle}>OBJECT DETECTION: CLASSIFIED</Text>

                            <View style={styles.dataGrid}>
                                <View style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>IDENTIFIER</Text>
                                    <Text style={styles.dataValue}>SCX-7742-ALPHA</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>ORIGIN</Text>
                                    <Text style={styles.dataValue}>ENCRYPTED UPLINK</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>THREAT LEVEL</Text>
                                    <Text style={[styles.dataValue, { color: '#EF4444' }]}>LOW</Text>
                                </View>
                            </View>

                            <View style={styles.metadataBox}>
                                <Text style={styles.metadataTitle}>EXTRACTED METADATA</Text>
                                <Text style={styles.metadataContent}>
                                    {`{\n  "timestamp": "2024-03-24T18:42:01Z",\n  "coordinates": "34.0522° N, 118.2437° W",\n  "device_id": "TAC-UNIT-04",\n  "firmware": "v9.4.1-STABLE"\n}`}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.doneBtn}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.doneBtnText}>CLOSE INVESTIGATION</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.ScrollView>
                )}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#60A5FA',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 4,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    uploadArea: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 32,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.1)',
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 40,
    },
    uploadDashed: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    uploadPlaceholder: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    uploadSubtext: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '700',
    },
    scannerLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        zIndex: 10,
    },
    scannerGlow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#60A5FA',
        shadowColor: '#3B82F6',
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    startBtn: {
        width: '100%',
        height: 60,
        borderRadius: 16,
        overflow: 'hidden',
    },
    startBtnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    startBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    processingHub: {
        alignItems: 'center',
    },
    statusText: {
        color: '#60A5FA',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 16,
    },
    progressBarBg: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 2,
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 2,
    },
    progressValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
    },
    resultsScroll: {
        flex: 1,
        padding: 24,
    },
    resultCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 32,
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.1)',
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
        gap: 8,
        marginBottom: 20,
    },
    matchText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: '900',
    },
    resultTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 24,
    },
    dataGrid: {
        gap: 16,
        marginBottom: 32,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        paddingBottom: 12,
    },
    dataLabel: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    dataValue: {
        color: '#E2E8F0',
        fontSize: 12,
        fontWeight: '700',
    },
    metadataBox: {
        backgroundColor: 'rgba(2, 4, 10, 0.4)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
    },
    metadataTitle: {
        color: '#3B82F6',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    metadataContent: {
        color: '#94A3B8',
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        lineHeight: 18,
    },
    doneBtn: {
        width: '100%',
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneBtnText: {
        color: '#60A5FA',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
});
