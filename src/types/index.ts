export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  state: string;
  course: string;
  bankIncome: number;
  otherIncome?: number;
  totalIncome: number;
  calculatedTax: number;
  netIncome: number;
  processed: boolean;
}

export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
}

export interface AnalyticsData {
  totalIncome: number;
  totalTax: number;
  avgTax: number;
  totalStudents: number;
  incomeByMonth: { month: string; income: number; tax: number }[];
  incomeByCourse: { course: string; income: number; students: number }[];
  incomeByState: { state: string; income: number; tax: number; students: number }[];
}

export interface AppSettings {
  homeState: string;
  defaultTaxRate: number;
  currencySymbol: string;
}

export interface AppState {
  // Data
  students: StudentRecord[];
  analytics: AnalyticsData | null;
  settings: AppSettings;
  
  // UI State
  isUploading: boolean;
  isProcessing: boolean;
  showAnalytics: boolean;
  showSettings: boolean;
  
  // Actions
  uploadData: (file: File) => Promise<void>;
  processData: () => Promise<void>;
  toggleAnalytics: () => void;
  toggleSettings: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  exportData: () => void;
  clearData: () => void;
}