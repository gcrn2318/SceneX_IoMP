import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SXConfidenceMeter = ({ percentage, color }: { percentage: number, color: string }) => {
    const fillWidth = useSharedValue(0);
    React.useEffect(() => {
        fillWidth.value = withDelay(400, withTiming(percentage, { duration: 2500, easing: Easing.out(Easing.exp) }));
    }, [percentage]);

    const rStyle = useAnimatedStyle(() => ({ width: `${fillWidth.value}%` }));
    
    return (
        <View style={styles.meterContainer}>
            <View style={styles.meterTextWrap}>
                <Text style={[styles.meterTextValue, { color }]}>{percentage}%</Text>
                <Text style={styles.meterTextLabel}>CONFIDENCE</Text>
            </View>
            <View style={styles.meterTrack}>
                <Animated.View style={[styles.meterFill, { backgroundColor: color, shadowColor: color, shadowOpacity: 1, shadowRadius: 10 }, rStyle]} />
            </View>
        </View>
    );
};

const SXActionRow = () => (
    <View style={styles.actionRow}>
        {['save-outline', 'share-social-outline', 'refresh-outline', 'trash-outline'].map((icon, i) => (
            <TouchableOpacity key={i} activeOpacity={0.7} style={styles.actionBtn}>
                <Ionicons name={icon as any} size={20} color={icon === 'trash-outline' ? '#EF4444' : '#60A5FA'} />
            </TouchableOpacity>
        ))}
    </View>
);

export default function ResultsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const imageUri = route.params?.imageUri || null;
    
    const [isAccOpen, setIsAccOpen] = React.useState(false);
    const themeColor = '#EF4444'; // Red glow for High risk
    
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#02040A', '#060B14']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#94A3B8" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleWrap}>
                        <Text style={styles.headerLabel}>ANALYSIS LOG: SCENEX_AI</Text>
                        <Text style={[styles.title, { color: themeColor, textShadowColor: themeColor, textShadowRadius: 10 }]}>VIOLATION DETECTED</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(600)} style={styles.meterSection}>
                        <SXConfidenceMeter percentage={98} color={themeColor} />
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.infoCard}>
                        {imageUri ? <Image source={{ uri: imageUri }} style={styles.thumbImage} /> : <View style={[styles.thumbImage, { backgroundColor: 'rgba(59,130,246,0.1)' }]} />}
                        <View style={styles.infoCardBody}>
                            <Text style={styles.infoTitle}>SYNTHETIC MEDIA</Text>
                            <Text style={styles.infoSub}>Facial replacement artifacts localized.</Text>
                            <View style={styles.riskBarWrap}>
                                <LinearGradient colors={['transparent', themeColor]} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.riskBar} />
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(400).duration(600)} style={[styles.accordion, isAccOpen && { paddingBottom: 16 }]}>
                        <TouchableOpacity style={styles.accHeader} onPress={() => {
                            if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setIsAccOpen(!isAccOpen);
                        }}>
                            <Ionicons name="terminal-outline" size={16} color="#60A5FA" />
                            <Text style={styles.accTitle}>TECHNICAL METADATA</Text>
                            <Ionicons name={isAccOpen ? "chevron-up" : "chevron-down"} size={16} color="#475569" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                        
                        {isAccOpen && (
                            <Animated.View entering={FadeInUp.duration(300)} style={styles.accBody}>
                                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                    <Text style={styles.accCode}>
                                        {`> INIT_EXTRACTION...
[ 0.041, -0.991, 0.442, 1.203 ]
> DETECTING_ANOMALY: TRUE
> V_SCORE: 8.9412
> HASH: 0x992B...F1A
> SOURCE_GEO: UNKNOWN
[ 0.111, -0.001, 1.442, 0.203 ]`}
                                    </Text>
                                </ScrollView>
                            </Animated.View>
                        )}
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(600)}>
                        <SXActionRow />
                    </Animated.View>
                </ScrollView>

                {/* SX Feature Prompt */}
                <Animated.View entering={FadeInUp.delay(1000).springify().damping(15)} style={styles.featurePrompt}>
                    {/* @ts-expect-error Blur */}
                    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFillObject} />
                    <View style={styles.featurePromptInner}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.featurePromptText}>DIVE TO NEURAL LAYER?</Text>
                            <Text style={styles.featurePromptSub}>View raw embedding visualizations</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.featureBtn} 
                            onPress={() => {
                                if (Haptics.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                navigation.navigate('FeatureExtraction');
                            }}
                        >
                            <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={StyleSheet.absoluteFillObject} />
                            <Text style={styles.featureBtnText}>EXTRACT</Text>
                            <Ionicons name="arrow-forward" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#02040A' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitleWrap: { flex: 1, alignItems: 'center' },
    headerLabel: { color: '#64748B', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
    title: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
    
    content: { paddingHorizontal: 24, paddingBottom: 120 },
    
    meterSection: { alignItems: 'center', marginVertical: 32 },
    meterContainer: { width: '100%', alignItems: 'center', justifyContent: 'center' },
    meterTextWrap: { alignItems: 'center', marginBottom: 24 },
    meterTextValue: { fontSize: 64, fontWeight: '900', letterSpacing: -2 },
    meterTextLabel: { color: '#64748B', fontSize: 10, fontWeight: '900', letterSpacing: 3 },
    meterTrack: { width: '80%', height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'visible' },
    meterFill: { height: '100%', borderRadius: 3 },

    infoCard: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 16, marginBottom: 20 },
    thumbImage: { width: 72, height: 72, borderRadius: 12, marginRight: 16 },
    infoCardBody: { flex: 1, justifyContent: 'center' },
    infoTitle: { color: '#F8FAFC', fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
    infoSub: { color: '#94A3B8', fontSize: 10, fontWeight: '600' },
    riskBarWrap: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 12, overflow: 'hidden' },
    riskBar: { width: '95%', height: '100%', borderRadius: 2 },

    accordion: { backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)', marginBottom: 24 },
    accHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(2, 4, 10, 0.5)' },
    accTitle: { color: '#60A5FA', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginLeft: 12 },
    accBody: { paddingHorizontal: 16, paddingTop: 16 },
    accCode: { color: '#10B981', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', lineHeight: 18 },

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
    actionBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', justifyContent: 'center', alignItems: 'center' },

    featurePrompt: { position: 'absolute', bottom: 20, left: 20, right: 20, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.4)' },
    featurePromptInner: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
    featurePromptText: { color: '#E2E8F0', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
    featurePromptSub: { color: '#8B5CF6', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
    featureBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 8, overflow: 'hidden' },
    featureBtnText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
