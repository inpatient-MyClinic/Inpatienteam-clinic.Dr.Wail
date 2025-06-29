
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Folder, Calendar, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for filtering
const mockCaseData = [
  { id: "C001", specialty: "Cardiology", doctor: "Dr. Ahmed Salem", hospital: "King Abdulaziz Hospital", month: "June", week: "Week 2", status: "Completed", date: "2025-06-15" },
  { id: "C002", specialty: "Orthopedics", doctor: "Dr. Sara Ali", hospital: "Prince Sultan Hospital", month: "June", week: "Week 3", status: "Completed", date: "2025-06-20" },
  { id: "C003", specialty: "Cardiology", doctor: "Dr. Ahmed Salem", hospital: "Medical Center", month: "May", week: "Week 4", status: "Completed", date: "2025-05-28" },
  { id: "C004", specialty: "Gastroenterology", doctor: "Dr. Khalid Hassan", hospital: "King Abdulaziz Hospital", month: "June", week: "Week 1", status: "Completed", date: "2025-06-05" },
  { id: "C005", specialty: "Orthopedics", doctor: "Dr. Sara Ali", hospital: "Prince Sultan Hospital", month: "May", week: "Week 3", status: "Completed", date: "2025-05-21" },
];

const specialties = ["Cardiology", "Orthopedics", "Gastroenterology", "Neurology", "Urology"];
const doctors = ["Dr. Ahmed Salem", "Dr. Sara Ali", "Dr. Khalid Hassan", "Dr. Fatima Al-Zahra", "Dr. Omar Mansour"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];

const AdminGeneralReport = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  
  // Filter states
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
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
        description: `${files.length} files uploaded for ${monthOptions.find(m => m.value === selectedMonth)?.label}`,
      });
    }
  };

  const handleFilterToggle = (filterArray: string[], value: string, setFilter: (arr: string[]) => void) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(item => item !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const removeFilter = (filterArray: string[], value: string, setFilter: (arr: string[]) => void) => {
    setFilter(filterArray.filter(item => item !== value));
  };

  const clearAllFilters = () => {
    setSelectedSpecialties([]);
    setSelectedDoctors([]);  
    setSelectedMonths([]);
    setSelectedWeeks([]);
  };

  const applyFilters = () => {
    setShowResults(true);
    toast({
      title: "Filters Applied",
      description: `Showing results for selected criteria`,
    });
  };

  // Filter the mock data based on selected filters
  const filteredCases = mockCaseData.filter(caseItem => {
    const matchesSpecialty = selectedSpecialties.length === 0 || selectedSpecialties.includes(caseItem.specialty);
    const matchesDoctor = selectedDoctors.length === 0 || selectedDoctors.includes(caseItem.doctor);
    const matchesMonth = selectedMonths.length === 0 || selectedMonths.includes(caseItem.month);
    const matchesWeek = selectedWeeks.length === 0 || selectedWeeks.includes(caseItem.week);
    
    return matchesSpecialty && matchesDoctor && matchesMonth && matchesWeek;
  });

  // Group results by hospital
  const hospitalStats = filteredCases.reduce((acc, caseItem) => {
    if (!acc[caseItem.hospital]) {
      acc[caseItem.hospital] = [];
    }
    acc[caseItem.hospital].push(caseItem);
    return acc;
  }, {} as Record<string, typeof mockCaseData>);

  const generateReport = () => {
    toast({
      title: "Generating Report",
      description: `Creating comprehensive report with ${filteredCases.length} filtered cases`,
    });
    
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: "Your filtered report is ready for download",
      });
    }, 2000);
  };

  const downloadReport = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,Filtered Report Content');
    element.setAttribute('download', `filtered-report-${new Date().toISOString().split('T')[0]}.pdf`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download Started",
      description: "Your filtered report is being downloaded",
    });
  };

  const getFilesForMonth = (month: string) => {
    return uploadedFiles[month] || [];
  };

  const hasActiveFilters = selectedSpecialties.length > 0 || selectedDoctors.length > 0 || selectedMonths.length > 0 || selectedWeeks.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          General Reports
        </CardTitle>
        <CardDescription>
          Generate comprehensive reports with advanced filtering options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Report Filters</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Filter by Specialty</label>
                <div className="flex flex-wrap gap-2">
                  {specialties.map(specialty => (
                    <Badge
                      key={specialty}
                      variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle(selectedSpecialties, specialty, setSelectedSpecialties)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Doctor Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Filter by Doctor</label>
                <div className="flex flex-wrap gap-2">
                  {doctors.map(doctor => (
                    <Badge
                      key={doctor}
                      variant={selectedDoctors.includes(doctor) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle(selectedDoctors, doctor, setSelectedDoctors)}
                    >
                      {doctor}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Filter by Months</label>
                <div className="flex flex-wrap gap-2">
                  {months.map(month => (
                    <Badge
                      key={month}
                      variant={selectedMonths.includes(month) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle(selectedMonths, month, setSelectedMonths)}
                    >
                      {month}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Week Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Filter by Weeks</label>
                <div className="flex flex-wrap gap-2">
                  {weeks.map(week => (
                    <Badge
                      key={week}
                      variant={selectedWeeks.includes(week) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle(selectedWeeks, week, setSelectedWeeks)}
                    >
                      {week}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-2">
                <Button onClick={applyFilters} size="sm">
                  Apply Filters
                </Button>
                {hasActiveFilters && (
                  <Button onClick={clearAllFilters} variant="outline" size="sm">
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedSpecialties.map(specialty => (
                <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                  Specialty: {specialty}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter(selectedSpecialties, specialty, setSelectedSpecialties)} />
                </Badge>
              ))}
              {selectedDoctors.map(doctor => (
                <Badge key={doctor} variant="secondary" className="flex items-center gap-1">
                  Doctor: {doctor}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter(selectedDoctors, doctor, setSelectedDoctors)} />
                </Badge>
              ))}
              {selectedMonths.map(month => (
                <Badge key={month} variant="secondary" className="flex items-center gap-1">
                  Month: {month}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter(selectedMonths, month, setSelectedMonths)} />
                </Badge>
              ))}
              {selectedWeeks.map(week => (
                <Badge key={week} variant="secondary" className="flex items-center gap-1">
                  Week: {week}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter(selectedWeeks, week, setSelectedWeeks)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Filter Results */}
        {showResults && (
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
            <h4 className="text-sm font-medium">Filter Results ({filteredCases.length} cases found)</h4>
            
            {Object.keys(hospitalStats).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(hospitalStats).map(([hospital, cases]) => (
                  <div key={hospital} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">{hospital}</h5>
                      <Badge variant="outline">{cases.length} cases</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Specialties: {[...new Set(cases.map(c => c.specialty))].join(', ')}</div>
                      <div>Doctors: {[...new Set(cases.map(c => c.doctor))].join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No cases found matching the selected criteria.</p>
            )}
          </div>
        )}

        {/* Month Selection for File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Month for Documents</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(month => (
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
                    Upload documents for {monthOptions.find(m => m.value === selectedMonth)?.label}
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
                {monthOptions.find(m => m.value === selectedMonth)?.label} ({getFilesForMonth(selectedMonth).length} files)
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
            {hasActiveFilters && ` Currently showing ${filteredCases.length} filtered cases.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminGeneralReport;
