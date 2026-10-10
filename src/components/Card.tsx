'use client';

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '@/constants';

interface CardProps { children: React.ReactNode; style?: StyleProp<ViewStyle>; padding?: keyof typeof SPACING | number; elevated?: boolean; bordered?: boolean; onPress?: () => void; }

export const Card: React.FC<CardProps> = ({ children, style, padding = 'md', elevated = false, bordered = true, onPress }) => {
  const paddingValue = typeof padding === 'string' ? SPACING[padding] : padding;
  const containerStyle: ViewStyle = { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: paddingValue, borderWidth: bordered ? 1 : 0, borderColor: COLORS.border, ...(elevated && styles.elevated) };
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[containerStyle, style]} accessibilityRole="button">{children}</TouchableOpacity>;
  return <View style={[containerStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({ elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 } });
export default Card;