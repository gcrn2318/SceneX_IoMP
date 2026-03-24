import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
    FadeInDown, 
    FadeInUp, 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    Easing,
    interpolateColor,
    withSpring,
    withDelay
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// --- BACKGROUND EFFECTS ---

const ScanLine = () => {
    const translateY = useSharedValue(-200);

    React.useEffect(() => {
        translateY.value = withRepeat(
            withTiming(height + 200, { duration: 4000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[styles.scanLine, rStyle]}>
            <LinearGradient
                colors={['transparent', 'rgba(59, 130, 246, 0.4)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
            />
        </Animated.View>
    );
};

const DataStream = ({ delay, left }: { delay: number, left: string }) => {
    const translateY = useSharedValue(-150);

    React.useEffect(() => {
        translateY.value = withDelay(delay, withRepeat(
            withTiming(height + 150, { duration: 3000 + Math.random() * 2000, easing: Easing.linear }),
            -1,
            false
        ));
    }, []);

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[styles.dataStream, { left: left as any }, rStyle]}>
            <LinearGradient
                colors={['transparent', 'rgba(16, 185, 129, 0.3)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
            />
        </Animated.View>
    );
};

// --- TERMINAL COMPONENT ---

const SysLogTerminal = () => {
    const scrollY = useSharedValue(0);

    React.useEffect(() => {
        scrollY.value = withRepeat(
            withTiming(-80, { duration: 6000, easing: Easing.linear }),
            -1,
            false // Resets instantly to loop seamlessly
        );
    }, []);

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scrollY.value }]
    }));

    return (
        <Animated.View entering={FadeInUp.delay(500).duration(600).springify().damping(12)} style={styles.terminalBox}>
            <View style={styles.terminalHeader}>
                <View style={styles.termDots}>
                    <View style={styles.termDotRed} />
                    <View style={styles.termDotYel} />
                    <View style={styles.termDotGrn} />
                </View>
                <Text style={styles.termTitle}>sys.log :: operative_activity</Text>
            </View>
            <View style={styles.terminalBody}>
                <Animated.View style={rStyle}>
                    <Text style={styles.termText}>[14:22] Hardware biometrics synced successfully.</Text>
                    <Text style={styles.termText}>[13:40] Weapon Analysis: CASE-102 complete.</Text>
                    <Text style={styles.termText}>[10:15] Neural Hub uplink established.</Text>
                    <Text style={styles.termText}>[09:12] Unauthorized access attempt blocked.</Text>
                    <Text style={styles.termText}>[08:00] Ghost Operative logged in.</Text>
                    <Text style={styles.termText}>[07:55] Cloud sync completed (124ms latency).</Text>
                    <Text style={styles.termText}>[14:22] Hardware biometrics synced successfully.</Text>
                    <Text style={styles.termText}>[13:40] Weapon Analysis: CASE-102 complete.</Text>
                </Animated.View>
            </View>
            <View style={styles.terminalOverlay} pointerEvents="none">
                <LinearGradient
                    colors={['#0F172A', 'transparent', 'transparent', '#0F172A']}
                    locations={[0, 0.2, 0.8, 1]}
                    style={StyleSheet.absoluteFillObject}
                />
            </View>
        </Animated.View>
    );
};

// --- INTERACTIVE COMPONENTS ---

