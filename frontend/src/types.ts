export type ScreenType =
  | 'home'
  | 'prakriti'
  | 'vault'
  | 'chat'
  | 'settings'
  | 'records'
  | 'wellness'
  | 'consultations';

export type DoshaType = 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Tridoshic';

export interface PrakritiQuestion {
  id: number;
  phase: 1 | 2 | 3;
  phaseName: 'Physical' | 'Mental' | 'Lifestyle';
  title: string;
  options: {
    id: string;
    icon: string;
    iconColorBg: string;
    iconColorText: string;
    title: string;
    description: string;
    dosha: 'Vata' | 'Pitta' | 'Kapha';
  }[];
}

export interface HealthRecordItem {
  id: string;
  category: 'lab' | 'prescription' | 'report' | 'ai-insight' | 'imaging';
  categoryLabel: string;
  title: string;
  date: string;
  doctor: string;
  facility: string;
  statusType: 'normal' | 'active' | 'archival' | 'dosha';
  statusLabel?: string;
  doshaTags?: string[];
  borderAccentColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
  iconName: string;
  fileSize?: string;
  summaryText?: string;
  details?: {
    findings?: string[];
    medications?: { name: string; dosage: string; timing: string; duration: string }[];
    notes?: string;
    vitals?: { label: string; value: string; status: 'optimal' | 'attention' | 'normal' }[];
  };
}

export interface VaultCategory {
  id: 'prescriptions' | 'lab-reports' | 'vaccinations';
  title: string;
  count: number;
  icon: string;
  bgColor: string;
  iconColor: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  insightCard?: {
    tag: string;
    title: string;
    description: string;
    highlight?: string;
    recipeActionText?: string;
  };
}

export interface ConsultThread {
  id: string;
  title: string;
  preview: string;
  time: string;
  messages: ChatMessage[];
  doshaTag?: string;
}

export interface WellnessArticle {
  id: string;
  tag: string;
  tagCategory: 'Ahara (Diet)' | 'Mindfulness' | 'Yoga' | 'Herbology' | 'Dinacharya';
  readTime: string;
  title: string;
  description: string;
  imageUrl?: string;
  hasVideo?: boolean;
  bookmarked?: boolean;
  contentHtml?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  abhaId: string;
  avatarUrl: string;
  kioskMode: boolean;
  privacy: {
    publicProfile: boolean;
    shareDataForResearch: boolean;
    twoFactorAuth: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    pushAppointments: boolean;
    pushRecordUpdates: boolean;
    pushWellnessTips: boolean;
  };
  connectedDevices: {
    id: string;
    name: string;
    type: string;
    status: 'Active' | 'Disconnected' | 'Syncing';
    lastSync: string;
  }[];
}
