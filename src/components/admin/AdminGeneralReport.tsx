
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, Download, Folder, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminGeneralReport = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return {
      value: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(prev => ({
        ...prev,
        [selectedMonth]: [...(prev[selectedMonth] || []), ...files]
      }));
      
      toast({
        title: "Files Uploaded",
        description: `${files.length} files uploaded for ${months.find(m => m.value === selectedMonth)?.label}`,
      });
    }
  };

  const generateReport = () => {
    toast({
      title: "Generating Report",
      description: `Creating comprehensive report for ${months.find(m => m.value === selectedMonth)?.label}`,
    });
    
    // Mock report generation
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: "Your monthly report is ready for download",
      });
    }, 2000);
  };

  const downloadReport = () => {
    // Mock download functionality
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,Monthly Report Content');
    element.setAttribute('download', `monthly-report-${selectedMonth}.pdf`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download Started",
      description: "Your report is being downloaded",
    });
  };

  const getFilesForMonth = (month: string) => {
    return uploadedFiles[month] || [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          General Reports
        </CardTitle>
        <CardDescription>
          Generate comprehensive monthly reports with document management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Upload Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Monthly Documents</label>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Documents</DialogTitle>
                  <DialogDescription>
                    Upload documents for {months.find(m => m.value === selectedMonth)?.label}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Button onClick={() => setIsUploadOpen(false)} className="w-full">
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Files Display */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">
                {months.find(m => m.value === selectedMonth)?.label} ({getFilesForMonth(selectedMonth).length} files)
              </span>
            </div>
            
            {getFilesForMonth(selectedMonth).length > 0 ? (
              <ScrollArea className="h-24">
                <div className="space-y-1">
                  {getFilesForMonth(selectedMonth).map((file, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      {file.name}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-gray-500">No files uploaded for this month</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={generateReport} className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            Reports include: Request analytics, team performance, hospital metrics, financial summaries, and uploaded documents.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminGeneralReport;
