'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

SplashScreen.preventAutoHideAsync();

interface AppContextType { isReady: boolean; setReady: (ready: boolean) => void; }

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() { const context = useContext(AppContext); if (!context) throw new Error('useAppContext must be used within AppProvider'); return context; }

export function Providers({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => { async function prepare() { try { await Font.loadAsync({ 'Inter': require('../assets/fonts/Inter-Regular.ttf'), 'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'), 'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'), 'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf') }); await SplashScreen.hideAsync(); setIsReady(true); } catch (e) { console.error('App preparation error:', e); setIsReady(true); } } prepare(); }, []);
  if (!isReady) return null;
  return <AppContext.Provider value={{ isReady, setReady }}>{children}</AppContext.Provider>;
}