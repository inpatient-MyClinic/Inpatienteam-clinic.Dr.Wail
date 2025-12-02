
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus, Check, X, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PriceComparison, VAT_RATE } from '@/types/billing';
import * as XLSX from 'xlsx';

interface PriceReviewTabProps {
  priceComparisons: PriceComparison[];
  onUpdateComparisons: (comparisons: PriceComparison[]) => void;
  onAcceptMatch: (id: string) => void;
}

// Sample system prices for demo
const systemPrices: Record<string, { name: string; price: number }> = {
  'CSC-001': { name: 'Cardiac Surgery Consultation', price: 5000 },
  'OJR-002': { name: 'Orthopedic Joint Replacement', price: 25000 },
  'GSP-003': { name: 'General Surgery Procedure', price: 8000 },
  'NEU-004': { name: 'Neurology Consultation', price: 3500 },
  'PED-005': { name: 'Pediatric Care', price: 2500 },
};

export default function PriceReviewTab({ priceComparisons, onUpdateComparisons, onAcceptMatch }: PriceReviewTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [manualEntry, setManualEntry] = useState({ serviceCode: '', price: '' });
  const { toast } = useToast();

  const hospitals = ['King Abdulaziz Hospital', 'Prince Sultan Hospital', 'Medical Center', 'National Hospital'];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedHospital) {
      toast({
        title: "Error",
        description: "Please select a hospital first",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const file = files[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const newComparisons: PriceComparison[] = [];

      jsonData.forEach((row: any, index: number) => {
        const serviceCode = row['Service Code'] || row['Code'] || row['service_code'];
        const uploadedPrice = parseFloat(row['Price'] || row['Amount'] || row['price'] || 0);

        if (serviceCode && systemPrices[serviceCode]) {
          const systemPrice = systemPrices[serviceCode].price;
          const priceDifference = uploadedPrice - systemPrice;
          const percentageDifference = ((priceDifference / systemPrice) * 100);

          newComparisons.push({
            id: `${selectedHospital}-${serviceCode}-${Date.now()}-${index}`,
            serviceCode,
            serviceName: systemPrices[serviceCode].name,
            hospital: selectedHospital,
            systemPrice,
            uploadedPrice,
            priceDifference,
            percentageDifference,
            isMatched: priceDifference === 0
          });
        }
      });

      onUpdateComparisons([...priceComparisons, ...newComparisons]);
      toast({
        title: "Upload successful",
        description: `Processed ${newComparisons.length} price comparisons for ${selectedHospital}`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Error processing Excel file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleManualAdd = () => {
    if (!selectedHospital || !manualEntry.serviceCode || !manualEntry.price) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    const systemPrice = systemPrices[manualEntry.serviceCode]?.price || 0;
    const uploadedPrice = parseFloat(manualEntry.price);
    const priceDifference = uploadedPrice - systemPrice;
    const percentageDifference = systemPrice ? ((priceDifference / systemPrice) * 100) : 0;

    const newComparison: PriceComparison = {
      id: `${selectedHospital}-${manualEntry.serviceCode}-${Date.now()}`,
      serviceCode: manualEntry.serviceCode,
      serviceName: systemPrices[manualEntry.serviceCode]?.name || 'Unknown Service',
      hospital: selectedHospital,
      systemPrice,
      uploadedPrice,
      priceDifference,
      percentageDifference,
      isMatched: priceDifference === 0
    };

    onUpdateComparisons([...priceComparisons, newComparison]);
    setManualEntry({ serviceCode: '', price: '' });
    toast({ title: "Added", description: "Price comparison added successfully" });
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Service Code': 'CSC-001', 'Price': 5000 },
      { 'Service Code': 'OJR-002', 'Price': 25000 },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Price Template");
    XLSX.writeFile(wb, "hospital_price_template.xlsx");
  };

  return (
    <div className="space-y-6 p-4">
      {/* Hospital Selection & Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Hospital Prices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Select Hospital</Label>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Label className="cursor-pointer">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || !selectedHospital}
                />
                <Button variant="default" size="sm" disabled={isUploading || !selectedHospital} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Excel'}
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block">Or Add Manually</Label>
            <div className="flex gap-2">
              <Select value={manualEntry.serviceCode} onValueChange={(v) => setManualEntry(prev => ({ ...prev, serviceCode: v }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Service Code" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(systemPrices).map(([code, { name }]) => (
                    <SelectItem key={code} value={code}>{code} - {name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Price (SAR)"
                value={manualEntry.price}
                onChange={(e) => setManualEntry(prev => ({ ...prev, price: e.target.value }))}
                className="w-32"
              />
              <Button onClick={handleManualAdd} disabled={!selectedHospital}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Comparison Table */}
      {priceComparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price Comparisons</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Service Code</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead className="text-right">System Price</TableHead>
                  <TableHead className="text-right">Uploaded Price</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceComparisons.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.hospital}</TableCell>
                    <TableCell className="font-mono">{item.serviceCode}</TableCell>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell className="text-right">{item.systemPrice.toLocaleString()} SAR</TableCell>
                    <TableCell className="text-right">{item.uploadedPrice.toLocaleString()} SAR</TableCell>
                    <TableCell className="text-right">
                      <div className={item.priceDifference === 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.priceDifference > 0 ? '+' : ''}{item.priceDifference.toLocaleString()} SAR
                        <br />
                        <span className="text-xs">
                          ({item.percentageDifference > 0 ? '+' : ''}{item.percentageDifference.toFixed(1)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.isMatched ? (
                        <Badge className="bg-green-100 text-green-800">Matched</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Unmatched</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!item.isMatched && (
                        <Button size="sm" variant="outline" onClick={() => onAcceptMatch(item.id)}>
                          <Check className="w-4 h-4 mr-1" /> Accept
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
