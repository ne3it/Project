'use client';

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons as IoniconsImport } from '@expo/vector-icons';
const Ionicons = IoniconsImport as any;
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';

type IconName = string;

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: { icon: IconName; onPress: () => void; label?: string };
  rightAction?: { icon: IconName; onPress: () => void; label?: string };
  style?: ViewStyle;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ title, subtitle, leftAction, rightAction, style, showBack = false, onBack }: HeaderProps) {
  const handleBack = () => {
    if (onBack) onBack();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {(showBack || leftAction) && (
          <TouchableOpacity
            onPress={showBack ? handleBack : leftAction?.onPress}
            style={styles.actionButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={showBack ? 'Назад' : leftAction?.label}
          >
            <Ionicons name={(showBack ? 'chevron-back' : leftAction?.icon) as any} size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer} flex={1}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.actionButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={rightAction.label}
          >
            <Ionicons name={rightAction.icon as any} size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm, backgroundColor: COLORS.background },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleContainer: { flex: 1, paddingHorizontal: SPACING.md },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: 2 },
  actionButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: BORDER_RADIUS.full },
  divider: { height: 1, backgroundColor: COLORS.border, marginTop: SPACING.xs },
});

export default Header;