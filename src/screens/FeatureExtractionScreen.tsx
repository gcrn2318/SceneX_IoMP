import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, runOnJS, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const AnimatedNode = ({ delay, top, left }: { delay: number, top: string, left: string }) => {
    const scale = useSharedValue(1);
    React.useEffect(() => {
        scale.value = withRepeat(withTiming(1.4, { duration: 1500 + delay, easing: Easing.inOut(Easing.ease) }), -1, true);
    }, []);
    const rStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
        <Animated.View style={[styles.node, { top: top as any, left: left as any }, rStyle]}>
            <View style={styles.nodeCore} />
        </Animated.View>
    );
};

export default function FeatureExtractionScreen() {
    const navigation = useNavigation<any>();

    // Image Upload State
    const [image, setImage] = React.useState<string | null>(null);

    const pickImage = async () => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            if (Haptics.notificationAsync) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    // Similarity Slider State
    const simValue = useSharedValue(14);
    const [simDisplay, setSimDisplay] = React.useState(14);

    const onPanUpdate = (e: any) => {
        let newVal = 14 + (e.translationX / (width - 48)) * 100;
        newVal = Math.max(0, Math.min(100, newVal));
        simValue.value = newVal;
        runOnJS(setSimDisplay)(Math.round(newVal));
    };

    const panGesture = Gesture.Pan()
        .onBegin(() => { if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); })
        .onUpdate(onPanUpdate)
        .onEnd(() => { if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); });

    const rTrackStyle = useAnimatedStyle(() => ({ width: `${simValue.value}%` }));
    const rThumbStyle = useAnimatedStyle(() => ({ left: `${simValue.value}%` }));

    return (
        <GestureHandlerRootView style={styles.container}>
            <LinearGradient colors={['#02040A', '#1E1B4B']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#A78BFA" />
                    </TouchableOpacity>
                    <Text style={styles.title}>NEURAL EMBEDDINGS</Text>
                    <TouchableOpacity onPress={pickImage} style={styles.backBtn}>
                        <Ionicons name="image-outline" size={24} color="#A78BFA" />
                    </TouchableOpacity>
                </View>
                <Animated.View entering={FadeInDown.duration(800)} style={styles.visualizerWrap}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.uploadedImage} blurRadius={2} />
                    ) : (
                        <View style={StyleSheet.absoluteFillObject}>
                            <TouchableOpacity onPress={pickImage} style={styles.uploadPrompt}>
                                <Ionicons name="cloud-upload-outline" size={48} color="rgba(139, 92, 246, 0.4)" />
                                <Text style={styles.uploadPromptText}>UPLOAD SCENE TO EXTRACT</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={[styles.connectionLine, { top: '32%', left: '35%', width: '30%', transform: [{ rotate: '25deg' }] }]} />
                    <View style={[styles.connectionLine, { top: '48%', left: '42%', width: '25%', transform: [{ rotate: '-35deg' }] }]} />
                    <View style={[styles.connectionLine, { top: '65%', left: '25%', width: '40%', transform: [{ rotate: '15deg' }] }]} />
                    <View style={[styles.connectionLine, { top: '56%', left: '48%', width: '20%', transform: [{ rotate: '70deg' }] }]} />

                    <AnimatedNode delay={0} top="20%" left="30%" />
                    <AnimatedNode delay={400} top="40%" left="60%" />
                    <AnimatedNode delay={200} top="60%" left="25%" />
                    <AnimatedNode delay={800} top="75%" left="70%" />
                    <AnimatedNode delay={600} top="50%" left="45%" />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.techPanel}>
                    <Text style={styles.panelHeader}>VECTOR DISTANCE</Text>

                    <View style={styles.sliderHeader}>
                        <Text style={styles.simText}>SIMILARITY: {simDisplay}%</Text>
                        <Text style={styles.threshText}>THRESHOLD: 85%</Text>
                    </View>

                    <GestureDetector gesture={panGesture}>
                        <View style={styles.sliderTrackBg}>
                            <Animated.View style={[styles.sliderFill, rTrackStyle]} />
                            <Animated.View style={[styles.sliderThumbWrap, rThumbStyle]}>
                                <View style={styles.sliderThumb}>
                                    <View style={styles.sliderCore} />
                                </View>
                            </Animated.View>
                        </View>
                    </GestureDetector>

                    <View style={styles.codeBlock}>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 180 }} nestedScrollEnabled>
                            <Text style={styles.codeText}>
                                {`{
  "matrix_id": "0x889F",
  "layer_7_activations": [
    0.031, -0.442, 0.991, 0.103,
    -0.123, 0.841, 0.001, -0.732
  ],
  "attention_heads": {
    "head_0": 0.88,
    "head_1": 0.12,
    "head_2": 0.94
  },
  "overall_anomaly_score": 0.982
}`}
                            </Text>
                        </ScrollView>
                    </View>
                </Animated.View>

            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#02040A' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    title: { flex: 1, color: '#A78BFA', fontSize: 13, fontWeight: '900', letterSpacing: 3, textAlign: 'center' },

    visualizerWrap: { flex: 1, position: 'relative', marginHorizontal: 20, marginBottom: 20, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', backgroundColor: 'rgba(15, 23, 42, 0.5)' },
    uploadedImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.6 },
    uploadPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    uploadPromptText: { color: 'rgba(139, 92, 246, 0.6)', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
    node: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(139, 92, 246, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.5)' },
    nodeCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C4B5FD', shadowColor: '#C4B5FD', shadowOpacity: 1, shadowRadius: 10 },
    connectionLine: { position: 'absolute', height: 1, backgroundColor: 'rgba(139, 92, 246, 0.3)' },

    techPanel: { padding: 24, backgroundColor: 'rgba(15, 23, 42, 0.8)', borderTopWidth: 1, borderTopColor: 'rgba(139, 92, 246, 0.3)' },
    panelHeader: { color: '#C4B5FD', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 24 },

    sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    simText: { color: '#EF4444', fontSize: 12, fontWeight: '900', letterSpacing: 1, textShadowColor: 'rgba(239,68,68,0.5)', textShadowRadius: 10 },
    threshText: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

    sliderTrackBg: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 24, justifyContent: 'center' },
    sliderFill: { position: 'absolute', left: 0, height: '100%', backgroundColor: '#EF4444', borderRadius: 2, shadowColor: '#EF4444', shadowOpacity: 1, shadowRadius: 8 },
    sliderThumbWrap: { position: 'absolute', height: 24, justifyContent: 'center', width: 24, marginLeft: -12 },
    sliderThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
    sliderCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },

    codeBlock: { backgroundColor: '#000', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' },
    codeText: { color: '#8B5CF6', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
});
