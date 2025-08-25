import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { toast } from 'sonner';
import { AppState, StudentRecord, TaxSlab, AnalyticsData } from '../types';

// Validation schema for the actual database structure
const studentSchema = z.object({
  regNo: z.string().min(1, 'Registration number is required'),
  coursecode: z.string().min(1, 'Course code is required'),
  branchcode: z.string().min(1, 'Branch code is required'),
  year: z.number().min(1, 'Year must be positive'),
  semester: z.number().min(1, 'Semester must be positive'),
  date: z.string().min(1, 'Date is required'),
  openBalance: z.number().min(0, 'Open balance must be non-negative').default(0),
  regfee: z.number().min(0, 'Registration fee must be non-negative').default(0),
  cda: z.number().min(0, 'CDA must be non-negative').default(0),
  insurance: z.number().min(0, 'Insurance must be non-negative').default(0),
  amount: z.number().min(0, 'Amount must be non-negative'),
  examfee: z.number().min(0, 'Exam fee must be non-negative').default(0),
  cancelled: z.string().default('N'),
  recno: z.string().min(1, 'Receipt number is required'),
  chno: z.string().min(1, 'Cheque/Reference number is required'),
  totalPaid: z.number().min(0, 'Total paid must be non-negative'),
  pmode: z.string().min(1, 'Payment mode is required'),
});

// Tax calculation slabs
const taxSlabs: TaxSlab[] = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400001, max: 800000, rate: 0.05 },
  { min: 800001, max: 1200000, rate: 0.10 },
  { min: 1200001, max: 1600000, rate: 0.15 },
  { min: 1600001, max: 2000000, rate: 0.20 },
  { min: 2000001, max: 2400000, rate: 0.25 },
  { min: 2400001, max: Infinity, rate: 0.30 },
];

const calculateTax = (totalAmount: number): number => {
  let tax = 0;
  for (const slab of taxSlabs) {
    if (totalAmount > slab.min) {
      const taxableAmount = Math.min(totalAmount, slab.max) - slab.min + 1;
      tax += taxableAmount * slab.rate;
    }
  }
  return tax;
};

