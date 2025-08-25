import { Toaster } from 'sonner';
import { Header } from '../components/Header';
import { FileUpload } from '../components/FileUpload';
import { DataTable } from '../components/DataTable';
import { Analytics } from '../components/Analytics';
import { SettingsModal } from '../components/SettingsModal';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-12">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="gradient-text">TaxCalc Pro</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive student fee management and tax calculation system.
              Upload your fee records, automatically calculate taxes, and analyze financial data with beautiful visualizations.
            </p>
          </div>

          {/* File Upload */}
          <FileUpload />

          {/* Analytics Dashboard */}
          <Analytics />

          {/* Data Table */}
          <DataTable />
        </div>
      </main>

      {/* Modals */}
      <SettingsModal />
      
      {/* Toast Notifications */}
      <Toaster 
        theme="dark"
        position="bottom-right"
        richColors
        expand={false}
        closeButton
      />
    </div>
  );
};

export default Index;
