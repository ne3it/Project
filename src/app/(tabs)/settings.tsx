'use client';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTaxSettings } from '@/hooks/useStorage';
import { storage } from '@/storage';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, BUTTON_HEIGHT, TAX_REGIMES, APP_NAME, APP_TAGLINE, CURRENCY_SYMBOL } from '@/constants';
import { Button, Card, Input, Select, Header } from '@/components';
import { useHaptics } from '@/hooks/useHaptics';
import { TaxSettings } from '@/types';

export default function SettingsScreen() {
  const { settings: taxSettings, loading, update: updateTaxSettings } = useTaxSettings();
  const { trigger: haptic } = useHaptics();

  const [formData, setFormData] = useState({
    regime: taxSettings?.regime || 'NPD',
    npdRate: taxSettings?.npdRate || 4,
    ipRate: taxSettings?.ipRate || 5,
    vatRate: taxSettings?.vatRate || 20,
    isVatPayer: taxSettings?.isVatPayer || false,
  });
  const [saving, setSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [exportData, setExportData] = React.useState<string | null>(null);

  useEffect(() => {
    if (taxSettings) {
      setFormData({
        regime: taxSettings.regime,
        npdRate: taxSettings.npdRate,
        ipRate: taxSettings.ipRate,
        vatRate: taxSettings.vatRate,
        isVatPayer: taxSettings.isVatPayer,
      });
    }
  }, [taxSettings]);

  const handleSaveTax = async () => {
    setSaving(true);
    try {
      await updateTaxSettings(formData);
      haptic('success');
      Alert.alert('Успешно', 'Налоговые настройки сохранены');
    } catch (e) {
      haptic('error');
      Alert.alert('Ошибка', 'Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    haptic('medium');
    try {
      const allData = await storage.getSettings();
      const projects = await storage.getProjects();
      const reports = await storage.getReports();
      const workers = await storage.getWorkers();
      const materials = await storage.getMaterials();
      const photos = await storage.getPhotos();
      const exportObj = { exportDate: new Date().toISOString(), version: '1.0', app: APP_NAME, taxSettings: allData.taxSettings, projects, reports, workers, materials, photos };
      const jsonString = JSON.stringify(exportObj, null, 2);
      setExportData(jsonString);
      Alert.alert('Экспорт готов', 'Данные подготовлены. Скопируйте их из консоли или используйте функцию partager.', [{ text: 'OK' }]);
      console.log('=== EXPORT DATA ===');
      console.log(jsonString);
      console.log('=== END EXPORT ===');
    } catch (e) {
      haptic('error');
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    }
  };

  const handleClearAll = async () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    haptic('heavy');
    try {
      await storage.clearAll();
      haptic('success');
      Alert.alert('Готово', 'Все данные удалены');
      router.back();
    } catch (e) {
      haptic('error');
      Alert.alert('Ошибка', 'Не удалось очистить данные');
    }
    setShowClearConfirm(false);
  };

  const currentRegime = TAX_REGIMES.find((t) => t.value === formData.regime);

  return (
    <View style={styles.container}>
      <Header title="Настройки" leftAction={{ icon: 'chevron-back', onPress: () => router.back() }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Налоговый режим</Text>
          <Select
            label="Режим налогообложения"
            value={formData.regime}
            onChange={v => setFormData({ ...formData, regime: v as any })}
            options={TAX_REGIMES.map((t) => ({ value: t.value, label: t.label, description: t.description }))}
          />
          <View style={styles.taxRates}>
            {formData.regime === 'NPD' && (
              <Input label="Ставка НПД (%)" placeholder="4" value={String(formData.npdRate)} onChangeText={v => setFormData({ ...formData, npdRate: parseInt(v) || 4 })} keyboardType="numeric" style={{ width: '100%' }} />
            )}
            {formData.regime === 'IP' && (
              <>
                <Input label="Ставка ИП УСН (%)" placeholder="5" value={String(formData.ipRate)} onChangeText={v => setFormData({ ...formData, ipRate: parseInt(v) || 5 })} keyboardType="numeric" style={{ width: '100%' }} />
                <View style={styles.checkboxRow}>
                  <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, isVatPayer: !prev.isVatPayer }))} style={styles.checkboxWrapper}><View style={[styles.checkbox, formData.isVatPayer && styles.checkboxChecked]} /></TouchableOpacity>
                  <Text style={styles.checkboxLabel}>Плательщик НДС (20%)</Text>
                </View>
              </>
            )}
            {formData.regime === 'OOO' && (
              <View style={styles.checkboxRow}>
                <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, isVatPayer: !prev.isVatPayer }))} style={styles.checkboxWrapper}><View style={[styles.checkbox, formData.isVatPayer && styles.checkboxChecked]} /></TouchableOpacity>
                <Text style={styles.checkboxLabel}>ОСНО (НДС 20% + налог на прибыль 20%)</Text>
              </View>
            )}
          </View>
          <Button variant="primary" onPress={handleSaveTax} loading={saving} style={{ marginTop: SPACING.md, alignSelf: 'flex-start' }}>Сохранить настройки</Button>
          <View style={styles.taxInfo}><Text style={styles.taxInfoText}>{currentRegime ? `${currentRegime.description}. ` : ''}Расчет: ${formData.regime === 'NPD' ? `${formData.npdRate}% с дохода` : formData.regime === 'IP' ? `${formData.ipRate}%${formData.isVatPayer ? ' + НДС 20%' : ''} с дохода` : 'ОСНО: 20% НДС + 20% налог на прибыль или УСН 5%/15%'}</Text></View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Данные приложения</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleExport} style={styles.actionButton}><View style={styles.actionIcon}><Ionicons name="download-outline" size={24} color={COLORS.primary} /></View><View style={styles.actionText}><Text style={styles.actionTitle}>Экспорт данных</Text><Text style={styles.actionDesc}>Сохранить все проекты, отчеты и настройки в JSON</Text></View><Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} /></TouchableOpacity>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleClearAll} style={styles.actionButton}><View style={styles.actionIcon}><Ionicons name="trash-outline" size={24} color={COLORS.danger} /></View><View style={styles.actionText}><Text style={[styles.actionTitle, { color: COLORS.danger }]}>Очистить все данные</Text><Text style={styles.actionDesc}>Удалить все проекты, отчеты, рабочих и материалы</Text></View><Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} /></TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Название</Text><Text style={styles.infoValue}>{APP_NAME}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Слоган</Text><Text style={styles.infoValue}>{APP_TAGLINE}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Версия</Text><Text style={styles.infoValue}>1.0.0</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Валюта</Text><Text style={styles.infoValue}>{CURRENCY_SYMBOL}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Режим</Text><Text style={styles.infoValue}>Офлайн (AsyncStorage)</Text></View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Поддержка</Text>
          <View style={styles.supportRow}><TouchableOpacity style={styles.supportButton}><Ionicons name="mail-outline" size={24} color={COLORS.primary} /><Text style={styles.supportButtonText}>Написать разработчику</Text></TouchableOpacity><TouchableOpacity style={styles.supportButton}><Ionicons name="star-outline" size={24} color={COLORS.warning} /><Text style={styles.supportButtonText}>Оценить приложение</Text></TouchableOpacity></View>
        </Card>
      </ScrollView>

      {showClearConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Удалить все данные?</Text>
            <Text style={styles.modalText}>Это действие нельзя отменить. Будут удалены все проекты, отчеты, рабочие, материалы, фото и настройки.</Text>
            <View style={styles.modalButtons}>
              <Button variant="outline" onPress={() => setShowClearConfirm(false)} style={{ flex: 1 }}>Отмена</Button>
              <Button variant="danger" onPress={confirmClearAll} style={{ flex: 1 }}>Удалить всё</Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.lg },
  sectionCard: { gap: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  taxRates: { gap: SPACING.md },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkboxWrapper: { padding: SPACING.xs },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxLabel: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, flex: 1 },
  taxInfo: { padding: SPACING.md, backgroundColor: COLORS.surfaceElevated, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.borderLight },
  taxInfoText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  actionRow: { marginBottom: SPACING.xs },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  actionIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  actionText: { flex: 1 },
  actionTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  actionDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  infoLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  infoValue: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'right' },
  supportRow: { flexDirection: 'row', gap: SPACING.md },
  supportButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  supportButtonText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.md },
  modal: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, width: '100%', maxWidth: 360, gap: SPACING.md },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  modalText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  modalButtons: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
});