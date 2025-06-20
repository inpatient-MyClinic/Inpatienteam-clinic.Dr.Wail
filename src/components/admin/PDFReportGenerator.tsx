
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PDFReportGenerator = () => {
  const { toast } = useToast();
  const [selectedSections, setSelectedSections] = useState({
    analytics: true,
    topCharts: true,
    statusDistribution: true,
    lossTree: true,
    userManagement: false,
    systemLogs: false
  });
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [isGenerating, setIsGenerating] = useState(false);

  const reportSections = [
    { key: 'analytics', label: 'Analytics Overview', description: 'Key metrics and performance indicators' },
    { key: 'topCharts', label: 'Top Charts', description: 'Top specialties, hospitals, and doctors' },
    { key: 'statusDistribution', label: 'Status Distribution', description: 'Request status breakdown with percentages' },
    { key: 'lossTree', label: 'Loss Tree Analysis', description: 'Delay analysis by causes and stages' },
    { key: 'userManagement', label: 'User Management', description: 'User statistics and role distribution' },
    { key: 'systemLogs', label: 'System Activity', description: 'Recent system activities and changes' }
  ];

  const handleSectionToggle = (sectionKey: string, checked: boolean) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionKey]: checked
    }));
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      const selectedCount = Object.values(selectedSections).filter(Boolean).length;
      
      // Create a mock download
      const element = document.createElement('a');
      element.href = 'data:application/pdf;base64,'; // Mock PDF data
      element.download = `admin-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      toast({
        title: "PDF Report Generated",
        description: `Report with ${selectedCount} sections generated successfully for ${reportPeriod} period.`
      });
      
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          Generate PDF Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Period */}
        <div className="space-y-2">
          <Label>Report Period</Label>
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Report Sections */}
        <div className="space-y-4">
          <Label>Include Sections</Label>
          <div className="grid grid-cols-1 gap-4">
            {reportSections.map((section) => (
              <div key={section.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={section.key}
                  checked={selectedSections[section.key]}
                  onCheckedChange={(checked) => 
                    handleSectionToggle(section.key, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <label 
                    htmlFor={section.key}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {section.label}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generatePDF} 
          disabled={isGenerating || Object.values(selectedSections).every(val => !val)}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate PDF Report
            </>
          )}
        </Button>

        {Object.values(selectedSections).every(val => !val) && (
          <p className="text-sm text-red-600 text-center">
            Please select at least one section to include in the report.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFReportGenerator;
