import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Eye } from "lucide-react";
import * as XLSX from 'xlsx';

interface MasterSheetRow {
  // Patient Information
  "Patient Name": string;
  "Patient ID": string;
  "Patient Phone": string;
  "Patient Email": string;
  "Patient National ID": string;
  
  // Medical Information
  "Medical Condition": string;
  "Specialty": string;
  "Service Description": string;
  "Treating Doctor Name": string;
  "Type of Admission": string;
  
  // Hospital Information
  "Hospital Name": string;
  "Hospital File Number": string;
  "Branch": string;
  
  // Case Management (Column P - Status)
  "Status": string; // done, canceled/rejected, under process, scheduled, pending, planned NVD
  "Case Coordinator": string;
  "Case Manager": string;
  "Notes": string;
  
  // Insurance Information
  "Insurance Cash": string;
  "Insurance Number": string;
  "Approval Status": string;
  "Approval Number": string;
  
  // Financial Information
  "Paid Amount": string;
  "Currency": string;
  
  // Date Information (Column X - Date)
  "Date": string; // Date of surgery/month - used for monthly filtering
  "Date of File Opening": string;
  "Expected Surgery Date": string;
  "Agreed Booked Date": string;
  "Date of Order Submission": string;
  
  // Additional Fields
  "Category of Failure": string;
  "Reason of Pending Cancellation": string;
  "Email": string;
}

