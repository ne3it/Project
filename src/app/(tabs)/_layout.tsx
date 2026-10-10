'use client';

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '@/constants';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.primary, tabBarInactiveTintColor: COLORS.textMuted, tabBarLabelStyle: { fontSize: FONT_SIZES.xs, fontWeight: '600' }, tabBarStyle: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, height: 72, paddingBottom: 8 }, headerShown: false }}>
      <Tabs.Screen name="(tabs)/index" options={{ title: 'Проекты', tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={26} color={color} /> }} />
      <Tabs.Screen name="(tabs)/reports" options={{ title: 'Отчеты', tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={26} color={color} /> }} />
      <Tabs.Screen name="(tabs)/settings" options={{ title: 'Настройки', tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'settings' : 'settings-outline'} size={26} color={color} /> }} />
    </Tabs>
  );
}