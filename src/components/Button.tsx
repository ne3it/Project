'use client';

import React, { forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS, BUTTON_HEIGHT, BORDER_RADIUS, SPACING, FONT_SIZES } from '@/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'default' | 'sm' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; loading?: boolean;
  disabled?: boolean; leftIcon?: React.ReactNode; rightIcon?: React.ReactNode;
  children: React.ReactNode; onPress?: () => void; style?: ViewStyle;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border: string; pressedBg: string }> = {
  primary: { bg: COLORS.primary, text: COLORS.textInverse, border: COLORS.primary, pressedBg: COLORS.primaryPressed },
  secondary: { bg: COLORS.secondary, text: COLORS.textInverse, border: COLORS.secondary, pressedBg: COLORS.secondaryPressed },
  danger: { bg: COLORS.danger, text: COLORS.textInverse, border: COLORS.danger, pressedBg: COLORS.dangerPressed },
  outline: { bg: 'transparent', text: COLORS.primary, border: COLORS.primary, pressedBg: COLORS.primary + '20' },
  ghost: { bg: 'transparent', text: COLORS.textSecondary, border: 'transparent', pressedBg: COLORS.surfaceElevated },
};

const sizeStyles: Record<ButtonSize, { height: number; paddingH: number; fontSize: number; iconSize: number }> = {
  default: { height: BUTTON_HEIGHT, paddingH: SPACING.lg, fontSize: FONT_SIZES.lg, iconSize: 24 },
  sm: { height: 44, paddingH: SPACING.md, fontSize: FONT_SIZES.md, iconSize: 20 },
  lg: { height: 64, paddingH: SPACING.xl, fontSize: FONT_SIZES.xxl, iconSize: 28 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'default', fullWidth = false, loading = false, disabled, leftIcon, rightIcon, children, onPress, style }, ref) => {
    const { bg, text, border, pressedBg } = variantStyles[variant];
    const { height, paddingH, fontSize } = sizeStyles[size];
    const isDisabled = disabled || loading;
    return (
      <TouchableOpacity ref={ref as any} onPress={onPress} disabled={isDisabled} activeOpacity={0.85}
        style={[{ height, backgroundColor: isDisabled ? COLORS.primaryDisabled : bg, borderColor: border, borderWidth: variant === 'outline' ? 2 : 0, paddingHorizontal: paddingH, width: fullWidth ? '100%' : 'auto', borderRadius: BORDER_RADIUS.lg }, style]}
        accessibilityRole="button" accessibilityState={{ disabled: isDisabled }}>
        {loading ? <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.textInverse} size="small" /> : (
          <View style={styles.content} pointerEvents="none">
            {leftIcon && <View style={[styles.icon, { marginRight: SPACING.sm }]}>{leftIcon}</View>}
            <Text style={[styles.text, { color: text, fontSize, fontWeight: '700' }]}>{children}</Text>
            {rightIcon && <View style={[styles.icon, { marginLeft: SPACING.sm }]}>{rightIcon}</View>}
          </View>
        )}
      </TouchableOpacity>
    );
  }
);
Button.displayName = 'Button';

const styles = StyleSheet.create({ container: { justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }, content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, text: { textAlign: 'center' }, icon: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' } });

export default Button;