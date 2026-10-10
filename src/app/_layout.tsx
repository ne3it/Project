'use client';

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Providers } from '@/components/Providers';
import { COLORS } from '@/constants';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Providers>
        <Slot />
      </Providers>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: COLORS.background } });