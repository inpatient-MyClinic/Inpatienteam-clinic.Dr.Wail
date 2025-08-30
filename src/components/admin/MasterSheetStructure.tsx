import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ColumnMapping {
  columnName: string;
  dataType: string;
  required: boolean;
  description: string;
  exampleValue: string;
  category: string;
}

export default function MasterSheetStructure() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const masterColumns: ColumnMapping[] = [
    // Patient Information
    { columnName: "Patient Name", dataType: "text", required: true, description: "Full name of the patient", exampleValue: "Ahmed Mohammed Al-Rashid", category: "Patient Info" },
    { columnName: "Patient ID", dataType: "text", required: false, description: "Patient MRN or unique identifier", exampleValue: "MRN001234", category: "Patient Info" },
    { columnName: "Patient Mobile", dataType: "text", required: false, description: "Patient mobile phone number", exampleValue: "966501234567", category: "Patient Info" },
    { columnName: "Patient National ID", dataType: "text", required: false, description: "Patient national ID number", exampleValue: "1234567890", category: "Patient Info" },
    { columnName: "Email", dataType: "text", required: false, description: "Patient email address", exampleValue: "patient@example.com", category: "Patient Info" },
    
    // Medical Information
    { columnName: "Medical Condition", dataType: "text", required: true, description: "Primary medical condition or diagnosis", exampleValue: "Coronary Artery Disease", category: "Medical Info" },
    { columnName: "Specialty", dataType: "text", required: true, description: "Medical specialty required", exampleValue: "Cardiology", category: "Medical Info" },
    { columnName: "Service Description", dataType: "text", required: false, description: "Description of the medical service required", exampleValue: "Cardiac Catheterization", category: "Medical Info" },
    { columnName: "Treating Doctor Name", dataType: "text", required: false, description: "Name of the treating doctor", exampleValue: "Dr. Ahmed Al-Rashid", category: "Medical Info" },
    { columnName: "Type of Admission", dataType: "text", required: false, description: "Type of hospital admission", exampleValue: "Inpatient", category: "Medical Info" },
    
    // Hospital Information
    { columnName: "Hospital Name", dataType: "text", required: true, description: "Name of the hospital", exampleValue: "King Abdulaziz Hospital", category: "Hospital Info" },
    { columnName: "Hospital File Number", dataType: "text", required: false, description: "Hospital internal file number", exampleValue: "HFN123456", category: "Hospital Info" },
    { columnName: "Branch", dataType: "text", required: false, description: "My Clinic branch", exampleValue: "MCJ1", category: "Hospital Info" },
    
    // Case Management
    { columnName: "Case Coordinator", dataType: "text", required: false, description: "Assigned case coordinator", exampleValue: "Sarah Al-Mahmoud", category: "Case Management" },
    { columnName: "Case Manager", dataType: "text", required: false, description: "Case manager (same as coordinator)", exampleValue: "Sarah Al-Mahmoud", category: "Case Management" },
    { columnName: "Status", dataType: "text", required: true, description: "Status of operation (Column P): done, canceled/rejected, under process, scheduled, pending, planned NVD", exampleValue: "done", category: "Case Management" },
    { columnName: "Notes", dataType: "text", required: false, description: "Additional notes or comments", exampleValue: "Patient requires special care", category: "Case Management" },
    
    // Insurance Information
    { columnName: "Insurance Cash", dataType: "text", required: false, description: "Insurance type or payment method", exampleValue: "BUPA Arabia", category: "Insurance" },
    { columnName: "Insurance Number", dataType: "text", required: false, description: "Insurance policy number", exampleValue: "POL123456", category: "Insurance" },
    { columnName: "Approval Status", dataType: "text", required: false, description: "Insurance approval status", exampleValue: "Approved", category: "Insurance" },
    { columnName: "Approval Number", dataType: "text", required: false, description: "Insurance approval number", exampleValue: "APP789012", category: "Insurance" },
    
    // Financial Information
    { columnName: "Paid Amount", dataType: "text", required: false, description: "Amount paid for the service", exampleValue: "15000", category: "Financial" },
    { columnName: "Currency", dataType: "text", required: false, description: "Currency of the paid amount", exampleValue: "SAR", category: "Financial" },
    
    // Date Information
    { columnName: "Date", dataType: "text", required: true, description: "Date of surgery/month (Column X) - used for monthly filtering", exampleValue: "2024-01-15", category: "Dates" },
    { columnName: "Date of File Opening", dataType: "text", required: false, description: "Date when file was opened", exampleValue: "2024-01-10", category: "Dates" },
    { columnName: "Expected Surgery Date", dataType: "text", required: false, description: "Expected date of surgery", exampleValue: "2024-01-20", category: "Dates" },
    { columnName: "Agreed Booked Date", dataType: "text", required: false, description: "Agreed booking date", exampleValue: "2024-01-18", category: "Dates" },
    { columnName: "Date of Order Submission", dataType: "text", required: false, description: "Date when order was submitted", exampleValue: "2024-01-12", category: "Dates" },
    
    // Additional Information
    { columnName: "Category of Failure", dataType: "text", required: false, description: "Category if request failed", exampleValue: "Insurance Rejection", category: "Additional" },
    { columnName: "Reason of Pending Cancellation", dataType: "text", required: false, description: "Reason for pending or cancellation", exampleValue: "Patient unavailable", category: "Additional" },
  ];

  const categories = ["all", ...Array.from(new Set(masterColumns.map(col => col.category)))];

  const filteredColumns = selectedCategory === "all" 
    ? masterColumns 
    : masterColumns.filter(col => col.category === selectedCategory);

  const downloadMasterTemplate = () => {
    const templateData = [
      masterColumns.reduce((acc, col) => {
        acc[col.columnName] = col.exampleValue;
        return acc;
      }, {} as Record<string, string>)
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master Template");
    XLSX.writeFile(wb, "master_template.xlsx");
    
    toast({
      title: "Master Template Downloaded",
      description: "Master Excel template with all columns has been downloaded.",
    });
  };

  const downloadColumnMapping = () => {
    const mappingData = masterColumns.map(col => ({
      "Column Name": col.columnName,
      "Data Type": col.dataType,
      "Required": col.required ? "Yes" : "No",
      "Category": col.category,
      "Description": col.description,
      "Example Value": col.exampleValue
    }));

    const ws = XLSX.utils.json_to_sheet(mappingData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Column Mapping");
    XLSX.writeFile(wb, "column_mapping_reference.xlsx");
    
    toast({
      title: "Column Mapping Downloaded",
      description: "Column mapping reference has been downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Master Sheet Column Structure</CardTitle>
          <CardDescription>
            This is the complete structure of our master Excel sheet. You can map your Excel columns to these fields.
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Button onClick={downloadMasterTemplate} variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Master Template
            </Button>
            <Button onClick={downloadColumnMapping} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Column Reference
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "All Categories" : category}
                </Button>
              ))}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Example Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColumns.map((column, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{column.columnName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{column.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={column.required ? "destructive" : "outline"}>
                      {column.required ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>{column.dataType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {column.description}
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {column.exampleValue}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Download the master template to see the exact format we expect</li>
              <li>Share your Excel file column structure with me</li>
              <li>I'll create a mapping between your columns and our master columns</li>
              <li>We'll update the system to handle your specific column names</li>
              <li>Test the upload with your data format</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}