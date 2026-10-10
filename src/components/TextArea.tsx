'use client';

import React, { forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  numberOfLines?: number;
  minHeight?: number;
  maxHeight?: number;
  onBlur?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const TextArea = forwardRef<React.ElementRef<typeof TextInput>, TextAreaProps>(
  ({ label, placeholder, value, onChangeText, error, disabled, required, numberOfLines = 4, minHeight = 100, maxHeight = 200, onBlur, style, inputStyle, maxLength, autoCapitalize }, ref) => {
    const hasError = !!error;
    return (
      <View style={[styles.container, style]}>
        {label && (
          <Text style={[styles.label, required && styles.required]}>{label}{required && <Text style={styles.asterisk}> *</Text>}</Text>
        )}
        <View style={[styles.inputWrapper, hasError && styles.inputWrapperError, disabled && styles.inputWrapperDisabled]}>
          <TextInput
            ref={ref}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            editable={!disabled}
            multiline
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            style={[
              styles.input,
              { minHeight, maxHeight, color: disabled ? COLORS.textMuted : COLORS.textPrimary },
              inputStyle
            ]}
            placeholderTextColor={COLORS.textMuted}
            selectionColor={COLORS.primary}
            textAlignVertical="top"
          />
        </View>
        {hasError && <Text style={styles.errorText}>{error}</Text>}
        <Text style={styles.charCount}>{value.length}{maxLength && ` / ${maxLength}`}</Text>
      </View>
    );
  }
);
TextArea.displayName = 'TextArea';

const styles = StyleSheet.create({
  container: { gap: SPACING.xs },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
  required: { flexDirection: 'row', alignItems: 'center' },
  asterisk: { color: COLORS.danger },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md },
  inputWrapperError: { borderColor: COLORS.danger },
  inputWrapperDisabled: { backgroundColor: COLORS.surfaceElevated, borderColor: COLORS.borderLight },
  input: { flex: 1, fontSize: FONT_SIZES.md, padding: SPACING.md },
  errorText: { fontSize: FONT_SIZES.xs, color: COLORS.danger },
  charCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'right' },
});

export default TextArea;