const generateAnalytics = (students: StudentRecord[]): AnalyticsData => {
  const totalAmount = students.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalTax = students.reduce((sum, s) => sum + s.calculatedTax, 0);
  const totalFees = students.reduce((sum, s) => sum + s.regfee + s.examfee + s.cda + s.insurance, 0);
  
  // Group by course
  const courseGroups = students.reduce((acc, student) => {
    if (!acc[student.coursecode]) {
      acc[student.coursecode] = { fees: 0, students: 0 };
    }
    acc[student.coursecode].fees += student.totalPaid;
    acc[student.coursecode].students += 1;
    return acc;
  }, {} as Record<string, { fees: number; students: number }>);

  // Group by branch
  const branchGroups = students.reduce((acc, student) => {
    if (!acc[student.branchcode]) {
      acc[student.branchcode] = { fees: 0, students: 0 };
    }
    acc[student.branchcode].fees += student.totalPaid;
    acc[student.branchcode].students += 1;
    return acc;
  }, {} as Record<string, { fees: number; students: number }>);

  // Group by payment mode
  const pmodeGroups = students.reduce((acc, student) => {
    if (!acc[student.pmode]) {
      acc[student.pmode] = { amount: 0, count: 0 };
    }
    acc[student.pmode].amount += student.totalPaid;
    acc[student.pmode].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  // Mock monthly data (in real app, this would be based on actual dates)
  const feesByMonth = [
    { month: 'Jan', fees: totalAmount * 0.1, tax: totalTax * 0.1 },
    { month: 'Feb', fees: totalAmount * 0.15, tax: totalTax * 0.15 },
    { month: 'Mar', fees: totalAmount * 0.2, tax: totalTax * 0.2 },
    { month: 'Apr', fees: totalAmount * 0.25, tax: totalTax * 0.25 },
    { month: 'May', fees: totalAmount * 0.2, tax: totalTax * 0.2 },
    { month: 'Jun', fees: totalAmount * 0.1, tax: totalTax * 0.1 },
  ];

  return {
    totalAmount,
    totalTax,
    totalFees,
    avgTax: totalTax / students.length || 0,
    totalStudents: students.length,
    feesByMonth,
    feesByCourse: Object.entries(courseGroups).map(([course, data]) => ({
      course,
      ...data,
    })),
    feesByPaymentMode: Object.entries(pmodeGroups).map(([pmode, data]) => ({
      pmode,
      ...data,
    })),
    feesByBranch: Object.entries(branchGroups).map(([branch, data]) => ({
      branch,
      ...data,
    })),
  };
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      students: [],
      analytics: null,
      settings: {
        instituteName: 'Student Institute',
        defaultTaxRate: 0.1,
        currencySymbol: '₹',
        academicYear: '2024-25',
      },
      isUploading: false,
      isProcessing: false,
      showAnalytics: false,
      showSettings: false,

      // Actions
      uploadData: async (file: File) => {
        set({ isUploading: true });
        
        try {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const validatedStudents: StudentRecord[] = [];
          const errors: string[] = [];

          jsonData.forEach((row: any, index) => {
            try {
              const validated = studentSchema.parse({
                regNo: String(row['Reg No'] || row.regNo || ''),
                coursecode: String(row.coursecode || row.courseCode || ''),
                branchcode: String(row.branchcode || row.branchCode || ''),
                year: Number(row.year || 0),
                semester: Number(row.semester || 0),
                date: String(row.date || ''),
                openBalance: Number(row['open balance'] || row.openBalance || 0),
                regfee: Number(row.regfee || 0),
                cda: Number(row.cda || 0),
                insurance: Number(row.insurance || 0),
                amount: Number(row.amount || 0),
                examfee: Number(row.examfee || 0),
                cancelled: String(row.cancelled || 'N'),
                recno: String(row.recno || ''),
                chno: String(row.chno || ''),
                totalPaid: Number(row['Total paid'] || row.totalPaid || 0),
                pmode: String(row.pmode || ''),
              });

              const calculatedTax = calculateTax(validated.totalPaid);

              validatedStudents.push({
                id: `student-${Date.now()}-${index}`,
                ...validated,
                calculatedTax,
                netAmount: validated.totalPaid - calculatedTax,
                processed: true,
              });
            } catch (error) {
              errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Invalid data'}`);
            }
          });

          if (errors.length > 0) {
            toast.error(`${errors.length} rows had validation errors`);
            console.error('Validation errors:', errors);
          }

          set({ 
            students: validatedStudents,
            analytics: generateAnalytics(validatedStudents),
          });

          toast.success(`Successfully processed ${validatedStudents.length} student records`);
        } catch (error) {
          toast.error('Failed to process file');
          console.error('Upload error:', error);
        } finally {
          set({ isUploading: false });
        }
      },

      processData: async () => {
        set({ isProcessing: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { students } = get();
        set({ 
          analytics: generateAnalytics(students),
          isProcessing: false 
        });
        
        toast.success('Data processed successfully');
      },

      toggleAnalytics: () => set(state => ({ showAnalytics: !state.showAnalytics })),
      toggleSettings: () => set(state => ({ showSettings: !state.showSettings })),
      
      updateSettings: (newSettings) => set(state => ({
        settings: { ...state.settings, ...newSettings }
      })),

      exportData: () => {
        const { students } = get();
        const worksheet = XLSX.utils.json_to_sheet(students);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Processed Data');
        XLSX.writeFile(workbook, 'student_tax_data.xlsx');
        toast.success('Data exported successfully');
      },

      clearData: () => set({
        students: [],
        analytics: null,
      }),
    }),
    {
      name: 'student-tax-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        students: state.students, 
        settings: state.settings 
      }),
    }
  )
);