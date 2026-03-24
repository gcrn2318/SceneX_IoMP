import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CaseType = 'IMAGE' | 'VIDEO';
export type CaseStatus = 'INITIAL' | 'ANALYSIS' | 'VALIDATED' | 'ARCHIVED';

export interface CaseEntry {
    id: string;
    scanId: string;
    type: CaseType;
    mediaUri: string;
    title: string;
    result: string;
    confidence: string;
    status: CaseStatus;
    timestamp: number;
    notes: string;
}

interface CaseContextType {
    cases: CaseEntry[];
    addCase: (entry: CaseEntry) => void;
    updateCaseStatus: (id: string, status: CaseStatus) => void;
    updateCaseNotes: (id: string, notes: string) => void;
    deleteCase: (id: string) => void;
    loadCases: () => Promise<void>;
}

const STORAGE_KEY = 'scenex_cases';

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: ReactNode }) {
    const [cases, setCases] = useState<CaseEntry[]>([]);

    const persistCases = useCallback(async (updatedCases: CaseEntry[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCases));
        } catch (e) {
            console.error('Failed to persist cases:', e);
        }
    }, []);

    const loadCases = useCallback(async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as CaseEntry[];
                setCases(parsed.sort((a, b) => b.timestamp - a.timestamp));
            }
        } catch (e) {
            console.error('Failed to load cases:', e);
        }
    }, []);

    const addCase = useCallback((entry: CaseEntry) => {
        setCases(prev => {
            const updated = [entry, ...prev];
            persistCases(updated);
            return updated;
        });
    }, [persistCases]);

    const updateCaseStatus = useCallback((id: string, status: CaseStatus) => {
        setCases(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, status } : c);
            persistCases(updated);
            return updated;
        });
    }, [persistCases]);

    const updateCaseNotes = useCallback((id: string, notes: string) => {
        setCases(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, notes } : c);
            persistCases(updated);
            return updated;
        });
    }, [persistCases]);

    const deleteCase = useCallback((id: string) => {
        setCases(prev => {
            const updated = prev.filter(c => c.id !== id);
            persistCases(updated);
            return updated;
        });
    }, [persistCases]);

    return (
        <CaseContext.Provider value={{ cases, addCase, updateCaseStatus, updateCaseNotes, deleteCase, loadCases }}>
            {children}
        </CaseContext.Provider>
    );
}

export function useCases() {
    const ctx = useContext(CaseContext);
    if (!ctx) throw new Error('useCases must be used within CaseProvider');
    return ctx;
}
