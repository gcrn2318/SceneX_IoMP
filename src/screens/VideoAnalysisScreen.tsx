import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeInRight,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    ZoomIn,
    withSequence
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useCases } from '../store/caseStore';

const { width } = Dimensions.get('window');

const ANALYSIS_STEPS = [
    'Processing Temporal Vector...',
    'Running Motion Detection Network...',
    'Identifying Kinetic Anomalies...',
    'Compiling Incident Report...',
];

const MOCK_EVENTS = [
    { time: '00:03', millis: 3000, label: 'Suspicious Entity Movement', icon: 'walk', color: '#F59E0B', percentage: 20 },
    { time: '00:08', millis: 8000, label: 'Unregistered Asset Detected', icon: 'warning', color: '#EF4444', percentage: 55 },
    { time: '00:12', millis: 12000, label: 'Kinetic Energy Spike', icon: 'flash', color: '#10B981', percentage: 85 },
];

export default function VideoAnalysisScreen() {
    const { addCase } = useCases();
    const videoRef = useRef<Video>(null);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [stepIdx, setStepIdx] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(1);
    const [activeMarker, setActiveMarker] = useState<number | null>(null);
    const [activeLens, setActiveLens] = useState<string>('cctv');

    const timelineProgress = useSharedValue(0);
    const waveformOpacity = useSharedValue(0.3);
    const nodePulse = useSharedValue(1);

    useEffect(() => {
        waveformOpacity.value = withRepeat(
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true
        );
        nodePulse.value = withRepeat(
            withSequence(
                withTiming(1.4, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ), -1, true
        );
    }, []);

    const pickVideo = async () => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            setSelectedVideo(result.assets[0].uri);
            setAnalysisComplete(false);
            setIsAnalyzing(false);
            setActiveMarker(null);
            timelineProgress.value = 0;
            if(videoRef.current) videoRef.current.setPositionAsync(0);
        }
    };

    const runAnalysis = () => {
        if (!selectedVideo) return;
        if (Haptics.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        setIsAnalyzing(true);
        setStepIdx(0);
        if(videoRef.current) videoRef.current.playAsync();

        timelineProgress.value = withTiming(1, { duration: 5600, easing: Easing.linear });

        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (step < ANALYSIS_STEPS.length) {
                setStepIdx(step);
            } else {
                clearInterval(interval);
                finishAnalysis();
            }
        }, 1400);
    };

    const finishAnalysis = () => {
        if (Haptics.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsAnalyzing(false);
        setAnalysisComplete(true);
        if (videoRef.current) videoRef.current.pauseAsync();

        addCase({
            id: `case-${Date.now()}`,
            scanId: `VID-${Math.floor(1000 + Math.random() * 9000)}`,
            type: 'VIDEO',
            mediaUri: selectedVideo || '',
            title: 'Temporal Pattern Match',
            result: 'Multiple Anomalies',
            confidence: 'HIGH',
            status: 'INITIAL',
            timestamp: Date.now(),
            notes: '',
        });
    };

    const jumpToTime = async (millis: number, index: number) => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setActiveMarker(index);
        if (videoRef.current) {
            await videoRef.current.setPositionAsync(millis);
            await videoRef.current.playAsync();
            setTimeout(() => { videoRef.current?.pauseAsync(); }, 2000);
        }
    };

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setCurrentTime(status.positionMillis);
            if (status.durationMillis) setVideoDuration(status.durationMillis);
        }
    };

    const waveformStyle = useAnimatedStyle(() => ({ opacity: waveformOpacity.value }));
    const progressWidthStyle = useAnimatedStyle(() => ({ width: `${timelineProgress.value * 100}%` }));
    const nodeStyle = useAnimatedStyle(() => ({ transform: [{ scale: nodePulse.value }] }));

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#02040A', '#060B14']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.headerTitleRow}>
                        <View>
                            <Text style={styles.headerLabel}>MODULE.2</Text>
                            <Text style={styles.title}>TEMPORAL FORENSICS</Text>
                        </View>
                        <View style={styles.sysStatusBadge}>
                            <View style={[styles.sysPulse, { backgroundColor: '#8B5CF6' }]} />
                            <Text style={[styles.sysText, { color: '#8B5CF6' }]}>STANDBY</Text>
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {!selectedVideo ? (
                        <View style={styles.emptyStateContainer}>
                            <Animated.View entering={FadeInDown.duration(800)}>
                                <TouchableOpacity activeOpacity={0.9} onPress={pickVideo} style={styles.uploadCard}>
                                    <LinearGradient colors={['rgba(139, 92, 246, 0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
                                    
                                    <View style={styles.uploadGlow}>
                                        <Ionicons name="film-outline" size={48} color="#8B5CF6" />
                                    </View>
                                    
                                    <Text style={styles.uploadTitle}>SECURE VIDEO INGEST</Text>
                                    <Text style={styles.uploadSub}>Tap to load surveillance footage log</Text>

                                    <Animated.View style={[styles.waveformRow, waveformStyle]}>
                                        {Array.from({length: 24}).map((_, i) => (
                                            <View key={i} style={[styles.waveBar, { height: 8 + Math.random() * 24 }]} />
                                        ))}
                                    </Animated.View>
                                </TouchableOpacity>
                            </Animated.View>

                            <Animated.View entering={FadeInUp.delay(300)}>
                                <Text style={styles.sectionHeading}>FRAME LENS FILTERS</Text>
                                <View style={styles.lensRow}>
                                    {['cctv', 'infrared', 'motion_track'].map((filter) => (
                                        <TouchableOpacity 
                                            key={filter} 
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setActiveLens(filter);
                                            }}
                                            style={[styles.lensBtn, activeLens === filter && styles.lensBtnActive]}
                                        >
                                            <Ionicons 
                                                name={filter === 'infrared' ? 'thermometer-outline' : filter === 'motion_track' ? 'body' : 'videocam'} 
                                                size={14} 
                                                color={activeLens === filter ? '#E2E8F0' : '#475569'} 
                                            />
                                            <Text style={[styles.lensBtnText, activeLens === filter && { color: '#E2E8F0' }]}>
                                                {filter.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </Animated.View>

                            <Animated.View entering={FadeInUp.delay(500)}>
                                <Text style={styles.sectionHeading}>SERVER UPLINK NODES</Text>
                                <View style={styles.nodesContainer}>
                                    {[1, 2, 3].map((node) => (
                                        <View key={node} style={styles.nodeCard}>
                                            <Animated.View style={[styles.nodeIndicator, node === 1 ? nodeStyle : {}]} />
                                            <View>
                                                <Text style={styles.nodeTitle}>NODE 0{node}</Text>
                                                <Text style={styles.nodeSub}>{node === 1 ? 'Awaiting Data..' : 'Idling safely'}</Text>
                                            </View>
                                            <Ionicons name="server-outline" size={16} color="#475569" style={{ marginLeft: 'auto' }}/>
                                        </View>
                                    ))}
                                </View>
                            </Animated.View>
                        </View>
                    ) : (
                        <Animated.View entering={FadeIn.duration(800)}>
                            <TouchableOpacity 
                                activeOpacity={1} 
                                style={styles.playerFrame}
                                onPress={() => {
                                    if(analysisComplete) {
                                        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        videoRef.current?.getStatusAsync().then(status => {
                                            if (status.isLoaded) {
                                                status.isPlaying ? videoRef.current?.pauseAsync() : videoRef.current?.playAsync();
                                            }
                                        });
                                    }
                                }}
                            >
                                <Video
                                    ref={videoRef}
                                    source={{ uri: selectedVideo }}
                                    style={styles.mainMedia}
                                    resizeMode={ResizeMode.COVER}
                                    useNativeControls={false}
                                    isLooping={true}
                                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                />
                                
                                {/* Overlay simulated filter based on ActiveLens */}
                                {activeLens === 'infrared' && (
                                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(239, 68, 68, 0.2)', mixBlendMode: 'color' }]} />
                                )}
                                
                                {isAnalyzing && (
                                    <>
                                        <View style={styles.dimmer} />
                                        <View style={styles.analysisOverlay}>
                                            <View style={styles.cyberBadgeDark}>
                                                <Ionicons name="recording-outline" size={16} color="#A855F7" />
                                                <Text style={styles.cyberBadgeTextDark}>TEMPORAL EXTRACTOR ACTIVE</Text>
                                            </View>
                                            <Text style={styles.analysisStatus}>{ANALYSIS_STEPS[stepIdx]}</Text>
                                        </View>
                                        <View style={styles.progressTrack}>
                                            <Animated.View style={[styles.progressFill, progressWidthStyle]} />
                                            <View style={styles.progressGlow} />
                                        </View>
                                    </>
                                )}

                                {analysisComplete && (
                                    <View style={styles.timelineInteractiveTrack}>
                                        <View style={[styles.timelineInteractiveFill, { width: `${(currentTime / videoDuration) * 100}%` }]} />
                                        {MOCK_EVENTS.map((ev, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                style={[styles.timelineInteractiveMarker, { left: `${ev.percentage}%`, borderColor: activeMarker === i ? '#FFF' : ev.color }]}
                                                onPress={(e) => { e.stopPropagation(); jumpToTime(ev.millis, i); }}
                                            />
                                        ))}
                                    </View>
                                )}

                                {!isAnalyzing && <View style={styles.frameLabel}><Text style={styles.frameLabelText}>{activeLens.toUpperCase()}-FEED</Text></View>}
                            </TouchableOpacity>

                            {!isAnalyzing && !analysisComplete && (
                                <Animated.View entering={FadeInUp.delay(200)} style={styles.controlsRow}>
                                    <TouchableOpacity style={styles.iconBtn} onPress={pickVideo}>
                                        <Ionicons name="refresh" size={20} color="#64748B" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.executeBtn} onPress={runAnalysis}>
                                        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={StyleSheet.absoluteFillObject} />
                                        <Ionicons name="play-forward" size={16} color="#FFF" />
                                        <Text style={styles.executeBtnText}>EXECUTE SCRUBBER</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}

                             {analysisComplete && (
                                <Animated.View entering={FadeInUp} style={{ paddingHorizontal: 8, marginBottom: 20 }}>
                                    <Text style={styles.hintText}><Ionicons name="information-circle-outline" /> Tap timeline or cards to seek footage</Text>
                                </Animated.View>
                            )}
                        </Animated.View>
                    )}

                    {analysisComplete && (
                        <Animated.View entering={FadeInUp.delay(300)} style={styles.resultsDeck}>
                            <Text style={styles.sectionHeading}>ANOMALY TIMELINE</Text>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.keyframeScroll}>
                                {MOCK_EVENTS.map((event, i) => (
                                    <Animated.View key={i} entering={FadeInRight.delay(400 + (i * 150))}>
                                        <TouchableOpacity activeOpacity={0.8} onPress={() => jumpToTime(event.millis, i)}>
                                            {/* @ts-ignore */}
                                            <BlurView intensity={20} tint="dark" style={[styles.keyframeCard, activeMarker === i && { borderWidth: 2, borderColor: event.color }]}>
                                                <View style={styles.keyframeMockImg}>
                                                    {selectedVideo && <Video source={{uri: selectedVideo}} style={{width: '100%', height: '100%', opacity: activeMarker === i ? 1 : 0.6}} shouldPlay={false} positionMillis={event.millis} />}
                                                    <View style={[styles.timeBadge, { backgroundColor: `${event.color}15`, borderColor: `${event.color}40` }]}>
                                                        <Text style={[styles.timeBadgeText, { color: event.color }]}>{event.time}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.keyframeInfo}>
                                                    <Ionicons name={event.icon as any} size={14} color={event.color} />
                                                    <Text style={styles.eventLabel} numberOfLines={1}>{event.label}</Text>
                                                </View>
                                            </BlurView>
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </ScrollView>

                            <Text style={[styles.sectionHeading, { marginTop: 12 }]}>INCIDENT PROBABILITY</Text>

                            <Animated.View entering={ZoomIn.delay(800)}>
                                <View style={styles.graphContainer}>
                                    <View style={styles.graphMock}>
                                        <View style={[styles.graphBar, { height: '20%', backgroundColor: '#64748B' }]} />
                                        <View style={[styles.graphBar, { height: '40%', backgroundColor: '#64748B' }]} />
                                        <View style={[styles.graphBar, { height: '85%', backgroundColor: '#EF4444', shadowColor: '#EF4444', shadowOpacity: 0.8, shadowRadius: 10 }]} />
                                        <View style={[styles.graphBar, { height: '30%', backgroundColor: '#64748B' }]} />
                                        <View style={[styles.graphBar, { height: '95%', backgroundColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 0.8, shadowRadius: 10 }]} />
                                        <View style={[styles.graphBar, { height: '10%', backgroundColor: '#64748B' }]} />
                                    </View>
                                </View>
                            </Animated.View>
                            
                            <TouchableOpacity 
                                style={styles.resetBtn}
                                onPress={() => {
                                    if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedVideo(null);
                                    setAnalysisComplete(false);
                                    setActiveMarker(null);
                                }}
                            >
                                <Ionicons name="trash-outline" size={16} color="#64748B" />
                                <Text style={styles.resetBtnText}>DISCARD LOGS</Text>
                            </TouchableOpacity>

                        </Animated.View>
                    )}
                    
                    <View style={{ height: 120 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#02040A' },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 24, paddingVertical: 20 },
    headerTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerLabel: { color: '#8B5CF6', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
    sysStatusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(139, 92, 246, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)' },
    sysPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8B5CF6', marginRight: 6 },
    sysText: { color: '#8B5CF6', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
    
    scrollContent: { paddingHorizontal: 24 },
    emptyStateContainer: { gap: 24 },
    sectionHeading: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },

    uploadCard: {
        width: '100%',
        height: 240,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    uploadGlow: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(139, 92, 246, 0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' },
    uploadTitle: { color: '#E2E8F0', fontSize: 13, fontWeight: '900', letterSpacing: 3, marginBottom: 6 },
    uploadSub: { color: '#64748B', fontSize: 10, fontWeight: '600' },
    waveformRow: { flexDirection: 'row', alignItems: 'center', gap: 4, position: 'absolute', bottom: 16 },
    waveBar: { width: 3, backgroundColor: '#8B5CF6', borderRadius: 2 },

    lensRow: { flexDirection: 'row', gap: 8 },
    lensBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', gap: 6 },
    lensBtnActive: { backgroundColor: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.4)' },
    lensBtnText: { color: '#64748B', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

    nodesContainer: { gap: 8 },
    nodeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#000', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    nodeIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B5CF6', marginRight: 12 },
    nodeTitle: { color: '#94A3B8', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
    nodeSub: { color: '#475569', fontSize: 9, fontStyle: 'italic' },

    playerFrame: { width: '100%', height: 280, borderRadius: 24, backgroundColor: '#000', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16, position: 'relative' },
    mainMedia: { width: '100%', height: '100%' },
    frameLabel: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(15, 23, 42, 0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    frameLabelText: { color: '#94A3B8', fontSize: 8, fontWeight: '900', letterSpacing: 1 },

    controlsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    iconBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    executeBtn: { flex: 1, height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, overflow: 'hidden' },
    executeBtnText: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    hintText: { color: '#64748B', fontSize: 10, fontStyle: 'italic', letterSpacing: 0.5 },

    dimmer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 4, 10, 0.7)' },
    analysisOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    cyberBadgeDark: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(139, 92, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)', marginBottom: 16, gap: 8 },
    cyberBadgeTextDark: { color: '#A855F7', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    analysisStatus: { color: '#F8FAFC', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
    
    progressTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.05)' },
    progressFill: { height: '100%', backgroundColor: '#8B5CF6' },
    progressGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(139, 92, 246, 0.5)', height: 20, bottom: 0, shadowColor: '#8B5CF6', shadowOpacity: 1, shadowRadius: 10 },
    timelineInteractiveTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'visible' },
    timelineInteractiveFill: { height: '100%', backgroundColor: '#8B5CF6' },
    timelineInteractiveMarker: { position: 'absolute', top: -6, width: 14, height: 22, borderRadius: 4, borderWidth: 2, backgroundColor: '#0F172A' },

    resultsDeck: { width: '100%' },
    keyframeScroll: { paddingRight: 24, paddingBottom: 12 },
    keyframeCard: { width: 220, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginRight: 16, backgroundColor: 'rgba(15, 23, 42, 0.6)' },
    keyframeMockImg: { width: '100%', height: 120, backgroundColor: '#000', position: 'relative' },
    timeBadge: { position: 'absolute', top: 10, left: 10, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    timeBadgeText: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
    keyframeInfo: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
    eventLabel: { flex: 1, color: '#F8FAFC', fontSize: 11, fontWeight: '800' },
    
    graphContainer: { width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 24 },
    graphMock: { height: 120, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    graphBar: { width: 35, borderRadius: 8 },

    resetBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 16, marginTop: 24, borderRadius: 16, backgroundColor: 'rgba(15, 23, 42, 0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
    resetBtnText: { color: '#64748B', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
});
