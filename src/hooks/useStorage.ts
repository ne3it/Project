'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/storage';
import { Project, DailyReport, Worker, Material, Photo, TaxSettings } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); const data = await storage.getProjects(); setProjects(data); setError(null); } catch (e) { setError('Ошибка загрузки проектов'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const create = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => { const newProject = await storage.createProject(project); setProjects(prev => [newProject, ...prev]); return newProject; };
  const update = async (id: string, updates: Partial<Project>) => { const updated = await storage.updateProject(id, updates); if (updated) setProjects(prev => prev.map(p => p.id === id ? updated : p)); return updated; };
  const remove = async (id: string) => { const success = await storage.deleteProject(id); if (success) setProjects(prev => prev.filter(p => p.id !== id)); return success; };
  const getById = async (id: string) => storage.getProject(id);
  return { projects, loading, error, load, create, update, remove, getById };
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { if (!id) return; try { setLoading(true); const data = await storage.getProject(id); setProject(data); setError(null); } catch (e) { setError('Ошибка загрузки проекта'); } finally { setLoading(false); } }, [id]);
  useEffect(() => { load(); }, [load]);
  return { project, loading, error, load, setProject };
}

export function useReports(projectId: string | undefined) {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { if (!projectId) { setReports([]); setLoading(false); return; } try { setLoading(true); const data = await storage.getReports(projectId); setReports(data); setError(null); } catch (e) { setError('Ошибка загрузки отчетов'); } finally { setLoading(false); } }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const create = async (report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) => { const newReport = await storage.createReport(report); setReports(prev => [newReport, ...prev]); return newReport; };
  const update = async (id: string, updates: Partial<DailyReport>) => { const updated = await storage.updateReport(id, updates); if (updated) setReports(prev => prev.map(r => r.id === id ? updated : r)); return updated; };
  const remove = async (id: string) => { const success = await storage.deleteReport(id); if (success) setReports(prev => prev.filter(r => r.id !== id)); return success; };
  const getLatest = async () => { if (!projectId) return null; return storage.getLatestReport(projectId); };
  return { reports, loading, error, load, create, update, remove, getLatest };
}

export function useWorkers(projectId: string | undefined) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { if (!projectId) { setWorkers([]); setLoading(false); return; } try { setLoading(true); const data = await storage.getWorkers(projectId); setWorkers(data); } catch (e) { console.error(e); } finally { setLoading(false); } }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const create = async (worker: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>) => { const newWorker = await storage.createWorker(worker); setWorkers(prev => [...prev, newWorker]); return newWorker; };
  const update = async (id: string, updates: Partial<Worker>) => { const updated = await storage.updateWorker(id, updates); if (updated) setWorkers(prev => prev.map(w => w.id === id ? updated : w)); return updated; };
  const remove = async (id: string) => { const success = await storage.deleteWorker(id); if (success) setWorkers(prev => prev.filter(w => w.id !== id)); return success; };
  return { workers, loading, load, create, update, remove };
}

export function useMaterials(projectId: string | undefined) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { if (!projectId) { setMaterials([]); setLoading(false); return; } try { setLoading(true); const data = await storage.getMaterials(projectId); setMaterials(data); } catch (e) { console.error(e); } finally { setLoading(false); } }, [projectId]);
  useEffect(() => { load(); }, [load]);
  const create = async (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'totalPrice'>) => { const newMaterial = await storage.createMaterial(material); setMaterials(prev => [newMaterial, ...prev]); return newMaterial; };
  const update = async (id: string, updates: Partial<Material>) => { const updated = await storage.updateMaterial(id, updates); if (updated) setMaterials(prev => prev.map(m => m.id === id ? updated : m)); return updated; };
  const remove = async (id: string) => { const success = await storage.deleteMaterial(id); if (success) setMaterials(prev => prev.filter(m => m.id !== id)); return success; };
  return { materials, loading, load, create, update, remove };
}

export function usePhotos(projectId?: string, reportId?: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { setLoading(true); const data = await storage.getPhotos(projectId, reportId); setPhotos(data); } catch (e) { console.error(e); } finally { setLoading(false); } }, [projectId, reportId]);
  useEffect(() => { load(); }, [load]);
  const create = async (photo: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'>) => { const newPhoto = await storage.createPhoto(photo); setPhotos(prev => [newPhoto, ...prev]); return newPhoto; };
  const remove = async (id: string) => { const success = await storage.deletePhoto(id); if (success) setPhotos(prev => prev.filter(p => p.id !== id)); return success; };
  return { photos, loading, load, create, remove };
}

export function useTaxSettings() {
  const [settings, setSettingsState] = useState<TaxSettings>({ regime: 'NPD', npdRate: 4, ipRate: 5, vatRate: 20, isVatPayer: false });
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { const data = await storage.getTaxSettings(); setSettingsState(data); } catch (e) { console.error(e); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const update = async (newSettings: Partial<TaxSettings>) => { const updated = { ...settings, ...newSettings }; await storage.setTaxSettings(updated); setSettingsState(updated); };
  return { settings, loading, update };
}