export default function MasterSheetDataProcessor() {
  const [isLoading, setIsLoading] = useState(false);
  const [processedData, setProcessedData] = useState<MasterSheetRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Function to convert Excel serial date to readable date
  const convertExcelDate = (excelDate: any): string => {
    if (!excelDate) return "";
    
    // If it's already a proper date string, return it
    if (typeof excelDate === 'string' && excelDate.includes('-')) {
      return excelDate;
    }
    
    // Convert Excel serial number to date
    if (typeof excelDate === 'number' || (typeof excelDate === 'string' && !isNaN(Number(excelDate)))) {
      const serialNumber = Number(excelDate);
      if (serialNumber > 25000) { // Valid Excel date range
        const date = new Date((serialNumber - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
      }
    }
    
    return excelDate?.toString() || "";
  };

  // Function to normalize status values
  const normalizeStatus = (status: string): string => {
    if (!status) return "pending";
    
    const statusLower = status.toLowerCase().trim();
    
    if (statusLower.includes('done') || statusLower.includes('completed')) return "done";
    if (statusLower.includes('cancel') || statusLower.includes('reject')) return "canceled/rejected";
    if (statusLower.includes('process') || statusLower.includes('progress')) return "under process";
    if (statusLower.includes('schedul')) return "scheduled";
    if (statusLower.includes('pending')) return "pending";
    if (statusLower.includes('nvd') || statusLower.includes('planned')) return "planned NVD";
    
    return status; // Return original if no match
  };

  const processExcelData = async () => {
    setIsLoading(true);
    try {
      // Fetch all Excel data
      const { data, error } = await supabase
        .from('excel_rows_raw')
        .select('*')
        .not('raw_data->Patient\'s Name:', 'is', null)
        .not('raw_data->Status of operation', 'is', null);

      if (error) throw error;

      const masterSheetData: MasterSheetRow[] = data.map((row) => {
        const rawData = row.raw_data || {};
        
        return {
          // Patient Information
          "Patient Name": rawData["Patient's Name:"] || "",
          "Patient ID": rawData["Patient's MRN:"] || "",
          "Patient Phone": rawData["Patient's Mobile No.:"] || "",
          "Patient Email": rawData["Email"] || "",
          "Patient National ID": rawData["Patient's National ID:"] || "",
          
          // Medical Information
          "Medical Condition": rawData["Medical Condition"] || "",
          "Specialty": rawData["Specialty"] || "",
          "Service Description": rawData["Service Description of referred service"] || "",
          "Treating Doctor Name": rawData["Treating Doctor's Name"] || "",
          "Type of Admission": rawData["Type of Admission"] || "",
          
          // Hospital Information
          "Hospital Name": rawData["Referred Hospital"] || "",
          "Hospital File Number": rawData["Hospital File Number"] || "",
          "Branch": rawData["My Clinic Branch"] || "",
          
          // Case Management (Column P - Status)
          "Status": normalizeStatus(rawData["Status of operation"] || ""),
          "Case Coordinator": rawData["Case coordinator"] || "",
          "Case Manager": rawData["Case coordinator"] || "", // Same as coordinator
          "Notes": rawData["Notes: if you want to add"] || "",
          
          // Insurance Information
          "Insurance Cash": rawData["Insurance/Cash"] || "",
          "Insurance Number": rawData["Insurance Number"] || "",
          "Approval Status": rawData["Approval Status"] || "",
          "Approval Number": rawData["Approval Number"] || "",
          
          // Financial Information
          "Paid Amount": rawData["Paid Amount"] || "",
          "Currency": rawData["Currency"] || "SAR",
          
          // Date Information (Column X - Date)
          "Date": convertExcelDate(rawData["Date of Request:"]), // Main date for monthly filtering
          "Date of File Opening": convertExcelDate(rawData["Date of File Opening"]),
          "Expected Surgery Date": convertExcelDate(rawData["Expected date of Surgery"]),
          "Agreed Booked Date": convertExcelDate(rawData["Agreed - Booked - OR date(mm/dd/yyyy)"]),
          "Date of Order Submission": convertExcelDate(rawData["Date of Order Submission"]),
          
          // Additional Fields
          "Category of Failure": rawData["Category of Failure"] || "",
          "Reason of Pending Cancellation": rawData["Reason of pending or cancellation"] || "",
          "Email": rawData["Email"] || ""
        };
      });

      setProcessedData(masterSheetData);
      setTotalRows(masterSheetData.length);
      
      toast.success(`Successfully processed ${masterSheetData.length} requests into master sheet format`);
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Failed to process Excel data');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMasterSheet = () => {
    if (processedData.length === 0) {
      toast.error('No data to download. Please process the data first.');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(processedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Sheet Data');
      
      // Auto-size columns
      const colWidths = Object.keys(processedData[0]).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      worksheet['!cols'] = colWidths;
      
      XLSX.writeFile(workbook, `master_sheet_data_${totalRows}_requests.xlsx`);
      toast.success('Master sheet downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download master sheet');
    }
  };

  useEffect(() => {
    // Auto-process on component mount
    processExcelData();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Master Sheet Data Processor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Process uploaded Excel data into standardized master sheet format
                </p>
                {totalRows > 0 && (
                  <Badge variant="secondary">
                    {totalRows} requests processed
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={processExcelData} 
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? "Processing..." : "Refresh Data"}
                </Button>
                <Button 
                  onClick={() => setShowPreview(!showPreview)} 
                  disabled={processedData.length === 0}
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? "Hide" : "Preview"}
                </Button>
                <Button 
                  onClick={downloadMasterSheet} 
                  disabled={processedData.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Master Sheet
                </Button>
              </div>
            </div>

            {/* Column Mapping Summary */}
            {totalRows > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalRows}</div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {processedData.filter(row => row.Status === "done").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {processedData.filter(row => row.Status === "pending").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {processedData.filter(row => row.Status === "canceled/rejected").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Canceled/Rejected</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      {showPreview && processedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview (First 10 rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 p-2 text-left">Patient Name</th>
                    <th className="border border-gray-300 p-2 text-left">Status (Column P)</th>
                    <th className="border border-gray-300 p-2 text-left">Date (Column X)</th>
                    <th className="border border-gray-300 p-2 text-left">Hospital</th>
                    <th className="border border-gray-300 p-2 text-left">Branch</th>
                    <th className="border border-gray-300 p-2 text-left">Specialty</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.slice(0, 10).map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 p-2">{row["Patient Name"]}</td>
                      <td className="border border-gray-300 p-2">
                        <Badge variant={
                          row.Status === "done" ? "default" :
                          row.Status === "canceled/rejected" ? "destructive" :
                          row.Status === "pending" ? "secondary" : "outline"
                        }>
                          {row.Status}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 p-2">{row.Date}</td>
                      <td className="border border-gray-300 p-2">{row["Hospital Name"]}</td>
                      <td className="border border-gray-300 p-2">{row.Branch}</td>
                      <td className="border border-gray-300 p-2">{row.Specialty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}