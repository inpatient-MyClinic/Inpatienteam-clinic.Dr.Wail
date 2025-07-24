
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ServicePricing {
  id: string;
  hospitalName: string;
  service: string;
  specialty: string;
  price: number;
  lastUpdated: string;
  version: number;
}

interface PricingVersion {
  version: number;
  uploadDate: string;
  fileName: string;
  recordsCount: number;
}

export default function ServicePricingAccess() {
  const [servicePricing, setServicePricing] = useState<ServicePricing[]>([]);
  const [pricingHistory, setPricingHistory] = useState<PricingVersion[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const hospitals = ["King Abdulaziz Hospital", "Prince Mohammed Hospital", "Al-Noor Hospital", "Riyadh Medical Complex"];
  const specialties = ["Cardiology", "Orthopedics", "Neurology", "General Surgery", "Pediatrics"];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      const newPricing: ServicePricing[] = data.map((row, index) => ({
        id: `pricing-${Date.now()}-${index}`,
        hospitalName: row['Hospital Name'] || '',
        service: row['Service'] || '',
        specialty: row['Specialty'] || '',
        price: parseFloat(row['Price']) || 0,
        lastUpdated: new Date().toISOString(),
        version: pricingHistory.length + 1
      }));

      setServicePricing(prev => [...prev, ...newPricing]);
      
      // Add to history
      const newVersion: PricingVersion = {
        version: pricingHistory.length + 1,
        uploadDate: new Date().toISOString(),
        fileName: file.name,
        recordsCount: newPricing.length
      };
      setPricingHistory(prev => [...prev, newVersion]);

      toast({
        title: "Upload Successful",
        description: `${newPricing.length} pricing records imported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the Excel file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "Hospital Name": "King Abdulaziz Hospital",
        "Service": "Cardiac Surgery",
        "Specialty": "Cardiology",
        "Price": 25000
      },
      {
        "Hospital Name": "Prince Mohammed Hospital",
        "Service": "Knee Replacement",
        "Specialty": "Orthopedics",
        "Price": 18000
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Service Pricing");
    XLSX.writeFile(wb, "service_pricing_template.xlsx");
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded to your computer.",
    });
  };

  const exportCurrentData = () => {
    if (servicePricing.length === 0) {
      toast({
        title: "No Data",
        description: "No pricing data available to export.",
        variant: "destructive",
      });
      return;
    }

    const exportData = servicePricing.map(item => ({
      "Hospital Name": item.hospitalName,
      "Service": item.service,
      "Specialty": item.specialty,
      "Price": item.price,
      "Last Updated": new Date(item.lastUpdated).toLocaleDateString(),
      "Version": item.version
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Service Pricing");
    XLSX.writeFile(wb, `service_pricing_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: "Pricing data has been exported to Excel.",
    });
  };

  const filteredPricing = servicePricing.filter(item => {
    const hospitalMatch = selectedHospital === "all" || item.hospitalName === selectedHospital;
    const specialtyMatch = selectedSpecialty === "all" || item.specialty === selectedSpecialty;
    return hospitalMatch && specialtyMatch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload & Manage</TabsTrigger>
              <TabsTrigger value="pricing">Current Pricing</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Upload Excel File</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Select Excel File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </div>
                    {isUploading && (
                      <div className="text-sm text-blue-600 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        Processing file...
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Templates & Export</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button onClick={downloadTemplate} variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                    <Button onClick={exportCurrentData} variant="outline" size="sm" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Export Current Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                    {hospitals.map(hospital => (
                      <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Price (SAR)</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Version</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPricing.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.hospitalName}</TableCell>
                      <TableCell>{item.service}</TableCell>
                      <TableCell>{item.specialty}</TableCell>
                      <TableCell>{item.price.toLocaleString()}</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">v{item.version}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Upload History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Records Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pricingHistory.map((version) => (
                        <TableRow key={version.version}>
                          <TableCell>
                            <Badge variant="outline">v{version.version}</Badge>
                          </TableCell>
                          <TableCell>{new Date(version.uploadDate).toLocaleDateString()}</TableCell>
                          <TableCell>{version.fileName}</TableCell>
                          <TableCell>{version.recordsCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
