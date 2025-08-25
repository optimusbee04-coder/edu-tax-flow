import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheckCircle } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '../store/useStore';

export const FileUpload = () => {
  const { uploadData, isUploading, students } = useStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadData(acceptedFiles[0]);
    }
  }, [uploadData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  if (students.length > 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 text-success">
              <FiCheckCircle className="h-5 w-5" />
              <span className="font-medium">
                {students.length} student records processed
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-input')?.click()}
              className="transition-smooth hover:border-primary hover:text-primary"
            >
              <FiUpload className="h-4 w-4 mr-2" />
              Upload New File
            </Button>
          </div>
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                uploadData(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated hover:glow-effect transition-smooth">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-smooth
            ${isDragActive 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-muted hover:border-primary hover:bg-primary/5'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`
              p-4 rounded-full transition-smooth
              ${isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'}
            `}>
              {isUploading ? (
                <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiFile className="h-8 w-8" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isUploading ? 'Processing...' : 'Upload Student Data'}
              </h3>
              <p className="text-muted-foreground">
                {isDragActive
                  ? 'Drop your Excel file here'
                  : 'Drag & drop your .xlsx file here, or click to select'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Required columns: Reg No, coursecode, branchcode, year, semester, date, amount, totalPaid, pmode
              </p>
            </div>
            
            {!isUploading && (
              <Button 
                variant="outline" 
                className="transition-bounce hover:scale-105"
              >
                <FiUpload className="h-4 w-4 mr-2" />
                Select File
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};