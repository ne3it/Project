'use client';

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, FlatList, Keyboard, Animated, TextInput } from 'react-native';
import { Ionicons as IoniconsImport } from '@expo/vector-icons';
const Ionicons = IoniconsImport as any;
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, INPUT_HEIGHT, ANIMATION_DURATION } from '@/constants';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onBlur?: () => void;
  style?: ViewStyle;
  searchable?: boolean;
}

export const Select = forwardRef<React.ElementRef<typeof View>, SelectProps>(
  ({ label, placeholder, value, onChange, options, error, disabled, required, onBlur, style, searchable = false }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const [animatedHeight] = React.useState(new Animated.Value(0));
    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = searchable
      ? options.filter(opt => opt.label.toLowerCase().includes(searchText.toLowerCase()))
      : options;

    const toggleDropdown = () => {
      if (disabled) return;
      Keyboard.dismiss();
      setIsOpen(!isOpen);
      Animated.timing(animatedHeight, {
        toValue: isOpen ? 0 : Math.min(filteredOptions.length, 5) * INPUT_HEIGHT,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start();
    };

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start();
      onBlur?.();
    };

    const hasError = !!error;

    return (
      <View style={[styles.container, style]}>
        {label && (
          <Text style={[styles.label, required && styles.required]}>{label}{required && <Text style={styles.asterisk}> *</Text>}</Text>
        )}
        <TouchableOpacity onPress={toggleDropdown} disabled={disabled} style={[
          styles.trigger,
          hasError && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]} onBlur={onBlur}>
          <View style={styles.triggerContent}>
            <Text style={[
              styles.triggerText,
              value ? { color: COLORS.textPrimary } : { color: COLORS.textMuted }
            ]}>
              {value ? selectedOption?.label : placeholder}
            </Text>
            <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={24} color={COLORS.textMuted} />
          </View>
        </TouchableOpacity>
        <Animated.View style={[styles.dropdown, { height: animatedHeight, opacity: animatedHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }]}>
          <View style={styles.dropdownContent}>
            {searchable && (
              <View style={styles.searchWrapper}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                  placeholder="Поиск..."
                  value={searchText}
                  onChangeText={setSearchText}
                  style={styles.searchInput}
                  placeholderTextColor={COLORS.textMuted}
                  selectionColor={COLORS.primary}
                />
              </View>
            )}
            <FlatList
              data={filteredOptions}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  style={[
                    styles.option,
                    value === item.value && styles.optionSelected
                  ]}
                >
                  {item.icon && <View style={styles.optionIcon}>{item.icon}</View>}
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionLabel,
                      value === item.value && styles.optionLabelSelected
                    ]}>{item.label}</Text>
                    {item.description && (
                      <Text style={styles.optionDescription}>{item.description}</Text>
                    )}
                  </View>
                  {value === item.value && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              )}
              maxToRender={5}
              contentContainerStyle={styles.dropdownListContent}
            />
          </View>
        </Animated.View>
        {hasError && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);
Select.displayName = 'Select';

const styles = StyleSheet.create({
  container: { gap: SPACING.xs },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
  required: { flexDirection: 'row', alignItems: 'center' },
  asterisk: { color: COLORS.danger },
  trigger: { height: INPUT_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md },
  triggerError: { borderColor: COLORS.danger },
  triggerDisabled: { backgroundColor: COLORS.surfaceElevated, borderColor: COLORS.borderLight },
  triggerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  triggerText: { fontSize: FONT_SIZES.md },
  dropdown: { overflow: 'hidden', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, marginTop: -1, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  dropdownContent: { flex: 1 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, gap: SPACING.sm },
  searchIcon: { paddingLeft: SPACING.sm },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  dropdownListContent: { paddingVertical: SPACING.xs },
  option: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  optionSelected: { backgroundColor: COLORS.primary + '15' },
  optionIcon: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  optionTextContainer: { flex: 1 },
  optionLabel: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  optionLabelSelected: { fontWeight: '600', color: COLORS.primary },
  optionDescription: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  errorText: { fontSize: FONT_SIZES.xs, color: COLORS.danger },
});

export default Select;