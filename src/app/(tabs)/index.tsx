'use client';

import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useProjects } from '@/hooks/useStorage';
import { formatDate, formatCurrency, sortProjects } from '@/utils/helpers';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, BUTTON_HEIGHT } from '@/constants';
import { Button, Card, Header } from '@/components';
import { PROJECT_STATUSES } from '@/types';
import { useHaptics } from '@/hooks/useHaptics';

export default function ProjectsScreen() {
  const { projects, loading, error, load, remove } = useProjects();
  const [refreshing, setRefreshing] = React.useState(false);
  const { trigger: haptic } = useHaptics();
  const sortedProjects = sortProjects(projects);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const handleDelete = (projectId: string, projectName: string) => { haptic('medium'); Alert.alert('Удалить проект?', `"${projectName}" будет удален со всеми отчетами, рабочими и материалами. Это действие нельзя отменить.`, [{ text: 'Отмена', style: 'cancel' }, { text: 'Удалить', style: 'destructive', onPress: () => remove(projectId) }]); };
  const renderItem = ({ item }: { item: any }) => {
    const statusConfig = PROJECT_STATUSES.find((s: any) => s.value === item.status) || PROJECT_STATUSES[0];
    const progress = item.budget > 0 ? Math.round((item.paidAmount / item.budget) * 100) : 0;
    return <TouchableOpacity onPress={() => { haptic('light'); router.push(`/project/${item.id}`); }} style={styles.projectCard} activeOpacity={0.9}>
      <View style={styles.cardHeader}><View style={styles.titleSection}><Text style={styles.projectName} numberOfLines={1}>{item.name}</Text><View style={styles.metaRow}><Text style={styles.clientName}>{item.clientName}</Text><View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20', borderColor: statusConfig.color }]}><Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text></View></View></View></View>
      <View style={styles.cardBody}><View style={styles.infoRow}><View style={styles.infoItem}><Text style={styles.infoLabel}>Бюджет</Text><Text style={styles.infoValue}>{formatCurrency(item.budget)}</Text></View><View style={styles.infoItem}><Text style={styles.infoLabel}>Оплачено</Text><Text style={styles.infoValuePaid}>{formatCurrency(item.paidAmount)}</Text></View><View style={styles.infoItem}><Text style={styles.infoLabel}>Остаток</Text><Text style={styles.infoValue}>{formatCurrency(item.budget - item.paidAmount)}</Text></View></View>
      <View style={styles.progressContainer}><View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: COLORS.primary }]}/></View><Text style={styles.progressText}>{progress}% оплачено</Text></View>
      <View style={styles.footerRow}><Text style={styles.dateText}>{item.address ? `${item.address} · ` : ''}Обновлен: {formatDate(item.updatedAt)}</Text><TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }} style={styles.deleteButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity></View></View>
    </TouchableOpacity>;
  };
  if (loading) return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Загрузка проектов...</Text></View>;
  return (
    <View style={styles.container}><Header title="Мои проекты" subtitle={`${projects.length} объектов`} rightAction={{ icon: 'add', onPress: () => router.push('/project/new'), label: 'Новый проект' }} />
    <View style={styles.content}>{projects.length === 0 ? <View style={styles.emptyState}><Ionicons name="construct-outline" size={64} color={COLORS.textMuted} /><Text style={styles.emptyTitle}>Нет проектов</Text><Text style={styles.emptyText}>Создайте первый проект, чтобы начать вести отчеты</Text><Button onPress={() => { haptic('light'); router.push('/project/new'); }} style={{ marginTop: SPACING.lg, width: 280 }}>Создать проект</Button></View> : <FlatList data={sortedProjects} renderItem={renderItem} keyExtractor={(item: any) => item.id} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} progressBackgroundColor={COLORS.surface} />} ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="search-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyTitle}>Проекты не найдены</Text></View>} />}</View>
    <View style={styles.fabContainer}><TouchableOpacity onPress={() => { haptic('medium'); router.push('/project/new'); }} style={styles.fab} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}><Ionicons name="add" size={28} color={COLORS.textInverse} /></TouchableOpacity></View></View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background }, content: { flex: 1 }, listContent: { padding: SPACING.md, paddingBottom: BUTTON_HEIGHT + SPACING.xl + 20, gap: SPACING.md },
  projectCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  cardHeader: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  titleSection: { gap: SPACING.xs }, projectName: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' }, clientName: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  cardBody: { padding: SPACING.md, gap: SPACING.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flex: 1, alignItems: 'center', gap: 2 },
  infoLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  infoValuePaid: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.primary },
  progressContainer: { gap: SPACING.xs },
  progressBarBg: { height: 6, backgroundColor: COLORS.surfaceElevated, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  dateText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  deleteButton: { padding: SPACING.xs },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  fabContainer: { position: 'absolute', bottom: SPACING.xl + 20, right: SPACING.md, left: SPACING.md },
  fab: { width: BUTTON_HEIGHT, height: BUTTON_HEIGHT, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
});