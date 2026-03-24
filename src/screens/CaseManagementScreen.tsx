import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCases, CaseEntry, CaseStatus } from '../store/caseStore';

const STATUS_CONFIG: Record<CaseStatus, { color: string; label: string; icon: string }> = {
    INITIAL: { color: '#F59E0B', label: 'INITIAL', icon: 'alert-circle' },
    ANALYSIS: { color: '#3B82F6', label: 'ANALYSIS', icon: 'pulse' },
    VALIDATED: { color: '#10B981', label: 'VALIDATED', icon: 'checkmark-shield' },
    ARCHIVED: { color: '#64748B', label: 'ARCHIVED', icon: 'archive' },
};

const STATUS_FLOW: CaseStatus[] = ['INITIAL', 'ANALYSIS', 'VALIDATED', 'ARCHIVED'];

function formatTimestamp(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'JUST NOW';
    if (diffMins < 60) return `${diffMins}m AGO`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h AGO`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d AGO`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

function formatFullTimestamp(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).toUpperCase();
}

const CaseLogEntry = ({
    item,
    index,
    onPress,
}: {
    item: CaseEntry;
    index: number;
    onPress: () => void;
}) => {
    const statusConf = STATUS_CONFIG[item.status];
    const isImage = item.type === 'IMAGE';

    return (
        <Animated.View entering={SlideInRight.duration(400).delay(index * 80)}>
            <TouchableOpacity
                style={styles.logEntry}
                activeOpacity={0.7}
                onPress={onPress}
            >
                {/* Timeline connector */}
                <View style={styles.timelineConnector}>
                    <View style={[styles.timelineDot, { backgroundColor: statusConf.color }]}>
                        <View style={[styles.timelineDotInner, { backgroundColor: statusConf.color }]} />
                    </View>
                    <View style={styles.timelineLine} />
                </View>

                {/* Card content */}
                <View style={styles.logCard}>
                    {/* Media thumbnail */}
                    <View style={styles.mediaThumbnailContainer}>
                        {isImage && item.mediaUri ? (
                            <Image source={{ uri: item.mediaUri }} style={styles.mediaThumbnail} />
                        ) : (
                            <View style={[styles.videoThumbnailPlaceholder]}>
                                <Ionicons
                                    name={isImage ? 'image' : 'videocam'}
                                    size={24}
                                    color={isImage ? '#60A5FA' : '#A78BFA'}
                                />
                            </View>
                        )}
                        {/* Type badge overlay */}
                        <View style={[
                            styles.typeBadge,
                            { backgroundColor: isImage ? 'rgba(59, 130, 246, 0.9)' : 'rgba(139, 92, 246, 0.9)' }
                        ]}>
                            <Text style={styles.typeBadgeText}>{item.type}</Text>
                        </View>
                    </View>

                    {/* Info section */}
                    <View style={styles.logInfo}>
                        <View style={styles.logHeaderRow}>
                            <Text style={styles.logScanId}>{item.scanId}</Text>
                            <Text style={styles.logTimestamp}>{formatTimestamp(item.timestamp)}</Text>
                        </View>

                        <Text style={styles.logTitle} numberOfLines={1}>{item.title}</Text>

                        <View style={styles.logFooter}>
                            <View style={[styles.statusPill, { backgroundColor: `${statusConf.color}15`, borderColor: `${statusConf.color}30` }]}>
                                <Ionicons name={statusConf.icon as any} size={10} color={statusConf.color} />
                                <Text style={[styles.statusPillText, { color: statusConf.color }]}>{statusConf.label}</Text>
                            </View>

                            <View style={[
                                styles.confidencePill,
                                { backgroundColor: item.confidence.includes('HIGH') ? 'rgba(16, 185, 129, 0.1)' : item.confidence.includes('LOW') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }
                            ]}>
                                <Text style={[
                                    styles.confidenceText,
                                    { color: item.confidence.includes('HIGH') ? '#10B981' : item.confidence.includes('LOW') ? '#EF4444' : '#F59E0B' }
                                ]}>{item.confidence}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Arrow */}
                    <View style={styles.logArrow}>
                        <Ionicons name="chevron-forward" size={16} color="#334155" />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const CaseDetailView = ({
    item,
    onClose,
    onUpdateStatus,
    onUpdateNotes,
    onDeleteCase,
}: {
    item: CaseEntry;
    onClose: () => void;
    onUpdateStatus: (status: CaseStatus) => void;
    onUpdateNotes: (notes: string) => void;
    onDeleteCase: () => void;
}) => {
    const [notes, setNotes] = useState(item.notes);
    const statusConf = STATUS_CONFIG[item.status];
    const isImage = item.type === 'IMAGE';

    const handleSave = () => {
        onUpdateNotes(notes);
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handleDelete = () => {
        Alert.alert(
            'PURGE CASE FILE',
            `Permanently delete case ${item.scanId}? This action cannot be undone.`,
            [
                { text: 'ABORT', style: 'cancel' },
                { text: 'PURGE', style: 'destructive', onPress: onDeleteCase },
            ]
        );
    };

    const getNextStatus = (): CaseStatus | null => {
        const idx = STATUS_FLOW.indexOf(item.status);
        if (idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1];
        return null;
    };

    const nextStatus = getNextStatus();

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>
                <Animated.View entering={FadeInUp.duration(500)}>
                    {/* Header */}
                    <View style={styles.detailHeader}>
                        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={20} color="#60A5FA" />
                            <Text style={styles.backText}>CASE LOG</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                    </View>

                    {/* Media Preview */}
                    <View style={styles.detailMediaContainer}>
                        {isImage && item.mediaUri ? (
                            <Image source={{ uri: item.mediaUri }} style={styles.detailMedia} />
                        ) : (
                            <View style={styles.detailVideoPlaceholder}>
                                <Ionicons
                                    name={isImage ? 'image' : 'videocam'}
                                    size={56}
                                    color={isImage ? 'rgba(96, 165, 250, 0.4)' : 'rgba(139, 92, 246, 0.4)'}
                                />
                                <Text style={styles.detailVideoLabel}>VIDEO EVIDENCE</Text>
                            </View>
                        )}
                        <LinearGradient
                            colors={['transparent', 'rgba(2, 4, 10, 0.8)']}
                            style={styles.detailMediaOverlay}
                        />
                        <View style={[
                            styles.detailTypeBadge,
                            { backgroundColor: isImage ? 'rgba(59, 130, 246, 0.9)' : 'rgba(139, 92, 246, 0.9)' }
                        ]}>
                            <Ionicons name={isImage ? 'image' : 'videocam'} size={12} color="#FFF" />
                            <Text style={styles.detailTypeBadgeText}>{item.type} EVIDENCE</Text>
                        </View>
                    </View>

                    {/* Scan ID & Status Row */}
                    <View style={styles.detailIdRow}>
                        <View style={styles.detailIdBlock}>
                            <Text style={styles.detailIdLabel}>SCAN IDENTIFIER</Text>
                            <Text style={styles.detailIdValue}>{item.scanId}</Text>
                        </View>
                        <View style={[styles.detailStatusBadge, { backgroundColor: `${statusConf.color}20`, borderColor: `${statusConf.color}40` }]}>
                            <Ionicons name={statusConf.icon as any} size={12} color={statusConf.color} />
                            <Text style={[styles.detailStatusText, { color: statusConf.color }]}>{statusConf.label}</Text>
                        </View>
                    </View>

                    {/* Result */}
                    <View style={styles.detailSection}>
                        <Text style={styles.detailSectionLabel}>ANALYSIS RESULT</Text>
                        <View style={styles.detailResultCard}>
                            <Text style={styles.detailResultTitle}>{item.result}</Text>
                            <View style={[
                                styles.detailConfBadge,
                                { backgroundColor: item.confidence.includes('HIGH') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }
                            ]}>
                                <Text style={[
                                    styles.detailConfText,
                                    { color: item.confidence.includes('HIGH') ? '#10B981' : '#F59E0B' }
                                ]}>{item.confidence}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Timestamp */}
                    <View style={styles.detailSection}>
                        <Text style={styles.detailSectionLabel}>ACQUISITION TIMESTAMP</Text>
                        <View style={styles.detailTimestampCard}>
                            <Ionicons name="time-outline" size={14} color="#64748B" />
                            <Text style={styles.detailTimestampText}>{formatFullTimestamp(item.timestamp)}</Text>
                        </View>
                    </View>

                    {/* Status Upgrade */}
                    {nextStatus && (
                        <View style={styles.detailSection}>
                            <Text style={styles.detailSectionLabel}>CASE PROGRESSION</Text>
                            <View style={styles.statusProgressRow}>
                                {STATUS_FLOW.map((s, i) => {
                                    const conf = STATUS_CONFIG[s];
                                    const isActive = STATUS_FLOW.indexOf(item.status) >= i;
                                    return (
                                        <React.Fragment key={s}>
                                            <View style={[
                                                styles.statusNode,
                                                { backgroundColor: isActive ? `${conf.color}30` : 'rgba(255,255,255,0.03)', borderColor: isActive ? conf.color : 'rgba(255,255,255,0.05)' }
                                            ]}>
                                                <Ionicons name={conf.icon as any} size={12} color={isActive ? conf.color : '#334155'} />
                                            </View>
                                            {i < STATUS_FLOW.length - 1 && (
                                                <View style={[styles.statusConnector, { backgroundColor: isActive ? conf.color : 'rgba(255,255,255,0.05)' }]} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </View>
                            <TouchableOpacity
                                style={styles.upgradeBtn}
                                onPress={() => {
                                    onUpdateStatus(nextStatus);
                                    if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                            >
                                <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.upgradeBtnGradient}>
                                    <Ionicons name="arrow-up-circle" size={16} color="#FFF" />
                                    <Text style={styles.upgradeBtnText}>UPGRADE TO {STATUS_CONFIG[nextStatus].label}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Notes */}
                    <View style={styles.detailSection}>
                        <Text style={styles.detailSectionLabel}>TACTICAL NOTES</Text>
                        <TextInput
                            style={styles.notesInput}
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Enter case observations..."
                            placeholderTextColor="#334155"
                            selectionColor="#3B82F6"
                        />
                        <TouchableOpacity style={styles.saveNotesBtn} onPress={handleSave}>
                            <Text style={styles.saveNotesBtnText}>SAVE NOTES</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default function CaseManagementScreen() {
    const { cases, loadCases, updateCaseStatus, updateCaseNotes, deleteCase } = useCases();
    const [selectedCase, setSelectedCase] = useState<CaseEntry | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'ALL' | CaseStatus>('ALL');

    useEffect(() => {
        loadCases();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadCases();
        setRefreshing(false);
    }, [loadCases]);

    const filteredCases = filter === 'ALL' ? cases : cases.filter(c => c.status === filter);

    if (selectedCase) {
        // Find the latest version from the store
        const latest = cases.find(c => c.id === selectedCase.id);
        if (!latest) {
            setSelectedCase(null);
            return null;
        }
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#02040A', '#060B14']} style={StyleSheet.absoluteFillObject} />
                <SafeAreaView style={styles.safeArea}>
                    <CaseDetailView
                        item={latest}
                        onClose={() => setSelectedCase(null)}
                        onUpdateStatus={(status) => updateCaseStatus(latest.id, status)}
                        onUpdateNotes={(notes) => updateCaseNotes(latest.id, notes)}
                        onDeleteCase={() => {
                            deleteCase(latest.id);
                            setSelectedCase(null);
                        }}
                    />
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#02040A', '#060B14']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.title}>CASE LOG</Text>
                        <View style={styles.caseCountBadge}>
                            <Text style={styles.caseCountText}>{cases.length}</Text>
                        </View>
                    </View>
                    <Text style={styles.headerSubtitle}>FORENSIC INTELLIGENCE RECORDS</Text>
                </View>

                {/* Filter tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                    style={styles.filterScrollView}
                >
                    {(['ALL', ...STATUS_FLOW] as const).map(s => {
                        const isActive = filter === s;
                        const conf = s === 'ALL' ? { color: '#3B82F6', label: 'ALL', icon: 'layers' } : STATUS_CONFIG[s];
                        return (
                            <TouchableOpacity
                                key={s}
                                style={[styles.filterTab, isActive && { backgroundColor: `${conf.color}20`, borderColor: `${conf.color}40` }]}
                                onPress={() => setFilter(s)}
                            >
                                <Ionicons name={conf.icon as any} size={12} color={isActive ? conf.color : '#475569'} />
                                <Text style={[styles.filterTabText, isActive && { color: conf.color }]}>{conf.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Case Log Timeline */}
                {filteredCases.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Animated.View entering={FadeIn.duration(600)} style={styles.emptyInner}>
                            <View style={styles.emptyIconWrap}>
                                <Ionicons name="file-tray-outline" size={48} color="rgba(96, 165, 250, 0.2)" />
                            </View>
                            <Text style={styles.emptyTitle}>NO CASE FILES</Text>
                            <Text style={styles.emptySubtitle}>
                                {filter === 'ALL'
                                    ? 'Run an image or video scan to generate case logs automatically.'
                                    : `No cases with status "${filter}" found.`}
                            </Text>
                        </Animated.View>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
                        }
                    >
                        {filteredCases.map((item, index) => (
                            <CaseLogEntry
                                key={item.id}
                                item={item}
                                index={index}
                                onPress={() => setSelectedCase(item)}
                            />
                        ))}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#02040A' },
    safeArea: { flex: 1 },

    // Header
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
    title: { color: '#60A5FA', fontSize: 14, fontWeight: '900', letterSpacing: 4 },
    caseCountBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    caseCountText: { color: '#60A5FA', fontSize: 10, fontWeight: '900' },
    headerSubtitle: { color: '#334155', fontSize: 9, fontWeight: '800', letterSpacing: 2 },

    // Filters
    filterScrollView: { flexGrow: 0, maxHeight: 48 },
    filterContainer: { paddingHorizontal: 20, paddingVertical: 8, gap: 8, alignItems: 'center' },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(15, 23, 42, 0.3)',
        height: 32,
    },
    filterTabText: { color: '#475569', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

    // Timeline
    scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

    logEntry: { flexDirection: 'row', marginBottom: 4 },

    timelineConnector: { width: 32, alignItems: 'center', paddingTop: 20 },
    timelineDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    timelineDotInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    timelineLine: {
        flex: 1,
        width: 1,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        marginTop: 4,
    },

    logCard: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderRadius: 16,
        padding: 12,
        marginLeft: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.08)',
        alignItems: 'center',
    },

    // Media thumbnail
    mediaThumbnailContainer: {
        width: 64,
        height: 64,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(2, 4, 10, 0.6)',
        marginRight: 12,
    },
    mediaThumbnail: {
        width: '100%',
        height: '100%',
    },
    videoThumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    typeBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 2,
        alignItems: 'center',
    },
    typeBadgeText: { color: '#FFFFFF', fontSize: 7, fontWeight: '900', letterSpacing: 1 },

    // Log info
    logInfo: { flex: 1 },
    logHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    logScanId: {
        color: '#3B82F6',
        fontSize: 10,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 0.5,
    },
    logTimestamp: { color: '#334155', fontSize: 8, fontWeight: '800' },
    logTitle: { color: '#E2E8F0', fontSize: 12, fontWeight: '700', marginBottom: 6 },

    logFooter: { flexDirection: 'row', gap: 6 },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusPillText: { fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
    confidencePill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    confidenceText: { fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },

    logArrow: { marginLeft: 8 },

    // Empty state
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyInner: { alignItems: 'center' },
    emptyIconWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.1)',
    },
    emptyTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
    emptySubtitle: { color: '#475569', fontSize: 12, textAlign: 'center', lineHeight: 20 },

    // Detail View
    detailScroll: { flex: 1 },
    detailScrollContent: { padding: 24, paddingBottom: 120 },

    detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    backText: { color: '#60A5FA', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    deleteBtn: {
        padding: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },

    detailMediaContainer: {
        width: '100%',
        height: 220,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.1)',
    },
    detailMedia: { width: '100%', height: '100%' },
    detailVideoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    detailVideoLabel: { color: '#64748B', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
    detailMediaOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    detailTypeBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    detailTypeBadgeText: { color: '#FFF', fontSize: 8, fontWeight: '900', letterSpacing: 1 },

    detailIdRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailIdBlock: {
        backgroundColor: 'rgba(2, 4, 10, 0.4)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.1)',
    },
    detailIdLabel: { color: '#64748B', fontSize: 7, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
    detailIdValue: {
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    detailStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    detailStatusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },

    detailSection: { marginBottom: 24 },
    detailSectionLabel: { color: '#475569', fontSize: 8, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },

    detailResultCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.08)',
    },
    detailResultTitle: { color: '#E2E8F0', fontSize: 14, fontWeight: '900', marginBottom: 10 },
    detailConfBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    detailConfText: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },

    detailTimestampCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.03)',
    },
    detailTimestampText: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },

    // Status upgrade
    statusProgressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    statusNode: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    statusConnector: { width: 24, height: 2, borderRadius: 1 },

    upgradeBtn: { borderRadius: 14, overflow: 'hidden' },
    upgradeBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
    },
    upgradeBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },

    // Notes
    notesInput: {
        backgroundColor: 'rgba(2, 4, 10, 0.4)',
        borderRadius: 14,
        padding: 16,
        color: '#E2E8F0',
        fontSize: 13,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    saveNotesBtn: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    saveNotesBtnText: { color: '#60A5FA', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});
