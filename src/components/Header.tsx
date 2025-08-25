import { FiSettings, FiBarChart, FiDownload } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useStore } from '../store/useStore';

export const Header = () => {
  const { toggleAnalytics, toggleSettings, exportData, showAnalytics, students } = useStore();

  return (
    <header className="border-b border-card-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold gradient-text">
                TaxCalc Pro
              </h1>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-muted-foreground">
                Student Fees + Income Tax Calculator & Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAnalytics}
              className={`transition-smooth ${
                showAnalytics 
                  ? 'bg-primary/10 text-primary border-primary/20' 
                  : 'hover:bg-muted'
              }`}
            >
              <FiBarChart className="h-4 w-4 mr-2" />
              Analytics
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={exportData}
              disabled={students.length === 0}
              className="hover:bg-success/10 hover:text-success transition-smooth"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSettings}
              className="hover:bg-muted transition-smooth"
            >
              <FiSettings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};