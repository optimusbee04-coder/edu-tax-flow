import { useState } from 'react';
import { FiX, FiRefreshCw } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

export const SettingsModal = () => {
  const { showSettings, toggleSettings, settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('Settings saved successfully');
    toggleSettings();
  };

  const handleReset = () => {
    const defaultSettings = {
      instituteName: 'Student Institute',
      defaultTaxRate: 0.1,
      currencySymbol: '₹',
      academicYear: '2024-25',
    };
    setLocalSettings(defaultSettings);
    updateSettings(defaultSettings);
    toast.success('Settings reset to defaults');
  };

  return (
    <Dialog open={showSettings} onOpenChange={toggleSettings}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="gradient-text">Application Settings</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSettings}
              className="h-6 w-6 p-0"
            >
              <FiX className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="card-elevated">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-sm font-semibold text-card-foreground">
                General Settings
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="instituteName" className="text-sm">
                  Institute Name
                </Label>
                <Input
                  id="instituteName"
                  value={localSettings.instituteName}
                  onChange={(e) =>
                    setLocalSettings(prev => ({ ...prev, instituteName: e.target.value }))
                  }
                  placeholder="Enter institute name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear" className="text-sm">
                  Academic Year
                </Label>
                <Input
                  id="academicYear"
                  value={localSettings.academicYear}
                  onChange={(e) =>
                    setLocalSettings(prev => ({ ...prev, academicYear: e.target.value }))
                  }
                  placeholder="2024-25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencySymbol" className="text-sm">
                  Currency Symbol
                </Label>
                <Input
                  id="currencySymbol"
                  value={localSettings.currencySymbol}
                  onChange={(e) =>
                    setLocalSettings(prev => ({ ...prev, currencySymbol: e.target.value }))
                  }
                  placeholder="₹"
                  className="w-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTaxRate" className="text-sm">
                  Default Tax Rate (%)
                </Label>
                <Input
                  id="defaultTaxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={localSettings.defaultTaxRate * 100}
                  onChange={(e) =>
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      defaultTaxRate: parseFloat(e.target.value) / 100 
                    }))
                  }
                  placeholder="10"
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="text-warning hover:bg-warning/10 hover:border-warning transition-smooth"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={toggleSettings}
                className="transition-smooth"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 transition-smooth"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};