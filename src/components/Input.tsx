'use client';

import React, { forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, INPUT_HEIGHT } from '@/constants';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address' | 'decimal-pad';
  secureTextEntry?: boolean;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onBlur?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const Input = forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ label, placeholder, value, onChangeText, error, keyboardType, secureTextEntry, disabled, required, leftIcon, rightIcon, onBlur, style, inputStyle, maxLength, autoCapitalize }, ref) => {
    const hasError = !!error;
    return (
      <View style={[styles.container, style]}>
        {label && (
          <Text style={[styles.label, required && styles.required]}>{label}{required && <Text style={styles.asterisk}> *</Text>}</Text>
        )}
        <View style={[styles.inputWrapper, hasError && styles.inputWrapperError, disabled && styles.inputWrapperDisabled]}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            editable={!disabled}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            style={[styles.input, { color: disabled ? COLORS.textMuted : COLORS.textPrimary }, inputStyle]}
            placeholderTextColor={COLORS.textMuted}
            selectionColor={COLORS.primary}
          />
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
        {hasError && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);
Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: { gap: SPACING.xs },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
  required: { flexDirection: 'row', alignItems: 'center' },
  asterisk: { color: COLORS.danger },
  inputWrapper: { height: INPUT_HEIGHT, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md },
  inputWrapperError: { borderColor: COLORS.danger },
  inputWrapperDisabled: { backgroundColor: COLORS.surfaceElevated, borderColor: COLORS.borderLight },
  input: { flex: 1, fontSize: FONT_SIZES.md, paddingHorizontal: SPACING.md },
  iconLeft: { paddingLeft: SPACING.md },
  iconRight: { paddingRight: SPACING.md },
  errorText: { fontSize: FONT_SIZES.xs, color: COLORS.danger },
});

export default Input;