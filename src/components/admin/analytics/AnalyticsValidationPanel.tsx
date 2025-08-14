import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw } from 'lucide-react';
import {
  runAnalyticsValidation,
  generateSeedData,
  normalizeStatus,
  type AnalyticsData,
  type ValidationResult
} from '@/utils/analyticsValidation';

interface AnalyticsValidationPanelProps {
  allData: any[];
  filteredData: any[];
  selectedMonths: string[];
  statusCounts?: Record<string, number>;
  useCompletedDate?: boolean;
}

export default function AnalyticsValidationPanel({
  allData,
  filteredData,
  selectedMonths,
  statusCounts = {},
  useCompletedDate = false
}: AnalyticsValidationPanelProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [seedData, setSeedData] = useState<AnalyticsData[]>([]);

  // Convert data to AnalyticsData format
  const convertToAnalyticsData = (data: any[]): AnalyticsData[] => {
    return data.map((item, index) => ({
      id: item.id || item.request_id || `ITEM-${index}`,
      request_date: item.request_date || item.dateCreated || item.date || item.created_at || new Date(),
      completed_at: item.completed_at || item.dateCompleted,
      status: normalizeStatus(item.status || item._status),
      hospital: item.hospital || item.hospitalName || 'Unknown',
      specialty: item.specialty || 'Unknown',
      patient_name: item.patient_name || item.patientName || 'Unknown',
      mrn: item.mrn || item.patientMRN || item.hospitalMRN || 'Unknown',
      ...item
    }));
  };

  const runValidation = async () => {
    setIsRunning(true);
    
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const analyticsData = convertToAnalyticsData(allData);
      const filteredAnalyticsData = convertToAnalyticsData(filteredData);
      
      // Calculate expected counts from filtered data
      const expectedCounts = {
        total: filteredAnalyticsData.length,
        completed: filteredAnalyticsData.filter(item => item.status === 'completed').length,
        pending: filteredAnalyticsData.filter(item => item.status === 'pending').length,
        scheduled: filteredAnalyticsData.filter(item => item.status === 'scheduled').length,
        cancelled: filteredAnalyticsData.filter(item => item.status === 'cancelled').length,
        planned_nvd: filteredAnalyticsData.filter(item => item.status === 'planned_nvd').length,
      };
      
      const result = runAnalyticsValidation(
        analyticsData,
        filteredAnalyticsData,
        selectedMonths,
        statusCounts.total ? statusCounts : expectedCounts,
        undefined, // beforeImportData
        undefined, // importedData
        useCompletedDate
      );
      
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult({
        isValid: false,
        errors: [`Validation failed: ${error}`],
        warnings: [],
        details: {}
      });
    } finally {
      setIsRunning(false);
    }
  };

  const generateAndTestSeedData = () => {
    const newSeedData = generateSeedData(100);
    setSeedData(newSeedData);
    
    // Run validation on seed data
    const result = runAnalyticsValidation(
      newSeedData,
      newSeedData, // No filtering
      [], // No month filter
      {
        total: newSeedData.length,
        completed: newSeedData.filter(item => item.status === 'completed').length,
        pending: newSeedData.filter(item => item.status === 'pending').length,
        scheduled: newSeedData.filter(item => item.status === 'scheduled').length,
        cancelled: newSeedData.filter(item => item.status === 'cancelled').length,
        planned_nvd: newSeedData.filter(item => item.status === 'planned_nvd').length,
      }
    );
    
    setValidationResult(result);
  };

  const testExcelReimport = () => {
    if (seedData.length === 0) {
      generateAndTestSeedData();
      return;
    }
    
    // Simulate re-import by creating modified copies
    const reimportData = seedData.map(item => ({
      ...item,
      // Simulate potential updates
      updated_at: new Date(),
      notes: 'Updated via re-import'
    }));
    
    // Add some new records
    const newRecords = generateSeedData(10).map((item, i) => ({
      ...item,
      id: `NEW-${i + 1}`,
      notes: 'New record from re-import'
    }));
    
    const allReimportData = [...reimportData, ...newRecords];
    
    const result = runAnalyticsValidation(
      allReimportData,
      allReimportData,
      [],
      {
        total: allReimportData.length,
        completed: allReimportData.filter(item => item.status === 'completed').length,
        pending: allReimportData.filter(item => item.status === 'pending').length,
        scheduled: allReimportData.filter(item => item.status === 'scheduled').length,
        cancelled: allReimportData.filter(item => item.status === 'cancelled').length,
        planned_nvd: allReimportData.filter(item => item.status === 'planned_nvd').length,
      },
      seedData, // before import
      newRecords // imported data
    );
    
    setValidationResult(result);
  };

  const renderValidationStatus = (result: ValidationResult) => {
    const { isValid, errors, warnings } = result;
    
    if (isValid && warnings.length === 0) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />All Checks Passed</Badge>;
    } else if (isValid && warnings.length > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Passed with Warnings</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Validation Failed</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Analytics Accuracy Validation
        </CardTitle>
        <CardDescription>
          Unit tests and seed checks for analytics accuracy, Excel imports, and timezone consistency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="validation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="validation">Live Validation</TabsTrigger>
            <TabsTrigger value="seed">Seed Data Tests</TabsTrigger>
            <TabsTrigger value="details">Validation Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="validation" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={runValidation} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Validation
              </Button>
              
              {validationResult && (
                <div className="flex items-center gap-2">
                  {renderValidationStatus(validationResult)}
                </div>
              )}
            </div>
            
            {validationResult && (
              <div className="space-y-3">
                {validationResult.errors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription>
                      <div className="font-semibold text-red-800 mb-2">Errors Found:</div>
                      <ul className="space-y-1 text-red-700">
                        {validationResult.errors.map((error, i) => (
                          <li key={i} className="text-sm">• {error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {validationResult.warnings.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <AlertDescription>
                      <div className="font-semibold text-yellow-800 mb-2">Warnings:</div>
                      <ul className="space-y-1 text-yellow-700">
                        {validationResult.warnings.map((warning, i) => (
                          <li key={i} className="text-sm">• {warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {validationResult.isValid && validationResult.warnings.length === 0 && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      All analytics validation checks passed successfully! Data accuracy is confirmed.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-2">Data Summary</h4>
                <div className="space-y-1 text-xs">
                  <div>Total Records: {allData.length}</div>
                  <div>Filtered Records: {filteredData.length}</div>
                  <div>Selected Months: {selectedMonths.length || 'All'}</div>
                  <div>Filter Mode: {useCompletedDate ? 'Completed Date' : 'Request Date'}</div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-2">Status Counts</h4>
                <div className="space-y-1 text-xs">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status}>{status}: {count}</div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-2">Validation Status</h4>
                <div className="space-y-1 text-xs">
                  {validationResult ? (
                    <>
                      <div>Checks Run: {validationResult.details.validationSummary?.totalChecks || 0}</div>
                      <div>Passed: {validationResult.details.validationSummary?.passedChecks || 0}</div>
                      <div>Failed: {validationResult.details.validationSummary?.failedChecks || 0}</div>
                    </>
                  ) : (
                    <div>No validation run yet</div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="seed" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={generateAndTestSeedData} variant="outline">
                Generate Seed Data
              </Button>
              <Button onClick={testExcelReimport} variant="outline" disabled={seedData.length === 0}>
                Test Excel Re-import
              </Button>
            </div>
            
            {seedData.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Seed Data Generated</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Records: {seedData.length}</div>
                  <div>Hospitals: {new Set(seedData.map(d => d.hospital)).size}</div>
                  <div>Specialties: {new Set(seedData.map(d => d.specialty)).size}</div>
                  <div>Statuses: {new Set(seedData.map(d => d.status)).size}</div>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            {validationResult?.details && (
              <div className="space-y-4">
                {Object.entries(validationResult.details).map(([key, value]) => (
                  <Card key={key} className="p-4">
                    <h4 className="font-semibold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}