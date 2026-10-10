export type TaxRegime = 'NPD' | 'IP' | 'OOO';

export interface TaxSettings {
  regime: TaxRegime;
  npdRate: number;
  ipRate: number;
  vatRate: number;
  isVatPayer: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientPhone: string;
  address: string;
  description: string;
  startDate: string;
  endDate?: string;
  budget: number;
  paidAmount: number;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  taxSettings: TaxSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  projectId: string;
  name: string;
  role: string;
  dailyRate: number;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  projectId: string;
  name: string;
  unit: 'шт' | 'м' | 'м2' | 'м3' | 'кг' | 'т' | 'упак' | 'рулон';
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  supplier?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  projectId: string;
  reportId?: string;
  uri: string;
  caption: string;
  type: 'progress' | 'issue' | 'material' | 'completed' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface DailyReport {
  id: string;
  projectId: string;
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
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
}

export interface MaterialDelivery {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  supplier: string;
  accepted: boolean;
}

export interface ClientViewReport {
  projectName: string;
  clientName: string;
  date: string;
  workDone: string;
  workPlan: string;
  workersCount: number;
  photos: string[];
  issues: string;
  foremanName: string;
  budget: number;
  paidAmount: number;
  remainingBudget: number;
}

export const BELARUS_TAX_DEFAULTS: TaxSettings = {
  regime: 'NPD',
  npdRate: 4,
  ipRate: 5,
  vatRate: 20,
  isVatPayer: false,
};

export const WORKER_ROLES = ['Прораб', 'Разнорабочий', 'Качельник', 'Электрик', 'Сантехник', 'Штукатур', 'Плиточник', 'Маляр', 'Столяр', 'Кровельщик', 'Водитель/механик', 'Другой'] as const;
export const WEATHER_OPTIONS = [{ value: 'sunny', label: 'Солнечно', icon: '☀️' }, { value: 'cloudy', label: 'Облачно', icon: '☁️' }, { value: 'rain', label: 'Дождь', icon: '🌧️' }, { value: 'snow', label: 'Снег', icon: '❄️' }, { value: 'windy', label: 'Ветрено', icon: '💨' }] as const;
export const PROJECT_STATUSES = [{ value: 'planning', label: 'Планирование', color: '#3B82F6' }, { value: 'active', label: 'В работе', color: '#22C55E' }, { value: 'paused', label: 'На паузе', color: '#F59E0B' }, { value: 'completed', label: 'Завершен', color: '#10B981' }, { value: 'cancelled', label: 'Отменен', color: '#EF4444' }] as const;
export const TAX_REGIMES = [{ value: 'NPD', label: 'НПД (самозанятый)', description: '4% с дохода, до 2.4 млн BYN/год' }, { value: 'IP', label: 'ИП (упрощенка)', description: '5% с дохода, без НДС до 500 тыс BYN' }, { value: 'OOO', label: 'ООО (ОСНО/УСН)', description: 'Общая/упрощенка, НДС 20%' }] as const;
export const MATERIAL_UNITS = ['шт', 'м', 'м2', 'м3', 'кг', 'т', 'упак', 'рулон'] as const;