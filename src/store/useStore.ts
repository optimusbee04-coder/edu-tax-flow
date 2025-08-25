import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { toast } from 'sonner';
import { AppState, StudentRecord, TaxSlab, AnalyticsData } from '../types';

// Validation schema
const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  state: z.string().min(1, 'State is required'),
  course: z.string().min(1, 'Course is required'),
  bankIncome: z.number().min(0, 'Bank income must be positive'),
  otherIncome: z.number().optional().default(0),
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

const calculateTax = (income: number): number => {
  let tax = 0;
  for (const slab of taxSlabs) {
    if (income > slab.min) {
      const taxableAmount = Math.min(income, slab.max) - slab.min + 1;
      tax += taxableAmount * slab.rate;
    }
  }
  return tax;
};

const generateAnalytics = (students: StudentRecord[]): AnalyticsData => {
  const totalIncome = students.reduce((sum, s) => sum + s.totalIncome, 0);
  const totalTax = students.reduce((sum, s) => sum + s.calculatedTax, 0);
  
  // Group by course
  const courseGroups = students.reduce((acc, student) => {
    if (!acc[student.course]) {
      acc[student.course] = { income: 0, students: 0 };
    }
    acc[student.course].income += student.totalIncome;
    acc[student.course].students += 1;
    return acc;
  }, {} as Record<string, { income: number; students: number }>);

  // Group by state
  const stateGroups = students.reduce((acc, student) => {
    if (!acc[student.state]) {
      acc[student.state] = { income: 0, tax: 0, students: 0 };
    }
    acc[student.state].income += student.totalIncome;
    acc[student.state].tax += student.calculatedTax;
    acc[student.state].students += 1;
    return acc;
  }, {} as Record<string, { income: number; tax: number; students: number }>);

  // Mock monthly data (in real app, this would be based on dates)
  const incomeByMonth = [
    { month: 'Jan', income: totalIncome * 0.1, tax: totalTax * 0.1 },
    { month: 'Feb', income: totalIncome * 0.15, tax: totalTax * 0.15 },
    { month: 'Mar', income: totalIncome * 0.2, tax: totalTax * 0.2 },
    { month: 'Apr', income: totalIncome * 0.25, tax: totalTax * 0.25 },
    { month: 'May', income: totalIncome * 0.2, tax: totalTax * 0.2 },
    { month: 'Jun', income: totalIncome * 0.1, tax: totalTax * 0.1 },
  ];

  return {
    totalIncome,
    totalTax,
    avgTax: totalTax / students.length || 0,
    totalStudents: students.length,
    incomeByMonth,
    incomeByCourse: Object.entries(courseGroups).map(([course, data]) => ({
      course,
      ...data,
    })),
    incomeByState: Object.entries(stateGroups).map(([state, data]) => ({
      state,
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
        homeState: 'Delhi',
        defaultTaxRate: 0.1,
        currencySymbol: '₹',
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
                name: row.Name || row.name,
                email: row.Email || row.email,
                state: row.State || row.state,
                course: row.Course || row.course,
                bankIncome: Number(row['Bank Income'] || row.bankIncome || 0),
                otherIncome: Number(row['Other Income'] || row.otherIncome || 0),
              });

              const totalIncome = validated.bankIncome + (validated.otherIncome || 0);
              const calculatedTax = calculateTax(totalIncome);

              validatedStudents.push({
                id: `student-${Date.now()}-${index}`,
                ...validated,
                totalIncome,
                calculatedTax,
                netIncome: totalIncome - calculatedTax,
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