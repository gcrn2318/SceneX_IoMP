import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInUp, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useCases } from '../store/caseStore';

const { width, height } = Dimensions.get('window');

const SXAnalyzeButton = ({ onPress }: { onPress: () => void }) => {
    const pulse = useSharedValue(1);
    useEffect(() => {
        pulse.value = withRepeat(withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
    }, []);
    const rStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
    
    return (
        <Animated.View style={[styles.ctaWrapper, rStyle]}>
            <TouchableOpacity activeOpacity={0.8} style={styles.ctaButton} onPress={onPress}>
                <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={StyleSheet.absoluteFillObject} />
                <Ionicons name="flash" size={20} color="#FFF" />
                <Text style={styles.ctaText}>EXECUTE ANALYSIS</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function ImageAnalysisScreen() {
    const navigation = useNavigation<NavigationProp<any>>();
    const { addCase } = useCases();
    const [image, setImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const pickImage = async () => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
        });
        if (!result.canceled && result.assets[0]) {
            setImage(result.assets[0].uri);
        }
    };

    const handleAnalyze = () => {
        if (Haptics.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setIsProcessing(true);
        
        // Mock processing duration
        setTimeout(() => {
            setIsProcessing(false);
            
            const caseId = `case-${Date.now()}`;
            addCase({
                id: caseId,
                scanId: `IMG-${Math.floor(1000 + Math.random() * 9000)}`,
                type: 'IMAGE',
                mediaUri: image || '',
                title: 'High-Risk Synthetic Media',
                result: 'DEEPFAKE DETECTED',
                confidence: '98%',
                status: 'ANALYSIS',
                timestamp: Date.now(),
                notes: '',
            });

            navigation.navigate('Results', { imageUri: image, caseId });
        }, 3500);
    };

    // Upload Pulse
    const idlePulse = useSharedValue(1);
    useEffect(() => {
        idlePulse.value = withRepeat(withTiming(1.02, { duration: 2000, easing: Easing.ease }), -1, true);
    }, []);
    const rIdle = useAnimatedStyle(() => ({ transform: [{ scale: idlePulse.value }] }));

    // Processing Scan Overlay
    const scanLineY = useSharedValue(-200);
    useEffect(() => {
        if (isProcessing) {
            scanLineY.value = -200;
            scanLineY.value = withRepeat(withTiming(height + 200, { duration: 2000, easing: Easing.linear }), -1, false);
        }
    }, [isProcessing]);
    const rScanLine = useAnimatedStyle(() => ({ transform: [{ translateY: scanLineY.value }] }));

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#02040A', '#060B14']} style={StyleSheet.absoluteFillObject} />
            
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerLabel}>MODULE.1</Text>
                    <Text style={styles.title}>FORENSIC INGESTION</Text>
                    <Text style={styles.subtitle}>AWAITING VISUAL DATA TARGET</Text>
                </View>
                
                <View style={styles.content}>
                    {!image ? (
                        <Animated.View style={[styles.uploadFrameContainer, rIdle]}>
                            <TouchableOpacity activeOpacity={0.8} style={styles.uploadFrame} onPress={pickImage}>
                                <LinearGradient colors={['rgba(59, 130, 246, 0.05)', 'transparent']} style={StyleSheet.absoluteFillObject} />
                                <Ionicons name="scan-circle-outline" size={64} color="rgba(59, 130, 246, 0.4)" />
                                <Text style={styles.uploadText}>INITIALIZE UPLOAD</Text>
                                <Text style={styles.uploadSub}>Tap or drop media into secure dropzone</Text>
                                
                                {/* Holographic Borders */}
                                <View style={styles.cornerTL} /><View style={styles.cornerTR} />
                                <View style={styles.cornerBL} /><View style={styles.cornerBR} />
                            </TouchableOpacity>
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeIn.duration(600)} style={styles.previewWrap}>
                            <View style={styles.imagePreviewWrapper}>
                                <Image source={{ uri: image }} style={styles.image} />
                                <LinearGradient colors={['transparent', 'rgba(2, 4, 10, 0.8)']} style={StyleSheet.absoluteFillObject} />
                                
                                {/* Overlay text describing state */}
                                <View style={styles.previewStatus}>
                                    <View style={styles.pulseDotGreen} />
                                    <Text style={styles.previewStatusText}>TARGET LOCKED. READY FOR ANALYSIS.</Text>
                                </View>
                            </View>
                            
                            <TouchableOpacity style={styles.changeSourceBtn} onPress={pickImage}>
                                <Ionicons name="refresh" size={16} color="#94A3B8" />    
                                <Text style={styles.changeSourceText}>CHANGE TARGET DIRECTORY</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {image && !isProcessing && (
                        <Animated.View entering={FadeInUp.delay(300).springify().damping(12)} style={styles.actionRow}>
                            <SXAnalyzeButton onPress={handleAnalyze} />
                        </Animated.View>
                    )}
                </View>
            </SafeAreaView>

            {/* AI Processing Overlay */}
            {isProcessing && (
                <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)} style={styles.processingOverlay}>
                    {/* @ts-expect-error blurview rn19 */}
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
                    
                    <Animated.View style={[styles.fullScanLine, rScanLine]}>
                        <LinearGradient colors={['transparent', 'rgba(59, 130, 246, 0.5)', 'transparent']} style={StyleSheet.absoluteFillObject} />
                    </Animated.View>
                    
                    <View style={styles.processingGrid}>
                        {/* Simulation of structural grid */}
                        <View style={styles.gridLineV} />
                        <View style={styles.gridLineH} />
                    </View>
                    
                    <View style={styles.processingContent}>
                        <Ionicons name="finger-print-outline" size={80} color="#3B82F6" />
                        <Text style={styles.processingTitle}>EXTRACTING VECTORS</Text>
                        <Text style={styles.processingSub}>Cross-referencing Global Threat Interface...</Text>
                        <Text style={styles.processingData}>Hash: 0xFA32 0x11B4 0x99CF {"\n"}Weights loaded successfully.</Text>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#02040A' },
    safeArea: { flex: 1 },
    header: { padding: 24 },
    headerLabel: { color: '#3B82F6', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', letterSpacing: 1 },
    subtitle: { color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginTop: 4 },

    content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    
    uploadFrameContainer: { alignItems: 'center', justifyContent: 'center' },
    uploadFrame: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.4)',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    uploadText: { color: '#E2E8F0', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginTop: 16 },
    uploadSub: { color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 8 },

    cornerTL: { position: 'absolute', top: -1, left: -1, width: 24, height: 24, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#3B82F6' },
    cornerTR: { position: 'absolute', top: -1, right: -1, width: 24, height: 24, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#3B82F6' },
    cornerBL: { position: 'absolute', bottom: -1, left: -1, width: 24, height: 24, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#3B82F6' },
    cornerBR: { position: 'absolute', bottom: -1, right: -1, width: 24, height: 24, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#3B82F6' },

    previewWrap: { flex: 1, justifyContent: 'center' },
    imagePreviewWrapper: {
        width: '100%',
        aspectRatio: 4/5,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#3B82F6',
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
    },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    previewStatus: { position: 'absolute', bottom: 20, left: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
    pulseDotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 1, shadowRadius: 8 },
    previewStatusText: { color: '#10B981', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

    changeSourceBtn: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 16, marginTop: 16 },
    changeSourceText: { color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    
    actionRow: { marginTop: 20, marginBottom: 40 },
    ctaWrapper: { width: '100%', shadowColor: '#3B82F6', shadowOpacity: 0.8, shadowRadius: 20, elevation: 15 },
    ctaButton: { height: 64, borderRadius: 16, overflow: 'hidden', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#60A5FA' },
    ctaText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 2 },

    processingOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'center', alignItems: 'center' },
    processingGrid: { ...StyleSheet.absoluteFillObject, opacity: 0.1 },
    gridLineV: { position: 'absolute', width: 1, height: '100%', left: '50%', backgroundColor: '#3B82F6' },
    gridLineH: { position: 'absolute', height: 1, width: '100%', top: '50%', backgroundColor: '#3B82F6' },
    fullScanLine: { position: 'absolute', width: '100%', height: 150 },
    processingContent: { alignItems: 'center', backgroundColor: 'rgba(2, 4, 10, 0.6)', padding: 32, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
    processingTitle: { color: '#60A5FA', fontSize: 16, fontWeight: '900', letterSpacing: 3, marginTop: 24, marginBottom: 8 },
    processingSub: { color: '#E2E8F0', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 16 },
    processingData: { color: '#475569', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', textAlign: 'center' },
});
