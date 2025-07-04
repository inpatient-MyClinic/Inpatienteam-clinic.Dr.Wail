
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export default function TemplateDownload() {
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      {
        'ID': 'FIN001',
        'Patient Name': 'Ahmed Mohammed',
        'Service Description': 'Cardiac Surgery Consultation',
        'Hospital': 'King Abdulaziz Hospital',
        'Doctor': 'Dr. Ahmed Al-Rashid',
        'Specialty': 'Cardiology',
        'Amount': '₹15,000',
        'Status': 'Paid',
        'Date': '2025-06-15'
      },
      {
        'ID': 'FIN002',
        'Patient Name': 'Fatima Hassan',
        'Service Description': 'Orthopedic Joint Replacement',
        'Hospital': 'Prince Sultan Hospital',
        'Doctor': 'Dr. Sarah Al-Mahmoud',
        'Specialty': 'Orthopedics',
        'Amount': '₹8,500',
        'Status': 'Pending',
        'Date': '2025-06-10'
      },
      {
        'ID': 'FIN003',
        'Patient Name': 'Omar Ali',
        'Service Description': 'General Surgery Procedure',
        'Hospital': 'Medical Center',
        'Doctor': 'Dr. Mohammed Hassan',
        'Specialty': 'General Surgery',
        'Amount': '₹12,000',
        'Status': 'Delay Payment',
        'Date': '2025-06-08'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Finance Template');
    XLSX.writeFile(wb, 'finance_payment_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "Finance payment template has been downloaded. Fill in your data and upload it back.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Download - Highlighted */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm text-blue-800">📥 Step 1: Download Template</CardTitle>
          <CardDescription className="text-blue-600">
            Download the Excel template with the correct format matching your finance table
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download Finance Template
          </Button>
        </CardContent>
      </Card>

      {/* Expected Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">📋 Expected Columns</CardTitle>
          <CardDescription>
            Your Excel files should contain these columns (ID column is required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {['ID', 'Patient Name', 'Service Description', 'Hospital', 'Doctor', 'Specialty', 'Amount', 'Status', 'Date'].map(field => (
              <Badge key={field} variant={field === 'ID' ? 'default' : 'outline'} className="text-xs">
                {field} {field === 'ID' && '*'}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
