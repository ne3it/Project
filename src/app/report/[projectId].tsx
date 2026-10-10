'use client';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Keyboard, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useProjects, useProject } from '@/hooks/useStorage';
import { useReports } from '@/hooks/useStorage';
import { useWorkers } from '@/hooks/useStorage';
import { useMaterials } from '@/hooks/useStorage';
import { useTaxSettings } from '@/hooks/useStorage';
import { formatDate, getTodayISO, generateId, calculateTax, calculateVat, calculateNetIncome } from '@/utils/helpers';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, BUTTON_HEIGHT, WEATHER_OPTIONS, MATERIAL_UNITS, APP_NAME } from '@/constants';
import { Button, Card, Input, TextArea, Select, Header } from '@/components';
import { useHaptics } from '@/hooks/useHaptics';
import { DailyReport, MaterialUsage, MaterialDelivery } from '@/types';

export default function ReportEntryScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { project, loading: projectLoading } = useProject(projectId);
  const { reports, create: createReport, load: loadReports } = useReports(projectId);
  const { workers, loading: workersLoading } = useWorkers(projectId);
  const { materials, loading: materialsLoading } = useMaterials(projectId);
  const { settings: taxSettings } = useTaxSettings();
  const { trigger: haptic } = useHaptics();

  const activeWorkers = workers.filter(w => w.isActive);
  const activeMaterials = materials.filter(m => m.quantity > 0);

  interface FormData {
  date: string;
  weather: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'windy';
  temperature: number;
  workDone: string;
  workPlan: string;
  workersPresent: number;
  workersList: string[];
  manHours: number;
  materialsUsed: MaterialUsage[];
  materialsDelivered: MaterialDelivery[];
  issues: string;
  clientDecisions: string;
  photos: string[];
  foremanName: string;
  foremanSigned: boolean;
}

  const [formData, setFormData] = useState<FormData>({
    date: getTodayISO(),
    weather: 'sunny',
    temperature: 20,
    workDone: '',
    workPlan: '',
    workersPresent: activeWorkers.length,
    workersList: activeWorkers.map((w) => w.name),
    manHours: activeWorkers.length * 8,
    materialsUsed: [] as MaterialUsage[],
    materialsDelivered: [] as MaterialDelivery[],
    issues: '',
    clientDecisions: '',
    photos: [] as string[],
    foremanName: '',
    foremanSigned: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showWorkerPicker, setShowWorkerPicker] = useState(false);
  const [showMaterialUsedPicker, setShowMaterialUsedPicker] = useState(false);
  const [showMaterialDeliveredPicker, setShowMaterialDeliveredPicker] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQuantity, setNewMaterialQuantity] = useState('');
  const [newMaterialUnit, setNewMaterialUnit] = useState('шт');
  const [newMaterialSupplier, setNewMaterialSupplier] = useState('');

  const currentProject = project;

  useEffect(() => {
    if (currentProject) {
      setFormData(prev => ({ ...prev, foremanName: currentProject.clientName }));
    }
  }, [currentProject]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.workDone.trim()) newErrors.workDone = 'Опишите выполненные работы';
    if (!formData.foremanName.trim()) newErrors.foremanName = 'Введите имя прораба';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { haptic('error'); return; }
    setSaving(true);
    try {
      const reportData: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId: projectId!,
        date: formData.date,
        weather: formData.weather,
        temperature: formData.temperature,
        workDone: formData.workDone.trim(),
        workPlan: formData.workPlan.trim(),
        workersPresent: formData.workersPresent,
        workersList: formData.workersList,
        manHours: formData.manHours,
        materialsUsed: formData.materialsUsed,
        materialsDelivered: formData.materialsDelivered,
        issues: formData.issues.trim(),
        clientDecisions: formData.clientDecisions.trim(),
        photos: formData.photos,
        foremanName: formData.foremanName.trim(),
        foremanSigned: formData.foremanSigned,
        signedAt: formData.foremanSigned ? new Date().toISOString() : undefined,
      };
      await createReport(reportData);
      haptic('success');
      router.back();
    } catch (e) {
      haptic('error');
      Alert.alert('Ошибка', 'Не удалось сохранить отчет');
    } finally {
      setSaving(false);
    }
  };

  const toggleWorker = (workerName: string) => {
    setFormData(prev => ({
      ...prev,
      workersList: prev.workersList.includes(workerName)
        ? prev.workersList.filter(w => w !== workerName)
        : [...prev.workersList, workerName],
      workersPresent: prev.workersList.includes(workerName)
        ? prev.workersPresent - 1
        : prev.workersPresent + 1,
      manHours: prev.workersList.includes(workerName)
        ? prev.manHours - 8
        : prev.manHours + 8,
    }));
    haptic('light');
  };

  const addMaterialUsed = () => {
    if (!newMaterialName.trim() || !newMaterialQuantity) return;
    const material = {
      materialId: generateId(),
      materialName: newMaterialName.trim(),
      quantity: parseFloat(newMaterialQuantity),
      unit: newMaterialUnit,
    };
    setFormData(prev => ({
      ...prev,
      materialsUsed: [...prev.materialsUsed, material],
    }));
    setNewMaterialName('');
    setNewMaterialQuantity('');
    setShowMaterialUsedPicker(false);
    haptic('success');
  };

  const addMaterialDelivered = () => {
    if (!newMaterialName.trim() || !newMaterialQuantity) return;
    const material = {
      materialId: generateId(),
      materialName: newMaterialName.trim(),
      quantity: parseFloat(newMaterialQuantity),
      unit: newMaterialUnit,
      supplier: newMaterialSupplier.trim(),
      accepted: true,
    };
    setFormData(prev => ({
      ...prev,
      materialsDelivered: [...prev.materialsDelivered, material],
    }));
    setNewMaterialName('');
    setNewMaterialQuantity('');
    setNewMaterialSupplier('');
    setShowMaterialDeliveredPicker(false);
    haptic('success');
  };

  const removeMaterialUsed = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materialsUsed: prev.materialsUsed.filter((_, i) => i !== index),
    }));
    haptic('light');
  };

  const removeMaterialDelivered = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materialsDelivered: prev.materialsDelivered.filter((_, i) => i !== index),
    }));
    haptic('light');
  };

  if (projectLoading || workersLoading || materialsLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Загрузка...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Новый отчет"
        subtitle={currentProject?.name}
        leftAction={{ icon: 'chevron-back', onPress: () => router.back() }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Дата и погода</Text>
          <View style={styles.dateWeatherRow}>
            <Input label="Дата" placeholder="ДД.ММ.ГГГГ" value={formData.date} onChangeText={v => setFormData({ ...formData, date: v })} required keyboardType="numeric" maxLength={10} style={{ flex: 1 }} />
            <Select
              label="Погода"
              value={formData.weather}
              onChange={v => setFormData({ ...formData, weather: v as any })}
              options={WEATHER_OPTIONS.map((w) => ({ value: w.value, label: `${w.icon} ${w.label}` }))}
              style={{ flex: 1 }}
            />
          </View>
          <Input label="Температура (°C)" placeholder="20" value={String(formData.temperature)} onChangeText={v => setFormData({ ...formData, temperature: parseInt(v) || 0 })} keyboardType="numeric" style={{ maxWidth: 120 }} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Работы</Text>
          <TextArea label="Выполнено сегодня" placeholder="Опишите выполненные работы..." value={formData.workDone} onChangeText={v => setFormData({ ...formData, workDone: v })} error={errors.workDone} required minHeight={100} />
          <TextArea label="План на завтра" placeholder="Что планируется сделать завтра..." value={formData.workPlan} onChangeText={v => setFormData({ ...formData, workPlan: v })} minHeight={80} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Рабочие на объекте</Text>
          <View style={styles.workersSummary}>
            <Text style={styles.summaryItem}><Text style={styles.summaryValue}>{formData.workersPresent}</Text><Text style={styles.summaryLabel}>человек</Text></Text>
            <Text style={styles.summaryItem}><Text style={styles.summaryValue}>{formData.manHours}</Text><Text style={styles.summaryLabel}>чел-ч</Text></Text>
          </View>
          {activeWorkers.length > 0 ? (
            <View style={styles.workerGrid}>
              {activeWorkers.map(worker => (
                <TouchableOpacity
                  key={worker.id}
                  onPress={() => toggleWorker(worker.name)}
                  style={[
                    styles.workerChip,
                    formData.workersList.includes(worker.name) && styles.workerChipSelected
                  ]}
                >
                  <Text style={[
                    styles.workerChipText,
                    formData.workersList.includes(worker.name) && styles.workerChipTextSelected
                  ]}>{worker.name}</Text>
                  <Text style={styles.workerChipRole}>{worker.role}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noWorkers}>Нет добавленных рабочих. Добавьте их в проекте.</Text>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Материалы - Использовано</Text>
          {formData.materialsUsed.length > 0 ? (
            formData.materialsUsed.map((m, index) => (
              <View key={index} style={styles.materialRow}>
                <View style={styles.materialInfo}><Text style={styles.materialName}>{m.materialName}</Text><Text style={styles.materialDetails}>{m.quantity} {m.unit}</Text></View>
                <TouchableOpacity onPress={() => removeMaterialUsed(index)} style={styles.removeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Ionicons name="close" size={20} color={COLORS.danger} /></TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noMaterials}>Материалы не добавлены</Text>
          )}
          <View style={styles.addMaterialForm}>
            <Input label="Название" placeholder="Напр. Цемент М400" value={newMaterialName} onChangeText={setNewMaterialName} style={{ flex: 2 }} />
            <Input label="Кол-во" placeholder="10" value={newMaterialQuantity} onChangeText={setNewMaterialQuantity} keyboardType="numeric" style={{ width: 80 }} />
            <Select value={newMaterialUnit} onChange={setNewMaterialUnit} options={MATERIAL_UNITS.map((u) => ({ value: u, label: u }))} style={{ width: 80 }} />
          </View>
          <Button variant="outline" onPress={addMaterialUsed} style={{ alignSelf: 'flex-start', marginTop: SPACING.sm }} leftIcon={<Ionicons name="add" size={20} color={COLORS.primary} />}>Добавить</Button>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Материалы - Поступило</Text>
          {formData.materialsDelivered.length > 0 ? (
            formData.materialsDelivered.map((m, index) => (
              <View key={index} style={styles.materialRow}>
                <View style={styles.materialInfo}><Text style={styles.materialName}>{m.materialName}</Text><Text style={styles.materialDetails}>{m.quantity} {m.unit} · {m.supplier}</Text></View>
                <TouchableOpacity onPress={() => removeMaterialDelivered(index)} style={styles.removeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Ionicons name="close" size={20} color={COLORS.danger} /></TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noMaterials}>Материалы не добавлены</Text>
          )}
          <View style={styles.addMaterialForm}>
            <Input label="Название" placeholder="Напр. Песок" value={newMaterialName} onChangeText={setNewMaterialName} style={{ flex: 2 }} />
            <Input label="Кол-во" placeholder="5" value={newMaterialQuantity} onChangeText={setNewMaterialQuantity} keyboardType="numeric" style={{ width: 80 }} />
            <Select value={newMaterialUnit} onChange={setNewMaterialUnit} options={MATERIAL_UNITS.map((u) => ({ value: u, label: u }))} style={{ width: 80 }} />
            <Input label="Поставщик" placeholder="ООО СтройСнаб" value={newMaterialSupplier} onChangeText={setNewMaterialSupplier} style={{ flex: 2 }} />
          </View>
          <Button variant="outline" onPress={addMaterialDelivered} style={{ alignSelf: 'flex-start', marginTop: SPACING.sm }} leftIcon={<Ionicons name="add" size={20} color={COLORS.primary} />}>Добавить</Button>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Проблемы и решения</Text>
          <TextArea label="Проблемы/Замечания" placeholder="Опишите возникшие проблемы..." value={formData.issues} onChangeText={v => setFormData({ ...formData, issues: v })} minHeight={80} />
          <TextArea label="Решения заказчика" placeholder="Какие решения принял заказчик..." value={formData.clientDecisions} onChangeText={v => setFormData({ ...formData, clientDecisions: v })} minHeight={80} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Подпись прораба</Text>
          <Input label="Имя прораба" placeholder="Ваше имя" value={formData.foremanName} onChangeText={v => setFormData({ ...formData, foremanName: v })} error={errors.foremanName} required autoCapitalize="words" />
          <View style={styles.signRow}>
            <View style={[styles.checkbox, formData.foremanSigned && styles.checkboxChecked]} onTouchStart={() => setFormData(prev => ({ ...prev, foremanSigned: !prev.foremanSigned }))} />
            <Text style={styles.checkboxLabel}>Подписать отчет (фиксирует дату и время)</Text>
          </View>
        </Card>

        <View style={styles.buttonGroup}>
          <Button variant="outline" onPress={() => router.back()} style={{ flex: 1 }}>Отмена</Button>
          <Button variant="primary" onPress={handleSave} loading={saving} style={{ flex: 1 }}>Сохранить отчет</Button>
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
  dateWeatherRow: { flexDirection: 'row', gap: SPACING.md },
  workersSummary: { flexDirection: 'row', gap: SPACING.xl, marginBottom: SPACING.md },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.primary },
  summaryLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textTransform: 'uppercase' },
  workerGrid: { gap: SPACING.sm },
  workerChip: { padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.surface, gap: 4 },
  workerChipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  workerChipText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  workerChipTextSelected: { color: COLORS.primary },
  workerChipRole: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  noWorkers: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, textAlign: 'center', padding: SPACING.lg },
  materialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  materialInfo: { flex: 1 },
  materialName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  materialDetails: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  removeButton: { padding: SPACING.xs },
  noMaterials: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, textAlign: 'center', padding: SPACING.md },
  addMaterialForm: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', marginTop: SPACING.md },
  signRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxLabel: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, flex: 1 },
  buttonGroup: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
});