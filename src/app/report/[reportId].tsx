'use client';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Share, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useReports } from '@/hooks/useStorage';
import { useProjects } from '@/hooks/useStorage';
import { formatDate, formatDateTime, formatCurrency, generateShareText } from '@/utils/helpers';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, WEATHER_OPTIONS, APP_NAME } from '@/constants';
import { Button, Card, Header } from '@/components';
import { useHaptics } from '@/hooks/useHaptics';
import { DailyReport } from '@/types';

export default function ReportDetailScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const { reports, loading, error, remove } = useReports(undefined);
  const { projects } = useProjects();
  const { trigger: haptic } = useHaptics();

  const [currentReport, setCurrentReport] = useState<DailyReport | null>(null);

  useEffect(() => {
    if (reportId && reports) {
      const found = reports.find((r) => r.id === reportId);
      if (found) setCurrentReport(found);
    }
  }, [reportId, reports]);

  const handleShare = async () => {
    if (!currentReport) return;
    const project = projects.find(p => p.id === currentReport.projectId);
    if (!project) return;
    haptic('medium');
    const shareText = generateShareText(currentReport, project);
    try {
      await Share.share({ title: `${APP_NAME} - Отчет ${formatDate(currentReport.date)}`, message: shareText });
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось поделиться отчетом');
    }
  };

  const handleShareClient = async () => {
    if (!currentReport) return;
    const project = projects.find(p => p.id === currentReport.projectId);
    if (!project) return;
    haptic('medium');
    const lines = [
      `📋 ${APP_NAME} — Отчет для заказчика`,
      `🏗 ${project.name}`,
      `👤 Заказчик: ${project.clientName}`,
      `📅 ${formatDate(currentReport.date)}`,
      `🌤 Погода: ${getWeatherLabel(currentReport.weather)} ${currentReport.temperature}°C`,
      ``,
      `✅ СДЕЛАНО:`,
      currentReport.workDone || '—',
      ``,
      `📋 ПЛАН НА ЗАВТРА:`,
      currentReport.workPlan || '—',
      ``,
      `👷 Людей на объекте: ${currentReport.workersPresent}`,
      `⏱ Человеко-часов: ${currentReport.manHours}`,
      ``,
      `📸 Фото: ${currentReport.photos.length}`,
      `---`,
      `Сгенерировано в ${APP_NAME}`,
    ];
    try {
      await Share.share({ title: `Отчет для ${project.clientName}`, message: lines.join('\n') });
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось поделиться отчетом');
    }
  };

  const handleDelete = () => {
    if (!currentReport) return;
    haptic('warning');
    Alert.alert('Удалить отчет?', `Отчет от ${formatDate(currentReport.date)} будет удален. Это действие нельзя отменить.`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => { remove(currentReport.id); router.back(); } },
    ]);
  };

  const getWeatherLabel = (weather: string) => {
    const w = WEATHER_OPTIONS.find((o) => o.value === weather);
    return w ? `${w.icon} ${w.label}` : weather;
  };

  if (loading || !currentReport) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Загрузка...</Text></View>;
  }

  const project = projects.find(p => p.id === currentReport.projectId);

  return (
    <View style={styles.container}>
      <Header
        title="Отчет"
        subtitle={formatDate(currentReport.date)}
        leftAction={{ icon: 'chevron-back', onPress: () => router.back() }}
        rightAction={{ icon: 'share', onPress: handleShare, label: 'Поделиться' }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.sectionCard}>
          <View style={styles.headerInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Проект</Text>
              <Text style={styles.infoValue}>{project?.name || 'Неизвестный проект'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Заказчик</Text>
              <Text style={styles.infoValue}>{project?.clientName || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Прораб</Text>
              <Text style={styles.infoValue}>{currentReport.foremanName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Статус</Text>
              <View style={styles.statusRow}>
                {currentReport.foremanSigned && (
                  <View style={styles.signedBadge}><Ionicons name="checkmark-circle" size={16} color={COLORS.primary} /><Text style={styles.signedText}>Подписан</Text></View>
                )}
                <Text style={styles.timestamp}>{currentReport.foremanSigned && currentReport.signedAt ? `Подписан ${formatDateTime(currentReport.signedAt)}` : 'Черновик'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Погода</Text>
              <Text style={styles.infoValue}>{getWeatherLabel(currentReport.weather)} {currentReport.temperature}°C</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Выполненные работы</Text>
          <Text style={styles.contentText}>{currentReport.workDone || 'Не указано'}</Text>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>План на завтра</Text>
          <Text style={styles.contentText}>{currentReport.workPlan || 'Не указано'}</Text>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Персонал и трудозатраты</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}><Text style={styles.statValue}>{currentReport.workersPresent}</Text><Text style={styles.statLabel}>Работников</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{currentReport.manHours}</Text><Text style={styles.statLabel}>Человеко-часов</Text></View>
            {currentReport.workersList.length > 0 && (
              <View style={styles.workerList}>
                <Text style={styles.subSectionTitle}>Список работников:</Text>
                {currentReport.workersList.map((name, i) => (
                  <Text key={i} style={styles.workerName}>• {name}</Text>
                ))}
              </View>
            )}
          </View>
        </Card>

        {(currentReport.materialsUsed.length > 0 || currentReport.materialsDelivered.length > 0) && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Материалы</Text>
            {currentReport.materialsUsed.length > 0 && (
              <View style={styles.materialSection}>
                <Text style={styles.subSectionTitle}>Использовано:</Text>
                {currentReport.materialsUsed.map((m, i) => (
                  <View key={i} style={styles.materialRow}><Text style={styles.materialName}>{m.materialName}</Text><Text style={styles.materialQty}>{m.quantity} {m.unit}</Text></View>
                ))}
              </View>
            )}
            {currentReport.materialsDelivered.length > 0 && (
              <View style={styles.materialSection}>
                <Text style={styles.subSectionTitle}>Поступило:</Text>
                {currentReport.materialsDelivered.map((m, i) => (
                  <View key={i} style={styles.materialRow}><Text style={styles.materialName}>{m.materialName}</Text><Text style={styles.materialQty}>{m.quantity} {m.unit} · {m.supplier}</Text></View>
                ))}
              </View>
            )}
          </Card>
        )}

        {(currentReport.issues || currentReport.clientDecisions) && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Проблемы и решения</Text>
            {currentReport.issues && (
              <View style={styles.issueSection}><Text style={styles.subSectionTitle}>Проблемы/Замечания:</Text><Text style={styles.contentText}>{currentReport.issues}</Text></View>
            )}
            {currentReport.clientDecisions && (
              <View style={styles.issueSection}><Text style={styles.subSectionTitle}>Решения заказчика:</Text><Text style={styles.contentText}>{currentReport.clientDecisions}</Text></View>
            )}
          </Card>
        )}

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Служебная информация</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Создан</Text><Text style={styles.infoValue}>{formatDateTime(currentReport.createdAt)}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Обновлен</Text><Text style={styles.infoValue}>{formatDateTime(currentReport.updatedAt)}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Фото</Text><Text style={styles.infoValue}>{currentReport.photos.length} шт.</Text></View>
        </Card>

        <View style={styles.actionButtons}>
          <Button variant="outline" onPress={handleShareClient} leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.primary} />}>Отправить заказчику</Button>
          <Button variant="primary" onPress={handleShare} leftIcon={<Ionicons name="share-outline" size={20} color={COLORS.textInverse} />}>Полный отчет</Button>
          <Button variant="danger" onPress={handleDelete} leftIcon={<Ionicons name="trash-outline" size={20} color={COLORS.textInverse} />}>Удалить</Button>
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
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.lg },
  sectionCard: { gap: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  headerInfo: { gap: SPACING.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs },
  infoLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  infoValue: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'right', maxWidth: '70%' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  signedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 2, backgroundColor: COLORS.primary + '15', borderRadius: BORDER_RADIUS.full },
  signedText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.primary },
  timestamp: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  contentText: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, lineHeight: 22 },
  statsGrid: { gap: SPACING.md },
  statCard: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.surfaceElevated, borderRadius: BORDER_RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight },
  statValue: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  workerList: { marginTop: SPACING.md, gap: SPACING.xs },
  subSectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
  workerName: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  materialSection: { marginTop: SPACING.md, gap: SPACING.sm },
  materialRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  materialName: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  materialQty: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary },
  issueSection: { marginTop: SPACING.md, gap: SPACING.xs },
  actionButtons: { gap: SPACING.md, marginTop: SPACING.lg, paddingHorizontal: SPACING.md },
});