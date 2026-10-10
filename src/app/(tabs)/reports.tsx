'use client';

import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useReports } from '@/hooks/useStorage';
import { useProjects } from '@/hooks/useStorage';
import { formatDate, formatReportNumber } from '@/utils/helpers';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, BUTTON_HEIGHT } from '@/constants';
import { Button, Card, Header, Select } from '@/components';
import { useHaptics } from '@/hooks/useHaptics';

export default function ReportsScreen() {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | 'all'>('all');
  const { reports, loading, error, load, remove } = useReports(selectedProjectId === 'all' ? undefined : selectedProjectId);
  const [refreshing, setRefreshing] = React.useState(false);
  const { trigger: haptic } = useHaptics();

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDelete = (reportId: string, reportDate: string) => {
    haptic('medium');
    Alert.alert('Удалить отчет?', `Отчет от ${formatDate(reportDate)} будет удален. Это действие нельзя отменить.`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => remove(reportId) },
    ]);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const project = projects.find(p => p.id === item.projectId);
    return (
      <TouchableOpacity
        onPress={() => { haptic('light'); router.push(`/report/detail/${item.id}`); }}
        style={styles.reportCard}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.reportNumber}>{formatReportNumber(item, index)}</Text>
            <Text style={styles.projectName}>{project?.name || 'Проект не найден'}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportDate}>{formatDate(item.date)}</Text>
            {item.foremanSigned && <View style={styles.signedBadge}><Ionicons name="checkmark-circle" size={16} color={COLORS.primary} /><Text style={styles.signedText}>Подписан</Text></View>}
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}><Text style={styles.statValue}>{item.workersPresent}</Text><Text style={styles.statLabel}>работников</Text></View>
            <View style={styles.statItem}><Text style={styles.statValue}>{item.manHours}</Text><Text style={styles.statLabel}>чел-ч</Text></View>
            <View style={styles.statItem}><Text style={styles.statValue}>{item.materialsUsed.length + item.materialsDelivered.length}</Text><Text style={styles.statLabel}>материалов</Text></View>
            <View style={styles.statItem}><Text style={styles.statValue}>{item.photos.length}</Text><Text style={styles.statLabel}>фото</Text></View>
          </View>
          {item.workDone && <Text style={styles.workPreview} numberOfLines={2}>{item.workDone}</Text>}
        </View>
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(item.id, item.date); }} style={styles.deleteButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); haptic('light'); router.push(`/report/share/${item.id}`); }} style={styles.shareButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Ionicons name="share-outline" size={20} color={COLORS.primary} /></TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const projectOptions = [
    { value: 'all', label: 'Все проекты' },
    ...projects.map(p => ({ value: p.id, label: p.name })),
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Отчеты"
        subtitle={`${reports.length} записей`}
        rightAction={{ icon: 'add', onPress: () => { haptic('medium'); if (projects.length === 0) { Alert.alert('Нет проектов', 'Сначала создайте проект'); return; } router.push('/report/new'); }, label: 'Новый отчет' }}
      />
      <View style={styles.filterContainer}>
        <Select
          value={selectedProjectId}
          onChange={setSelectedProjectId}
          options={projectOptions}
          style={{ width: '100%' }}
        />
      </View>
      <View style={styles.content}>
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name={projects.length === 0 ? 'construct-outline' : 'document-text-outline'} size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>{projects.length === 0 ? 'Нет проектов' : 'Нет отчетов'}</Text>
            <Text style={styles.emptyText}>{projects.length === 0 ? 'Создайте проект, чтобы начать вести отчеты' : 'Создайте первый отчет для выбранного проекта'}</Text>
            {projects.length > 0 && (
              <Button onPress={() => { haptic('light'); router.push('/report/new'); }} style={{ marginTop: SPACING.lg, width: 280 }}>Создать отчет</Button>
            )}
          </View>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderItem}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} progressBackgroundColor={COLORS.surface} />}
            ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="search-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyTitle}>Отчеты не найдены</Text></View>}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filterContainer: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  content: { flex: 1 },
  listContent: { padding: SPACING.md, paddingBottom: BUTTON_HEIGHT + SPACING.xl + 20, gap: SPACING.md },
  reportCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  headerLeft: { flex: 1 },
  reportNumber: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  projectName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary, marginTop: 2 },
  headerRight: { alignItems: 'flex-end', gap: SPACING.xs },
  reportDate: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  signedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 2, backgroundColor: COLORS.primary + '15', borderRadius: BORDER_RADIUS.full },
  signedText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.primary },
  cardBody: { padding: SPACING.md, gap: SPACING.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  workPreview: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  deleteButton: { padding: SPACING.xs },
  shareButton: { padding: SPACING.xs },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
});