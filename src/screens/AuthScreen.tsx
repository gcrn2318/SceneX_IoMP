import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

const { width, height } = Dimensions.get('window');

export default function AuthScreen({ navigation }: Props) {
    const [isLogin, setIsLogin] = useState(true);
    const [authMethod, setAuthMethod] = useState<'credentials' | 'otp'>('credentials');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [focusedField, setFocusedField] = useState<'username' | 'password' | 'phone' | 'otp' | null>(null);

    const pulseValue = useSharedValue(1);

    // Neural Nodes Data
    const nodeCount = 12;
    const nodes = React.useMemo(() =>
        Array.from({ length: nodeCount }).map(() => ({
            id: Math.random().toString(),
            top: Math.random() * 80 + '%',
            left: Math.random() * 90 + '%',
            size: Math.random() * 4 + 2,
            duration: 3000 + Math.random() * 4000,
            delay: Math.random() * 2000,
        })), []);

    useEffect(() => {
        pulseValue.value = withRepeat(
            withTiming(1.05, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const NeuralNode = ({ node }: { node: any }) => {
        const opacity = useSharedValue(0.1);

        useEffect(() => {
            opacity.value = withDelay(
                node.delay,
                withRepeat(
                    withSequence(
                        withTiming(0.6, { duration: node.duration / 2 }),
                        withTiming(0.1, { duration: node.duration / 2 })
                    ),
                    -1,
                    true
                )
            );
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
            opacity: opacity.value,
        }));

        return (
            <Animated.View
                style={[
                    styles.neuralNode,
                    {
                        top: node.top,
                        left: node.left,
                        width: node.size,
                        height: node.size,
                        borderRadius: node.size / 2
                    },
                    animatedStyle
                ]}
            />
        );
    };

    const HUDRing = ({ size, duration, delay, reverse = false }: { size: number, duration: number, delay: number, reverse?: boolean }) => {
        const rotation = useSharedValue(0);

        useEffect(() => {
            rotation.value = withDelay(delay, withRepeat(
                withTiming(reverse ? -360 : 360, { duration, easing: Easing.linear }),
                -1,
                false
            ));
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ rotate: `${rotation.value}deg` }],
        }));

        return (
            <Animated.View
                style={[
                    styles.hudRing,
                    { width: size, height: size, borderRadius: size / 2, marginLeft: -size / 2, marginTop: -size / 2 },
                    animatedStyle
                ]}
            />
        );
    };

    const DataStream = ({ left, delay }: { left: string, delay: number }) => {
        const translateY = useSharedValue(-100);

        useEffect(() => {
            translateY.value = withDelay(delay, withRepeat(
                withTiming(height + 100, { duration: 4000 + Math.random() * 2000, easing: Easing.linear }),
                -1,
                false
            ));
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateY: translateY.value }],
        }));

        return (
            <Animated.View style={[styles.dataStream, { left: left as any }, animatedStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(59, 130, 246, 0.4)', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                />
            </Animated.View>
        );
    };

    const ScanPulse = () => {
        const scale = useSharedValue(0.5);
        const opacity = useSharedValue(0.2);

        useEffect(() => {
            scale.value = withRepeat(withTiming(3, { duration: 4000, easing: Easing.out(Easing.quad) }), -1, false);
            opacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 1000 }), withTiming(0, { duration: 3000 })), -1, false);
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        }));

        return <Animated.View style={[styles.scanPulse, animatedStyle]} />;
    };

    const HexDataDrifter = ({ top, left, delay }: { top: string, left: string, delay: number }) => {
        const translateY = useSharedValue(0);
        const opacity = useSharedValue(0);
        const hex = React.useMemo(() => (Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase().padStart(6, '0'), []);

        useEffect(() => {
            opacity.value = withDelay(delay, withRepeat(withSequence(withTiming(0.4, { duration: 1000 }), withTiming(0.4, { duration: 3000 }), withTiming(0, { duration: 1000 })), -1, false));
            translateY.value = withDelay(delay, withRepeat(withTiming(-50, { duration: 5000, easing: Easing.linear }), -1, false));
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        }));

        return (
            <Animated.View style={[styles.hexDrifter, { top: top as any, left: left as any }, animatedStyle]}>
                <Text style={styles.hexText}>{hex}</Text>
            </Animated.View>
        );
    };

    const TacticalCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
        const styleMap = {
            tl: { top: 40, left: 20, borderTopWidth: 2, borderLeftWidth: 2 },
            tr: { top: 40, right: 20, borderTopWidth: 2, borderRightWidth: 2 },
            bl: { bottom: 40, left: 20, borderBottomWidth: 2, borderLeftWidth: 2 },
            br: { bottom: 40, right: 20, borderBottomWidth: 2, borderRightWidth: 2 },
        };
        return <View style={[styles.tacticalCorner, styleMap[position]]} />;
    };

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseValue.value }],
    }));

    const handleAuthenticate = () => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Add auth logic here
        navigation.replace('Main');
    };

    const handleRequestOtp = () => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setOtpSent(true);
    };

    const handleGoogleAuth = () => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Add Google auth logic here
        navigation.replace('Main');
    };

    const toggleAuthMode = () => {
        if (Haptics.selectionAsync) Haptics.selectionAsync();
        setIsLogin(!isLogin);
        setUsername('');
        setPassword('');
        setPhoneNumber('');
        setOtp('');
        setOtpSent(false);
    };

    const switchAuthMethod = (method: 'credentials' | 'otp') => {
        if (Haptics.selectionAsync) Haptics.selectionAsync();
        setAuthMethod(method);
        setOtpSent(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* Cinematic Core Background */}
                <LinearGradient
                    colors={['#02040A', '#060B14', '#02040A']}
                    locations={[0, 0.5, 1]}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Subtle Grid Overlay */}
                <View style={styles.gridOverlay}>
                    <View style={styles.scanline} />
                </View>

                {/* Animated Neural Network Background Elements */}
                <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden' }]} pointerEvents="none">
                    {/* Vertical Data Streams */}
                    <DataStream left="5%" delay={0} />
                    <DataStream left="15%" delay={1200} />
                    <DataStream left="45%" delay={800} />
                    <DataStream left="75%" delay={2500} />
                    <DataStream left="95%" delay={400} />

                    {/* HUD Rotating Rings */}
                    <View style={{ position: 'absolute', top: '35%', left: '50%' }}>
                        <HUDRing size={280} duration={20000} delay={0} />
                        <HUDRing size={320} duration={30000} delay={500} reverse />
                        <HUDRing size={400} duration={50000} delay={1000} />
                        <ScanPulse />
                    </View>

                    {/* Floating Tactical Data */}
                    <HexDataDrifter top="15%" left="10%" delay={0} />
                    <HexDataDrifter top="25%" left="80%" delay={1000} />
                    <HexDataDrifter top="60%" left="5%" delay={2000} />
                    <HexDataDrifter top="80%" left="75%" delay={3000} />

                    {/* Corner HUD Markers */}
                    <TacticalCorner position="tl" />
                    <TacticalCorner position="tr" />
                    <TacticalCorner position="bl" />
                    <TacticalCorner position="br" />

                    {nodes.map(node => (
                        <NeuralNode key={node.id} node={node} />
                    ))}

                    {/* Atmospheric Glow Orbs */}
                    <View style={[styles.glowOrb, { top: '-10%', right: '-20%', width: 500, height: 500, backgroundColor: 'rgba(59, 130, 246, 0.2)' }]} />
                    <View style={[styles.glowOrb, { bottom: '-15%', left: '-25%', width: 600, height: 600, backgroundColor: 'rgba(30, 58, 138, 0.25)' }]} />

                    {/* Bottom Perspective Grid */}
                    <View style={styles.gridFloor}>
                        <LinearGradient
                            colors={['transparent', 'rgba(59, 130, 246, 0.1)']}
                            style={StyleSheet.absoluteFillObject}
                        />
                    </View>
                </View>

                <SafeAreaView style={styles.safeArea}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <Animated.View entering={FadeInDown.duration(800).delay(100)} style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="shield-checkmark" size={28} color="#3B82F6" />
                                <Text style={styles.logoText}>SceneX</Text>
                            </View>
                            <Text style={styles.subtitle}>
                                {isLogin ? 'SECURE TERMINAL LOGIN' : 'INITIALIZE NEW AGENT'}
                            </Text>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.duration(1000).delay(300)} style={styles.formContainer}>

                            {/* Method Selector */}
                            <View style={styles.methodSelector}>
                                <TouchableOpacity
                                    style={[styles.methodTab, authMethod === 'credentials' && styles.methodTabActive]}
                                    onPress={() => switchAuthMethod('credentials')}
                                >
                                    <Text style={[styles.methodTabText, authMethod === 'credentials' && styles.methodTabTextActive]}>IDENT</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.methodTab, authMethod === 'otp' && styles.methodTabActive]}
                                    onPress={() => switchAuthMethod('otp')}
                                >
                                    <Text style={[styles.methodTabText, authMethod === 'otp' && styles.methodTabTextActive]}>MOBILE</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.cardShadow}>
                                {/* @ts-expect-error BlurView JSX type mismatch with React 19 */}
                                <BlurView intensity={70} tint="dark" style={styles.card}>
                                    <View style={styles.cardInnerBorder}>

                                        {authMethod === 'credentials' ? (
                                            <>
                                                <View style={styles.inputWrapper}>
                                                    <Text style={styles.inputLabel}>IDENTIFICATION (USERNAME / EMAIL)</Text>
                                                    <View style={[styles.inputContainer, focusedField === 'username' && styles.inputContainerFocused]}>
                                                        <Ionicons name="person-outline" size={18} color={focusedField === 'username' ? "#60A5FA" : "#475569"} style={styles.inputIcon} />
                                                        <TextInput
                                                            style={styles.input}
                                                            placeholder="Enter agent ID"
                                                            placeholderTextColor="#475569"
                                                            autoCapitalize="none"
                                                            value={username}
                                                            onChangeText={setUsername}
                                                            onFocus={() => setFocusedField('username')}
                                                            onBlur={() => setFocusedField(null)}
                                                            selectionColor="#3B82F6"
                                                        />
                                                    </View>
                                                </View>

                                                <View style={styles.inputWrapper}>
                                                    <Text style={styles.inputLabel}>SECURITY KEY (PASSWORD)</Text>
                                                    <View style={[styles.inputContainer, focusedField === 'password' && styles.inputContainerFocused]}>
                                                        <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? "#60A5FA" : "#475569"} style={styles.inputIcon} />
                                                        <TextInput
                                                            style={styles.input}
                                                            placeholder="Enter access code"
                                                            placeholderTextColor="#475569"
                                                            secureTextEntry
                                                            value={password}
                                                            onChangeText={setPassword}
                                                            onFocus={() => setFocusedField('password')}
                                                            onBlur={() => setFocusedField(null)}
                                                            selectionColor="#3B82F6"
                                                        />
                                                    </View>
                                                </View>
                                            </>
                                        ) : (
                                            <>
                                                <View style={styles.inputWrapper}>
                                                    <Text style={styles.inputLabel}>MOBILE UPLINK (PHONE)</Text>
                                                    <View style={[styles.inputContainer, focusedField === 'phone' && styles.inputContainerFocused]}>
                                                        <Ionicons name="call-outline" size={18} color={focusedField === 'phone' ? "#60A5FA" : "#475569"} style={styles.inputIcon} />
                                                        <TextInput
                                                            style={styles.input}
                                                            placeholder="+1 (555) 000-0000"
                                                            placeholderTextColor="#475569"
                                                            keyboardType="phone-pad"
                                                            value={phoneNumber}
                                                            onChangeText={setPhoneNumber}
                                                            onFocus={() => setFocusedField('phone')}
                                                            onBlur={() => setFocusedField(null)}
                                                            selectionColor="#3B82F6"
                                                        />
                                                    </View>
                                                </View>

                                                {otpSent && (
                                                    <Animated.View entering={FadeInUp.duration(400)} style={styles.inputWrapper}>
                                                        <Text style={styles.inputLabel}>VERIFICATION TOKEN (OTP)</Text>
                                                        <View style={[styles.inputContainer, focusedField === 'otp' && styles.inputContainerFocused]}>
                                                            <Ionicons name="shield-outline" size={18} color={focusedField === 'otp' ? "#60A5FA" : "#475569"} style={styles.inputIcon} />
                                                            <TextInput
                                                                style={styles.input}
                                                                placeholder="Enter code"
                                                                placeholderTextColor="#475569"
                                                                keyboardType="number-pad"
                                                                maxLength={6}
                                                                value={otp}
                                                                onChangeText={setOtp}
                                                                onFocus={() => setFocusedField('otp')}
                                                                onBlur={() => setFocusedField(null)}
                                                                selectionColor="#3B82F6"
                                                            />
                                                        </View>
                                                    </Animated.View>
                                                )}

                                                {!otpSent && (
                                                    <TouchableOpacity
                                                        style={styles.otpRequestBtn}
                                                        onPress={handleRequestOtp}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={styles.otpRequestText}>REQUEST UPLINK TOKEN</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </>
                                        )}

                                        {/* Main Auth Button */}
                                        {(authMethod === 'credentials' || otpSent) && (
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={handleAuthenticate}
                                                style={styles.primaryAuthButton}
                                            >
                                                <Animated.View style={[styles.primaryAuthGlow, glowStyle]} />
                                                <LinearGradient
                                                    colors={['#2563EB', '#1D4ED8']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                    style={styles.primaryAuthGradient}
                                                >
                                                    <Text style={styles.primaryAuthText}>
                                                        {isLogin ? 'AUTHENTICATE' : 'ESTABLISH LINK'}
                                                    </Text>
                                                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        )}

                                        {/* Divider */}
                                        <View style={styles.dividerContainer}>
                                            <View style={styles.dividerLine} />
                                            <Text style={styles.dividerText}>OR OVERRIDE WITH</Text>
                                            <View style={styles.dividerLine} />
                                        </View>

                                        {/* Google Auth Button */}
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={handleGoogleAuth}
                                        >
                                            <LinearGradient
                                                colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                                                style={styles.googleAuthButton}
                                            >
                                                <Ionicons name="logo-google" size={18} color="#FFFFFF" />
                                                <Text style={styles.googleAuthText}>CONTINUE WITH GOOGLE</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>

                                    </View>
                                </BlurView>
                            </View>

                            {/* Toggle Auth Mode */}
                            <TouchableOpacity style={styles.toggleContainer} onPress={toggleAuthMode}>
                                <Text style={styles.toggleText}>
                                    {isLogin ? "DON'T HAVE CLEARANCE? " : "ALREADY IN THE SYSTEM? "}
                                </Text>
                                <Text style={styles.toggleTextHighlight}>
                                    {isLogin ? "REQUEST ACCESS" : "LOGIN NOW"}
                                </Text>
                            </TouchableOpacity>

                        </Animated.View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#02040A',
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        pointerEvents: 'none',
    },
    scanline: {
        width: '100%',
        height: 1,
        backgroundColor: '#3B82F6',
        marginTop: height * 0.3,
        shadowColor: '#3B82F6',
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    subtitle: {
        color: '#60A5FA',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 3,
        textAlign: 'center',
    },
    neuralNode: {
        position: 'absolute',
        backgroundColor: '#3B82F6',
        shadowColor: '#3B82F6',
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 5,
    },
    glowOrb: {
        position: 'absolute',
        borderRadius: 250,
        filter: Platform.OS === 'ios' ? 'blur(100px)' : undefined,
        opacity: Platform.OS === 'android' ? 0.4 : 1,
    },
    hudRing: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.15)',
        borderStyle: 'dashed',
    },
    dataStream: {
        position: 'absolute',
        width: 1,
        height: 150,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    gridFloor: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.4,
        opacity: 0.4,
        borderTopWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    scanPulse: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.5)',
        marginLeft: -50,
        marginTop: -50,
    },
    hexDrifter: {
        position: 'absolute',
    },
    hexText: {
        color: 'rgba(59, 130, 246, 0.4)',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: '900',
    },
    tacticalCorner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        opacity: 0.6,
    },
    methodSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        width: '60%',
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.1)',
    },
    methodTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    methodTabActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.4)',
    },
    methodTabText: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    methodTabTextActive: {
        color: '#60A5FA',
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
    },
    cardShadow: {
        width: '100%',
        shadowColor: '#3B82F6',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 20 },
        shadowRadius: 40,
        elevation: 10,
    },
    card: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    cardInnerBorder: {
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.2)',
        borderRadius: 24,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        color: '#94A3B8',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 4, 10, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
    },
    inputContainerFocused: {
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        shadowColor: '#3B82F6',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 1,
    },
    otpRequestBtn: {
        width: '100%',
        height: 52,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.3)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        marginBottom: 20,
    },
    otpRequestText: {
        color: '#60A5FA',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    primaryAuthButton: {
        width: '100%',
        height: 56,
        marginBottom: 20,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    primaryAuthGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: 'rgba(37, 99, 235, 0.4)',
        zIndex: 1,
    },
    primaryAuthGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        zIndex: 2,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.3)',
    },
    primaryAuthText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
    },
    dividerText: {
        color: '#475569',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1.5,
        paddingHorizontal: 16,
    },
    googleAuthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        gap: 12,
    },
    googleAuthText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
    },
    toggleText: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    toggleTextHighlight: {
        color: '#3B82F6',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    }
});
