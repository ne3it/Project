'use client';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Keyboard, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useProjects } from '@/hooks/useStorage';
import { useTaxSettings } from '@/hooks/useStorage';
import { formatDate, getTodayISO, generateId, validatePhone } from '@/utils/helpers';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, BUTTON_HEIGHT, PROJECT_STATUSES, TAX_REGIMES, WORKER_ROLES } from '@/constants';
import { Button, Card, Input, TextArea, Select, Header } from '@/components';
import { useHaptics } from '@/hooks/useHaptics';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { projects, loading: projectsLoading, create, update, load } = useProjects();
  const { settings: taxSettings, loading: taxLoading } = useTaxSettings();
  const { trigger: haptic } = useHaptics();

  interface FormData {
  name: string;
  clientName: string;
  clientPhone: string;
  address: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  paidAmount: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  taxRegime: 'NPD' | 'IP' | 'OOO';
  npdRate: number;
  ipRate: number;
  vatRate: number;
  isVatPayer: boolean;
}

  const [formData, setFormData] = useState<FormData>({
    name: '',
    clientName: '',
    clientPhone: '',
    address: '',
    description: '',
    startDate: getTodayISO(),
    endDate: '',
    budget: '',
    paidAmount: '',
    status: 'planning',
    taxRegime: taxSettings?.regime || 'NPD',
    npdRate: taxSettings?.npdRate || 4,
    ipRate: taxSettings?.ipRate || 5,
    vatRate: taxSettings?.vatRate || 20,
    isVatPayer: taxSettings?.isVatPayer || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      const project = projects.find(p => p.id === id);
      if (project) {
        setFormData({
          name: project.name,
          clientName: project.clientName,
          clientPhone: project.clientPhone,
          address: project.address,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate || '',
          budget: String(project.budget),
          paidAmount: String(project.paidAmount),
          status: project.status,
          taxRegime: project.taxSettings.regime,
          npdRate: project.taxSettings.npdRate,
          ipRate: project.taxSettings.ipRate,
          vatRate: project.taxSettings.vatRate,
          isVatPayer: project.taxSettings.isVatPayer,
        });
      }
    }
  }, [id, projects, isNew]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Введите название проекта';
    if (!formData.clientName.trim()) newErrors.clientName = 'Введите имя заказчика';
    if (formData.clientPhone && !validatePhone(formData.clientPhone)) newErrors.clientPhone = 'Неверный формат телефона (пример: +375 29 123-45-67)';
    if (!formData.budget || parseFloat(formData.budget) <= 0) newErrors.budget = 'Введите корректный бюджет';
    if (!formData.startDate) newErrors.startDate = 'Выберите дату начала';
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'Дата окончания не может быть раньше даты начала';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { haptic('error'); return; }
    setSaving(true);
    try {
      const projectData = {
        name: formData.name.trim(),
        clientName: formData.clientName.trim(),
        clientPhone: formData.clientPhone.trim(),
        address: formData.address.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        budget: parseFloat(formData.budget),
        paidAmount: parseFloat(formData.paidAmount) || 0,
        status: formData.status,
        taxSettings: {
          regime: formData.taxRegime,
          npdRate: formData.npdRate,
          ipRate: formData.ipRate,
          vatRate: formData.vatRate,
          isVatPayer: formData.isVatPayer,
        },
      };
      if (isNew) {
        await create(projectData);
      } else {
        await update(id!, projectData);
      }
      haptic('success');
      router.back();
    } catch (e) {
      haptic('error');
      Alert.alert('Ошибка', 'Не удалось сохранить проект');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    haptic('warning');
    Alert.alert('Удалить проект?', 'Это действие нельзя отменить. Будут удалены все отчеты, рабочие и материалы.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await load(); router.back(); } },
    ]);
  };

  if (projectsLoading || taxLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Загрузка...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Header
        title={isNew ? 'Новый проект' : 'Редактирование'}
        leftAction={{ icon: 'chevron-back', onPress: () => router.back() }}
        rightAction={!isNew ? { icon: 'trash-outline', onPress: handleDelete, label: 'Удалить' } : undefined}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Основная информация</Text>
          <Input label="Название проекта" placeholder="Напр. Строительство коттеджа" value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} error={errors.name} required autoCapitalize="words" />
          <Input label="Заказчик" placeholder="Иванов Иван Иванович" value={formData.clientName} onChangeText={v => setFormData({ ...formData, clientName: v })} error={errors.clientName} required autoCapitalize="words" />
          <Input label="Телефон заказчика" placeholder="+375 29 123-45-67" value={formData.clientPhone} onChangeText={v => setFormData({ ...formData, clientPhone: v })} error={errors.clientPhone} keyboardType="phone-pad" />
          <Input label="Адрес объекта" placeholder="г. Минск, ул. Примерная, 123" value={formData.address} onChangeText={v => setFormData({ ...formData, address: v })} autoCapitalize="words" />
          <TextArea label="Описание" placeholder="Дополнительные детали проекта..." value={formData.description} onChangeText={v => setFormData({ ...formData, description: v })} minHeight={80} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Сроки и статус</Text>
          <View style={styles.dateRow}>
            <Input label="Дата начала" placeholder="ДД.ММ.ГГГГ" value={formData.startDate} onChangeText={v => setFormData({ ...formData, startDate: v })} error={errors.startDate} required keyboardType="numeric" maxLength={10} />
            <Input label="Дата окончания (план)" placeholder="ДД.ММ.ГГГГ" value={formData.endDate} onChangeText={v => setFormData({ ...formData, endDate: v })} error={errors.endDate} keyboardType="numeric" maxLength={10} />
          </View>
          <Select
            label="Статус"
            value={formData.status}
            onChange={v => setFormData({ ...formData, status: v as any })}
            options={PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Финансы</Text>
          <View style={styles.financeRow}>
            <Input label="Бюджет (BYN)" placeholder="100000" value={formData.budget} onChangeText={v => setFormData({ ...formData, budget: v })} error={errors.budget} required keyboardType="numeric" />
            <Input label="Оплачено (BYN)" placeholder="0" value={formData.paidAmount} onChangeText={v => setFormData({ ...formData, paidAmount: v })} keyboardType="numeric" />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Налоговый режим</Text>
          <Select
            label="Режим налогообложения"
            value={formData.taxRegime}
            onChange={v => setFormData({ ...formData, taxRegime: v as any })}
            options={TAX_REGIMES.map((t) => ({ value: t.value, label: t.label, description: t.description }))}
          />
          <View style={styles.taxRates}>
            {formData.taxRegime === 'NPD' && (
              <Input label="Ставка НПД (%)" placeholder="4" value={String(formData.npdRate)} onChangeText={v => setFormData({ ...formData, npdRate: parseInt(v) || 4 })} keyboardType="numeric" style={{ width: '100%' }} />
            )}
            {formData.taxRegime === 'IP' && (
              <>
                <Input label="Ставка ИП УСН (%)" placeholder="5" value={String(formData.ipRate)} onChangeText={v => setFormData({ ...formData, ipRate: parseInt(v) || 5 })} keyboardType="numeric" style={{ width: '100%' }} />
                <View style={styles.checkboxRow}>
                  <View style={[styles.checkbox, formData.isVatPayer && styles.checkboxChecked]} onTouchStart={() => setFormData({ ...formData, isVatPayer: !formData.isVatPayer })} />
                  <Text style={styles.checkboxLabel}>Плательщик НДС (20%)</Text>
                </View>
              </>
            )}
            {formData.taxRegime === 'OOO' && (
              <View style={styles.checkboxRow}>
                <View style={[styles.checkbox, formData.isVatPayer && styles.checkboxChecked]} onTouchStart={() => setFormData({ ...formData, isVatPayer: !formData.isVatPayer })} />
                <Text style={styles.checkboxLabel}>ОСНО (НДС 20% + налог на прибыль 20%)</Text>
              </View>
            )}
          </View>
        </Card>

        <View style={styles.buttonGroup}>
          <Button variant="outline" onPress={() => router.back()} style={{ flex: 1 }}>Отмена</Button>
          <Button variant="primary" onPress={handleSave} loading={saving} style={{ flex: 1 }}>{isNew ? 'Создать' : 'Сохранить'}</Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl + BUTTON_HEIGHT, gap: SPACING.lg },
  sectionCard: { gap: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  dateRow: { flexDirection: 'row', gap: SPACING.md },
  financeRow: { flexDirection: 'row', gap: SPACING.md },
  taxRates: { gap: SPACING.md },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxLabel: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, flex: 1 },
  buttonGroup: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
});