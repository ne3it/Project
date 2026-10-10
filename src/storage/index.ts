'use client';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, DailyReport, Worker, Material, Photo, TaxSettings } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { generateId, getNowISO } from '@/utils/helpers';

class StorageService {
  private async get<T>(key: string): Promise<T[]> { try { const data = await AsyncStorage.getItem(key); return data ? JSON.parse(data) : []; } catch (error) { console.error(`Error reading ${key}:`, error); return []; } }
  private async set<T>(key: string, data: T[]): Promise<void> { try { await AsyncStorage.setItem(key, JSON.stringify(data)); } catch (error) { console.error(`Error writing ${key}:`, error); throw error; } }
  private async add<T extends { id: string; createdAt: string; updatedAt: string }>(key: string, item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> { const data = await this.get<T>(key); const now = getNowISO(); const newItem = { ...item, id: generateId(), createdAt: now, updatedAt: now } as T; await this.set(key, [...data, newItem]); return newItem; }
  private async update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): Promise<T | null> { const data = await this.get<T>(key); const index = data.findIndex(item => item.id === id); if (index === -1) return null; const updated = { ...data[index], ...updates, updatedAt: getNowISO() }; data[index] = updated; await this.set(key, data); return updated; }
  private async remove(key: string, id: string): Promise<boolean> { const data = await this.get(key); const filtered = data.filter((item: any) => item.id !== id); if (filtered.length === data.length) return false; await this.set(key, filtered); return true; }
  private async clear(key: string): Promise<void> { await this.set(key, []); }

  async getProjects(): Promise<Project[]> { return this.get<Project>(STORAGE_KEYS.PROJECTS); }
  async getProject(id: string): Promise<Project | null> { const projects = await this.getProjects(); return projects.find(p => p.id === id) || null; }
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> { return this.add<Project>(STORAGE_KEYS.PROJECTS, project); }
  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> { return this.update<Project>(STORAGE_KEYS.PROJECTS, id, updates); }
  async deleteProject(id: string): Promise<boolean> { await this.deleteReportsByProject(id); await this.deleteWorkersByProject(id); await this.deleteMaterialsByProject(id); await this.deletePhotosByProject(id); return this.remove(STORAGE_KEYS.PROJECTS, id); }
  async getReports(projectId?: string): Promise<DailyReport[]> { const reports = await this.get<DailyReport>(STORAGE_KEYS.REPORTS); if (projectId) return reports.filter(r => r.projectId === projectId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); }
  async getReport(id: string): Promise<DailyReport | null> { const reports = await this.getReports(); return reports.find(r => r.id === id) || null; }
  async getLatestReport(projectId: string): Promise<DailyReport | null> { const reports = await this.getReports(projectId); return reports[0] || null; }
  async createReport(report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyReport> { return this.add<DailyReport>(STORAGE_KEYS.REPORTS, report); }
  async updateReport(id: string, updates: Partial<DailyReport>): Promise<DailyReport | null> { return this.update<DailyReport>(STORAGE_KEYS.REPORTS, id, updates); }
  async deleteReport(id: string): Promise<boolean> { return this.remove(STORAGE_KEYS.REPORTS, id); }
  async deleteReportsByProject(projectId: string): Promise<void> { const reports = await this.getReports(projectId); for (const report of reports) await this.remove(STORAGE_KEYS.REPORTS, report.id); }
  async getWorkers(projectId?: string): Promise<Worker[]> { const workers = await this.get<Worker>(STORAGE_KEYS.WORKERS); if (projectId) return workers.filter(w => w.projectId === projectId && w.isActive); return workers.filter(w => w.isActive); }
  async createWorker(worker: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>): Promise<Worker> { return this.add<Worker>(STORAGE_KEYS.WORKERS, worker); }
  async updateWorker(id: string, updates: Partial<Worker>): Promise<Worker | null> { return this.update<Worker>(STORAGE_KEYS.WORKERS, id, updates); }
  async deleteWorker(id: string): Promise<boolean> { return this.updateWorker(id, { isActive: false }) !== null; }
  async deleteWorkersByProject(projectId: string): Promise<void> { const workers = await this.getWorkers(projectId); for (const worker of workers) await this.updateWorker(worker.id, { isActive: false }); }
  async getMaterials(projectId?: string): Promise<Material[]> { const materials = await this.get<Material>(STORAGE_KEYS.MATERIALS); if (projectId) return materials.filter(m => m.projectId === projectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); return materials; }
  async createMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'totalPrice'>): Promise<Material> { const totalPrice = material.quantity * material.pricePerUnit; return this.add<Material>(STORAGE_KEYS.MATERIALS, { ...material, totalPrice }); }
  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material | null> { const material = await this.getMaterial(id); if (!material) return null; const quantity = updates.quantity ?? material.quantity; const pricePerUnit = updates.pricePerUnit ?? material.pricePerUnit; const totalPrice = quantity * pricePerUnit; return this.update<Material>(STORAGE_KEYS.MATERIALS, id, { ...updates, totalPrice }); }
  async getMaterial(id: string): Promise<Material | null> { const materials = await this.getMaterials(); return materials.find(m => m.id === id) || null; }
  async deleteMaterial(id: string): Promise<boolean> { return this.remove(STORAGE_KEYS.MATERIALS, id); }
  async deleteMaterialsByProject(projectId: string): Promise<void> { const materials = await this.getMaterials(projectId); for (const material of materials) await this.remove(STORAGE_KEYS.MATERIALS, material.id); }
  async getPhotos(projectId?: string, reportId?: string): Promise<Photo[]> { const photos = await this.get<Photo>(STORAGE_KEYS.PHOTOS); return photos.filter(p => { if (projectId && p.projectId !== projectId) return false; if (reportId && p.reportId !== reportId) return false; return true; }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }
  async createPhoto(photo: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Photo> { return this.add<Photo>(STORAGE_KEYS.PHOTOS, photo); }
  async deletePhoto(id: string): Promise<boolean> { return this.remove(STORAGE_KEYS.PHOTOS, id); }
  async deletePhotosByProject(projectId: string): Promise<void> { const photos = await this.getPhotos(projectId); for (const photo of photos) await this.remove(STORAGE_KEYS.PHOTOS, photo.id); }
  async deletePhotosByReport(reportId: string): Promise<void> { const photos = await this.getPhotos(undefined, reportId); for (const photo of photos) await this.remove(STORAGE_KEYS.PHOTOS, photo.id); }
  async getSettings(): Promise<any> { try { const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS); return data ? JSON.parse(data) : {}; } catch { return {}; } }
  async setSettings(settings: any): Promise<void> { await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }
  async getTaxSettings(): Promise<TaxSettings> { const settings = await this.getSettings(); return settings.taxSettings || { regime: 'NPD', npdRate: 4, ipRate: 5, vatRate: 20, isVatPayer: false }; }
  async setTaxSettings(taxSettings: TaxSettings): Promise<void> { const settings = await this.getSettings(); await this.setSettings({ ...settings, taxSettings }); }
  async clearAll(): Promise<void> { await Promise.all([ this.clear(STORAGE_KEYS.PROJECTS), this.clear(STORAGE_KEYS.REPORTS), this.clear(STORAGE_KEYS.WORKERS), this.clear(STORAGE_KEYS.MATERIALS), this.clear(STORAGE_KEYS.PHOTOS), this.clear(STORAGE_KEYS.SETTINGS) ]); }
}

export const storage = new StorageService();
export default storage;