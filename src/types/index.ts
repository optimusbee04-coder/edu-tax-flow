export interface StudentRecord {
  id: string;
  regNo: string;
  coursecode: string;
  branchcode: string;
  year: number;
  semester: number;
  date: string;
  openBalance: number;
  regfee: number;
  cda: number;
  insurance: number;
  amount: number;
  examfee: number;
  cancelled: string;
  recno: string;
  chno: string;
  totalPaid: number;
  pmode: string;
  calculatedTax: number;
  netAmount: number;
  processed: boolean;
}

export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
}

export interface AnalyticsData {
  totalAmount: number;
  totalTax: number;
  totalFees: number;
  avgTax: number;
  totalStudents: number;
  feesByMonth: { month: string; fees: number; tax: number }[];
  feesByCourse: { course: string; fees: number; students: number }[];
  feesByPaymentMode: { pmode: string; amount: number; count: number }[];
  feesByBranch: { branch: string; fees: number; students: number }[];
}

export interface AppSettings {
  instituteName: string;
  defaultTaxRate: number;
  currencySymbol: string;
  academicYear: string;
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