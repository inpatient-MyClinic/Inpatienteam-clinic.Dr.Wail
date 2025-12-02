import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Check, X, FileSpreadsheet, History, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PriceComparison, UploadBatch, VAT_RATE } from '@/types/billing';
import * as XLSX from 'xlsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PriceReviewTabProps {
  priceComparisons: PriceComparison[];
  uploadBatches: UploadBatch[];
  onUpdateComparisons: (comparisons: PriceComparison[]) => void;
  onAddBatch: (batch: UploadBatch) => void;
  onStatusChange: (id: string, status: 'agreed' | 'not_agreed') => void;
}

const systemPrices: Record<string, { name: string; price: number }> = {
  'CSC-001': { name: 'Cardiac Surgery Consultation', price: 5000 },
  'OJR-002': { name: 'Orthopedic Joint Replacement', price: 25000 },
  'GSP-003': { name: 'General Surgery Procedure', price: 8000 },
  'NEU-004': { name: 'Neurology Consultation', price: 3500 },
  'PED-005': { name: 'Pediatric Care', price: 2500 },
  'INP-001': { name: 'In Patient Services', price: 77356.24 },
  'INP-002': { name: 'In Patient Services DSFHMC', price: 13169.90 },
};

const hospitals = ['Dr Soliman Fakeeh Hospital', 'King Abdulaziz Hospital', 'Prince Sultan Hospital', 'Medical Center', 'National Hospital'];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PriceReviewTab({ 
  priceComparisons, 
  uploadBatches,
  onUpdateComparisons, 
  onAddBatch,
  onStatusChange 
}: PriceReviewTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showHistory, setShowHistory] = useState(false);
  const [expandedHospitals, setExpandedHospitals] = useState<string[]>([]);
  const { toast } = useToast();

  const comparisonsByHospital = useMemo(() => {
    const grouped: Record<string, PriceComparison[]> = {};
    priceComparisons.forEach(item => {
      if (!grouped[item.hospital]) grouped[item.hospital] = [];
      grouped[item.hospital].push(item);
    });
    return grouped;
  }, [priceComparisons]);

  const toggleHospital = (hospital: string) => {
    setExpandedHospitals(prev => 
      prev.includes(hospital) ? prev.filter(h => h !== hospital) : [...prev, hospital]
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedHospital) {
      toast({ title: "Error", description: "Please select a hospital first", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const file = files[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const batchId = `batch-${Date.now()}`;
      const newComparisons: PriceComparison[] = [];

      jsonData.forEach((row: any, index: number) => {
        const serviceCode = row['Service Code'] || row['Code'] || row['service_code'];
        const uploadedPrice = parseFloat(row['Price'] || row['Amount'] || row['Gross Unit Price'] || 0);
        const quantity = parseFloat(row['Quantity'] || 1);
        const discount = parseFloat(row['Discount'] || 0);

        if (serviceCode) {
          const systemPrice = systemPrices[serviceCode]?.price || uploadedPrice;
          const grossAmount = uploadedPrice * quantity;
          const amountAfterDiscount = grossAmount - discount;
          const priceDifference = uploadedPrice - systemPrice;
          const percentageDifference = systemPrice ? ((priceDifference / systemPrice) * 100) : 0;
          const isMatched = Math.abs(priceDifference) < 0.01;

          newComparisons.push({
            id: `${selectedHospital}-${serviceCode}-${Date.now()}-${index}`,
            serviceCode,
            serviceName: systemPrices[serviceCode]?.name || 'Unknown Service',
            hospital: selectedHospital,
            systemPrice,
            uploadedPrice,
            priceDifference,
            percentageDifference,
            quantity,
            grossAmount,
            discount,
            amountAfterDiscount,
            patientShare: parseFloat(row['Patient Share'] || 0),
            insuranceShare: amountAfterDiscount,
            status: isMatched ? 'matched' : 'pending',
            uploadBatchId: batchId
          });
        }
      });

      onAddBatch({
        id: batchId,
        hospital: selectedHospital,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        month: selectedMonth,
        year: selectedYear,
        itemCount: newComparisons.length,
        status: 'pending'
      });
      onUpdateComparisons([...priceComparisons, ...newComparisons]);
      if (!expandedHospitals.includes(selectedHospital)) {
        setExpandedHospitals(prev => [...prev, selectedHospital]);
      }
      toast({ title: "Upload successful", description: `Processed ${newComparisons.length} items for ${selectedHospital}` });
    } catch (error) {
      toast({ title: "Upload failed", description: "Error processing Excel file", variant: "destructive" });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Service Code': 'CSC-001', 'Nature of Service': 'Cardiac Surgery', 'Quantity': 1, 'Gross Unit Price': 5000, 'Discount': 0, 'Patient Share': 0 },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "hospital_price_template.xlsx");
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'matched': 'bg-blue-100 text-blue-800',
      'agreed': 'bg-green-100 text-green-800',
      'not_agreed': 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      'pending': 'Pending', 'matched': 'Matched', 'agreed': 'Agreed', 'not_agreed': 'Not Agreed'
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Upload Hospital Prices</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Hospital</Label>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger><SelectValue placeholder="Choose hospital" /></SelectTrigger>
                <SelectContent>
                  {hospitals.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />Template
              </Button>
              <Label className="cursor-pointer">
                <Input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" disabled={isUploading || !selectedHospital} />
                <Button variant="default" size="sm" disabled={isUploading || !selectedHospital} asChild>
                  <span><Upload className="w-4 h-4 mr-2" />{isUploading ? 'Uploading...' : 'Upload'}</span>
                </Button>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Collapsible open={showHistory} onOpenChange={setShowHistory}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4" />Upload History ({uploadBatches.length})
                </CardTitle>
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadBatches.map(batch => (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.hospital}</TableCell>
                      <TableCell>{batch.fileName}</TableCell>
                      <TableCell>{batch.month} {batch.year}</TableCell>
                      <TableCell>{batch.itemCount}</TableCell>
                      <TableCell>{new Date(batch.uploadedAt).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant={batch.status === 'completed' ? 'default' : 'secondary'}>{batch.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {uploadBatches.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-4">No history</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {Object.entries(comparisonsByHospital).map(([hospital, items]) => (
        <Collapsible key={hospital} open={expandedHospitals.includes(hospital)} onOpenChange={() => toggleHospital(hospital)}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{hospital}</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800">{items.filter(i => i.status === 'agreed' || i.status === 'matched').length} Ready</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">{items.filter(i => i.status === 'pending').length} Pending</Badge>
                      <Badge className="bg-red-100 text-red-800">{items.filter(i => i.status === 'not_agreed').length} Not Agreed</Badge>
                    </div>
                    {expandedHospitals.includes(hospital) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">System Price</TableHead>
                      <TableHead className="text-right">Hospital Price</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.serviceCode}</TableCell>
                        <TableCell>{item.serviceName}</TableCell>
                        <TableCell className="text-right">{item.systemPrice.toLocaleString()} SAR</TableCell>
                        <TableCell className="text-right">{item.uploadedPrice.toLocaleString()} SAR</TableCell>
                        <TableCell className="text-right">
                          <div className={item.priceDifference === 0 ? 'text-green-600' : 'text-red-600'}>
                            {item.priceDifference > 0 ? '+' : ''}{item.priceDifference.toLocaleString()} SAR
                            <br /><span className="text-xs">({item.percentageDifference.toFixed(1)}%)</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {(item.status === 'pending' || item.status === 'not_agreed') && (
                              <Button size="sm" variant="outline" className="text-green-600" onClick={() => onStatusChange(item.id, 'agreed')}>
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            {item.status === 'pending' && (
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => onStatusChange(item.id, 'not_agreed')}>
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      {Object.keys(comparisonsByHospital).length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No price data uploaded yet.</CardContent></Card>
      )}
    </div>
  );
}