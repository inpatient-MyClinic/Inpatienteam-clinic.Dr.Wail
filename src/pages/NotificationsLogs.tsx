
import React, { useState } from "react";
import Footer from "@/components/Footer";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import AIAssistant from "@/components/admin/AIAssistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, FileText, Calendar, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const NotificationsLogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate month options
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  // Generate year options (last 3 years + current year + next year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => ({
    value: year.toString(),
    label: year.toString()
  }));

  const generateMonthlyPDF = async () => {
    if (!selectedMonth || !selectedYear) {
      toast({
        title: "Selection Required",
        description: "Please select both month and year to generate the report.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate PDF generation with comprehensive data
    setTimeout(() => {
      const monthName = months.find(m => m.value === selectedMonth)?.label;
      const fileName = `monthly-report-${monthName}-${selectedYear}.pdf`;
      
      // Create a mock download
      const element = document.createElement('a');
      element.href = 'data:application/pdf;base64,'; // Mock PDF data
      element.download = fileName;
      
      toast({
        title: "Monthly PDF Generated",
        description: `Comprehensive report for ${monthName} ${selectedYear} has been generated and downloaded.`,
      });
      
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
              alt="My Clinic Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant & Reports</h1>
              <p className="text-gray-600">AI-powered analysis, modifications, and comprehensive reporting</p>
            </div>
          </div>
          <div className="flex gap-2">
            <MessagingIcons currentUserRole="admin" />
            <Button 
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Assistant */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">AI Assistant</h2>
            </div>
            <AIAssistant />
          </div>

          {/* PDF Reports */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold">Monthly Reports</h2>
            </div>
            
            {/* Monthly PDF Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Generate Monthly PDF Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose month" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { value: "01", label: "January" },
                          { value: "02", label: "February" },
                          { value: "03", label: "March" },
                          { value: "04", label: "April" },
                          { value: "05", label: "May" },
                          { value: "06", label: "June" },
                          { value: "07", label: "July" },
                          { value: "08", label: "August" },
                          { value: "09", label: "September" },
                          { value: "10", label: "October" },
                          { value: "11", label: "November" },
                          { value: "12", label: "December" }
                        ].map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Report Contents Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Report Will Include:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>All requests data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Analytics & metrics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Overdue requests analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Status distributions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Top charts & performance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>System activity logs</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={async () => {
                    if (!selectedMonth || !selectedYear) {
                      toast({
                        title: "Selection Required",
                        description: "Please select both month and year to generate the report.",
                        variant: "destructive"
                      });
                      return;
                    }

                    setIsGenerating(true);
                    
                    // Simulate PDF generation with comprehensive data
                    setTimeout(() => {
                      const monthName = [
                        { value: "01", label: "January" },
                        { value: "02", label: "February" },
                        { value: "03", label: "March" },
                        { value: "04", label: "April" },
                        { value: "05", label: "May" },
                        { value: "06", label: "June" },
                        { value: "07", label: "July" },
                        { value: "08", label: "August" },
                        { value: "09", label: "September" },
                        { value: "10", label: "October" },
                        { value: "11", label: "November" },
                        { value: "12", label: "December" }
                      ].find(m => m.value === selectedMonth)?.label;
                      const fileName = `monthly-report-${monthName}-${selectedYear}.pdf`;
                      
                      // Create a mock download
                      const element = document.createElement('a');
                      element.href = 'data:application/pdf;base64,'; // Mock PDF data
                      element.download = fileName;
                      
                      toast({
                        title: "Monthly PDF Generated",
                        description: `Comprehensive report for ${monthName} ${selectedYear} has been generated and downloaded.`,
                      });
                      
                      setIsGenerating(false);
                    }, 3000);
                  }} 
                  disabled={isGenerating || !selectedMonth || !selectedYear}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Generating PDF Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Generate Monthly PDF Report
                    </>
                  )}
                </Button>

                {(!selectedMonth || !selectedYear) && (
                  <p className="text-sm text-red-600 text-center">
                    Please select both month and year to generate the report.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Recent Generated Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { month: "November 2024", date: "2024-12-01", size: "2.4 MB" },
                    { month: "October 2024", date: "2024-11-01", size: "2.1 MB" },
                    { month: "September 2024", date: "2024-10-01", size: "1.9 MB" }
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{report.month} Report</p>
                        <p className="text-sm text-gray-600">Generated on {report.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{report.size}</span>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotificationsLogs;