const AnimatedToggle = ({ isEnabled, onToggle }: { isEnabled: boolean, onToggle: () => void }) => {
    const progress = useSharedValue(isEnabled ? 1 : 0);

    React.useEffect(() => {
        progress.value = withSpring(isEnabled ? 1 : 0, { damping: 15, stiffness: 200 });
    }, [isEnabled]);

    const rStyleTrack = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(30, 41, 59, 1)', 'rgba(16, 185, 129, 0.2)']
        );
        const borderColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(255, 255, 255, 0.1)', 'rgba(16, 185, 129, 0.5)']
        );
        return { backgroundColor, borderColor };
    });

    const rStyleThumb = useAnimatedStyle(() => {
        const translateX = progress.value * 20; 
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['#94A3B8', '#10B981']
        );
        return {
            transform: [{ translateX }],
            backgroundColor,
            shadowColor: '#10B981',
            shadowOpacity: progress.value * 0.8,
            shadowRadius: 8,
            elevation: progress.value * 4,
        };
    });

    return (
        <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => {
                if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggle();
            }}
        >
            <Animated.View style={[styles.toggleTrack, rStyleTrack]}>
                <Animated.View style={[styles.toggleThumb, rStyleThumb]} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const SXProfileHeader = () => {
    // Holographic Card Gesture
    const tiltX = useSharedValue(0);
    const tiltY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            tiltX.value = withSpring(event.translationX / 10, { damping: 10, stiffness: 100 });
            tiltY.value = withSpring(-event.translationY / 10, { damping: 10, stiffness: 100 });
        })
        .onEnd(() => {
            tiltX.value = withSpring(0, { damping: 15, stiffness: 80 });
            tiltY.value = withSpring(0, { damping: 15, stiffness: 80 });
        });

    const rCardStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1000 },
            { rotateX: `${tiltY.value}deg` },
            { rotateY: `${tiltX.value}deg` }
        ]
    }));

    const rSheenStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: tiltX.value * -15 },
            { translateY: tiltY.value * 15 }
        ]
    }));

    // Tech Rings
    const rotation = useSharedValue(0);
    React.useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 15000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);
    const rSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
    const rSpinRev = useAnimatedStyle(() => ({ transform: [{ rotate: `-${rotation.value}deg` }] }));

    return (
        <Animated.View entering={FadeInDown.duration(800).springify().damping(12).mass(0.9)} style={{ zIndex: 10, marginBottom: 32 }}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.hologramCard, rCardStyle]}>
                    <LinearGradient
                        colors={['rgba(15, 23, 42, 0.7)', 'rgba(2, 4, 10, 0.95)']}
                        style={StyleSheet.absoluteFillObject}
                    />
                    
                    <Animated.View style={[styles.sheenContainer, rSheenStyle]} pointerEvents="none">
                        <LinearGradient
                            colors={['transparent', 'rgba(96, 165, 250, 0.2)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                    </Animated.View>

                    <View style={styles.cardContent}>
                        <View style={styles.avatarWrap}>
                            <Animated.View style={[styles.cyberRingOuter, rSpin]} />
                            <Animated.View style={[styles.cyberRingInner, rSpinRev]} />
                            <View style={styles.avatarImageWrap}>
                                <Image source={{ uri: 'https://i.pravatar.cc/300?img=68' }} style={styles.avatarImage} />
                            </View>
                            <View style={styles.onlineStatusBadge} />
                        </View>

                        <Text style={styles.userName}>GHOST OPERATIVE</Text>
                        
                        <View style={styles.roleBadgeContainer}>
                            <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                            <Text style={styles.roleBadgeText}>SYS_ADMIN // L5 (OMEGA)</Text>
                        </View>
                        
                        <View style={styles.agentCodeWrap}>
                            <Ionicons name="barcode-outline" size={16} color="#475569" />
                            <Text style={styles.agentCode}>ID: SXP-901-A</Text>
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
};

const SXSecurityPanel = ({ onLogout }: { onLogout: () => void }) => {
    const [biometricsEnabled, setBiometricsEnabled] = React.useState(true);
    const [cloudSyncEnabled, setCloudSyncEnabled] = React.useState(false);

    return (
        <Animated.View entering={FadeInUp.delay(300).duration(600).springify().damping(14)} style={styles.securityPanel}>
            <Text style={styles.sectionHeading}>SECURITY PREFERENCES</Text>
            
            <View style={styles.panelCard}>
                <TouchableOpacity 
                    style={styles.panelRow}
                    activeOpacity={0.7}
                    onPress={() => {
                        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                >
                    <View style={styles.panelRowLeft}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="key-outline" size={18} color="#60A5FA" />
                        </View>
                        <Text style={styles.rowLabel}>Change Security Key</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#475569" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.panelRow}>
                    <View style={styles.panelRowLeft}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="finger-print-outline" size={18} color="#60A5FA" />
                        </View>
                        <View>
                            <Text style={styles.rowLabel}>Hardware Biometrics</Text>
                            <Text style={styles.rowSubLabel}>Face ID / Touch ID uplink</Text>
                        </View>
                    </View>
                    <AnimatedToggle 
                        isEnabled={biometricsEnabled} 
                        onToggle={() => setBiometricsEnabled(!biometricsEnabled)} 
                    />
                </View>
                
                <View style={styles.divider} />

                <View style={styles.panelRow}>
                    <View style={styles.panelRowLeft}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="cloud-outline" size={18} color="#60A5FA" />
                        </View>
                        <View>
                            <Text style={styles.rowLabel}>Tactical Cloud Sync</Text>
                            <Text style={styles.rowSubLabel}>Auto-backup forensic logs</Text>
                        </View>
                    </View>
                    <AnimatedToggle 
                        isEnabled={cloudSyncEnabled} 
                        onToggle={() => setCloudSyncEnabled(!cloudSyncEnabled)} 
                    />
                </View>
            </View>

            <TouchableOpacity 
                style={styles.logoutButton}
                activeOpacity={0.8}
                onPress={onLogout}
            >
                <LinearGradient
                    colors={['rgba(239, 68, 68, 0.1)', 'rgba(153, 27, 27, 0.3)']}
                    style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutText}>TERMINATE SESSION</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- MAIN SCREEN ---
export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp<any>>();

    const handleTerminate = () => {
        Alert.alert(
            "TERMINATE SESSION",
            "Are you sure you want to disconnect? Un-synced tactical logs may be permanently lost.",
            [
                { text: "CANCEL", style: "cancel" },
                { 
                    text: "DISCONNECT", 
                    style: "destructive", 
                    onPress: () => {
                        if (Haptics.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        (navigation as any).reset({
                            index: 0,
                            routes: [{ name: 'Auth' }],
                        });
                    }
                }
            ]
        );
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <LinearGradient
                colors={['#02040A', '#060B14']}
                style={StyleSheet.absoluteFillObject}
            />
            
            {/* Ambient Background Grid & Streams */}
            <View style={styles.gridOverlay}>
                <View style={styles.gridLineHorizontal} />
                <View style={[styles.gridLineHorizontal, { top: '30%' }]} />
                <View style={[styles.gridLineHorizontal, { top: '60%' }]} />
                <View style={[styles.gridLineHorizontal, { top: '90%' }]} />
            </View>
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <DataStream delay={0} left="20%" />
                <DataStream delay={1000} left="60%" />
                <DataStream delay={2500} left="85%" />
                <ScanLine />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>OPERATIVE HUD</Text>
                </View>
                
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <SXProfileHeader />
                    <SXSecurityPanel onLogout={handleTerminate} />
                    <SysLogTerminal />

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#02040A' },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
    title: { color: '#60A5FA', fontSize: 13, fontWeight: '900', letterSpacing: 4 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

    // Ambient Effects
    gridOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.05, pointerEvents: 'none' },
    gridLineHorizontal: { position: 'absolute', width: '100%', height: 1, backgroundColor: '#3B82F6' },
    scanLine: { position: 'absolute', width: '100%', height: 100 },
    dataStream: { position: 'absolute', width: 2, height: 150 },

    // Hologram ID Card
    hologramCard: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.4)',
        backgroundColor: '#0F172A',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 15,
    },
    sheenContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    cardContent: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
    },
    avatarWrap: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    cyberRingOuter: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderTopColor: '#3B82F6',
        borderBottomColor: 'rgba(16, 185, 129, 0.5)',
    },
    cyberRingInner: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderRightColor: '#60A5FA',
        borderLeftColor: 'rgba(239, 68, 68, 0.5)',
    },
    avatarImageWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#02040A',
    },
    avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    onlineStatusBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#10B981',
        borderWidth: 3,
        borderColor: '#02040A',
        shadowColor: '#10B981',
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    userName: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
    roleBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.4)',
        marginBottom: 16,
        gap: 8,
    },
    roleBadgeText: { color: '#10B981', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
    agentCodeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(2, 4, 10, 0.5)', borderRadius: 12 },
    agentCode: { color: '#64748B', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '800', letterSpacing: 2 },

    sectionHeading: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12, marginLeft: 4 },
    
    // SXSecurityPanel
    securityPanel: { marginTop: 8 },
    panelCard: { backgroundColor: '#0F172A', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden', marginBottom: 24 },
    panelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
    panelRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)', justifyContent: 'center', alignItems: 'center' },
    rowLabel: { color: '#E2E8F0', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
    rowSubLabel: { color: '#64748B', fontSize: 10, fontWeight: '600', marginTop: 2, letterSpacing: 0.5 },
    divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginLeft: 68 },

    toggleTrack: { width: 44, height: 24, borderRadius: 12, borderWidth: 1, padding: 2, justifyContent: 'center' },
    toggleThumb: { width: 18, height: 18, borderRadius: 9 },

    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)', gap: 12, overflow: 'hidden' },
    logoutText: { color: '#EF4444', fontSize: 12, fontWeight: '900', letterSpacing: 2 },

    // Terminal
    terminalBox: {
        marginTop: 16,
        width: '100%',
        height: 140,
        backgroundColor: '#02040A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        overflow: 'hidden',
    },
    terminalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0F172A',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        zIndex: 2,
    },
    termDots: { flexDirection: 'row', gap: 6 },
    termDotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
    termDotYel: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
    termDotGrn: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
    termTitle: { color: '#64748B', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
    terminalBody: { flex: 1, padding: 12, overflow: 'hidden' },
    termText: { color: '#10B981', fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 8, opacity: 0.8 },
    terminalOverlay: { ...StyleSheet.absoluteFillObject },
});
