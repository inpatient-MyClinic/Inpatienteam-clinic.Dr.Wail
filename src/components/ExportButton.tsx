
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface Request {
  id: number;
  patientName: string;
  mrn: string;
  serviceDescription: string;
  hospital: string;
  status: string;
  paymentStatus?: string; // Made optional for nurse requests
  assignedDoctor: string;
  createdAt: string;
  expectedSurgeryDate?: string;
  phone?: string; // Added for nurse requests
}

interface ExportButtonProps {
  requests: Request[];
  filteredRequests: Request[];
  hasActiveFilters: boolean;
}

const ExportButton = ({ requests, filteredRequests, hasActiveFilters }: ExportButtonProps) => {
  const exportToExcel = () => {
    // Use filtered data if filters are active, otherwise use all data
    const dataToExport = hasActiveFilters ? filteredRequests : requests;
    
    // Prepare data for Excel export
    const excelData = dataToExport.map(req => {
      const baseData = {
        'Patient Name': req.patientName,
        'MRN': req.mrn,
        'Service Description': req.serviceDescription,
        'Hospital': req.hospital,
        'Expected Surgery Date': req.expectedSurgeryDate ? 
          new Date(req.expectedSurgeryDate).toLocaleDateString() : 
          'Not set',
        'Status': req.status,
        'Assigned Doctor': req.assignedDoctor,
        'Created Date': new Date(req.createdAt).toLocaleDateString()
      };

      // Add phone for nurse requests
      if (req.phone) {
        baseData['Phone'] = req.phone;
      }

      // Add payment status for doctor requests
      if (req.paymentStatus) {
        baseData['Payment Status'] = req.paymentStatus;
      }

      return baseData;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const columnWidths = [];
    const headers = Object.keys(excelData[0] || {});
    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...excelData.map(row => String(row[header] || '').length)
      );
      columnWidths[index] = { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');

    // Generate filename with timestamp and filter status
    const timestamp = new Date().toISOString().split('T')[0];
    const filterStatus = hasActiveFilters ? '_filtered' : '_all';
    const filename = `requests${filterStatus}_${timestamp}.xlsx`;

    // Export file
    XLSX.writeFile(workbook, filename);

    console.log(`Exported ${dataToExport.length} requests to Excel file: ${filename}`);
  };

  return (
    <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
      <Download className="w-4 h-4" />
      Export Excel ({hasActiveFilters ? `${filteredRequests.length} filtered` : `${requests.length} all`})
    </Button>
  );
};

export default ExportButton;
