import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileSpreadsheet, TrendingUp, Users, Building, Stethoscope, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExcelAnalysisResult {
  totalCases: number;
  statusOperationBreakdown: Record<string, number>;
  branchBreakdown: Record<string, number>;
  specialtyBreakdown: Record<string, number>;
  caseCoordinatorBreakdown: Record<string, number>;
  referredHospitalBreakdown: Record<string, number>;
  monthBreakdown: Record<string, number>;
  rawData: any[];
}

export default function ExcelDataAnalyzer() {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ExcelAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const performExcelAnalysis = async () => {
    if (!selectedMonth) {
      toast({
        title: "الشهر مطلوب",
        description: "يرجى اختيار شهر للتحليل",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const targetMonth = selectedMonth.getMonth() + 1;
      const targetYear = selectedMonth.getFullYear();

      // Fetch raw Excel data
      const { data: rawData, error: queryError } = await supabase
        .from('excel_rows_raw')
        .select('*')
        .not('raw_data', 'is', null);

      if (queryError) throw queryError;

      // Filter data by the selected month using column AP and other date fields
      const filteredData = rawData?.filter(row => {
        // Column AP is the primary date field for filtering - access via raw_data
        const rawDataObj = typeof row.raw_data === 'object' ? row.raw_data as Record<string, any> : null;
        const columnAP = rawDataObj?.AP || row['Date of Request:'];
        const otherDateFields = [
          row['Date of File Opening'],
          row['Agreed - Booked - OR date(mm/dd/yyyy)']
        ];

        // Check column AP first (primary)
        if (columnAP) {
          const date = new Date(columnAP);
          if (!isNaN(date.getTime()) && 
              date.getFullYear() === targetYear && 
              date.getMonth() + 1 === targetMonth) {
            return true;
          }
        }

        // Fallback to other date fields if column AP is not available
        return otherDateFields.some(dateStr => {
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return !isNaN(date.getTime()) && 
                 date.getFullYear() === targetYear && 
                 date.getMonth() + 1 === targetMonth;
        });
      }) || [];

      // Analyze the filtered data
      const analysisData: ExcelAnalysisResult = {
        totalCases: filteredData.length,
        statusOperationBreakdown: {},
        branchBreakdown: {},
        specialtyBreakdown: {},
        caseCoordinatorBreakdown: {},
        referredHospitalBreakdown: {},
        monthBreakdown: {},
        rawData: filteredData.slice(0, 10) // Keep sample for debugging
      };

      // Process each row for analysis
      filteredData.forEach(row => {
        // Status of operation breakdown - use column AI from raw_data
        const rawDataObj = typeof row.raw_data === 'object' ? row.raw_data as Record<string, any> : null;
        const operationStatus = rawDataObj?.AI || row['Status of operation'] || 'غير محدد';
        analysisData.statusOperationBreakdown[operationStatus] = 
          (analysisData.statusOperationBreakdown[operationStatus] || 0) + 1;

        // My Clinic Branch breakdown
        const branch = row['My Clinic Branch'] || 'غير محدد';
        analysisData.branchBreakdown[branch] = 
          (analysisData.branchBreakdown[branch] || 0) + 1;

        // Specialty breakdown
        const specialty = row['Specialty'] || 'غير محدد';
        analysisData.specialtyBreakdown[specialty] = 
          (analysisData.specialtyBreakdown[specialty] || 0) + 1;

        // Case coordinator breakdown
        const caseCoordinator = row['Case coordinator'] || 'غير محدد';
        analysisData.caseCoordinatorBreakdown[caseCoordinator] = 
          (analysisData.caseCoordinatorBreakdown[caseCoordinator] || 0) + 1;

        // Referred Hospital breakdown
        const referredHospital = row['Referred Hospital'] || 'غير محدد';
        analysisData.referredHospitalBreakdown[referredHospital] = 
          (analysisData.referredHospitalBreakdown[referredHospital] || 0) + 1;

        // Month breakdown from column AP (extract month from date fields)
        const dateFields = [
          row['Date of Request:'],
          row['Date of File Opening'], 
          row['Agreed - Booked - OR date(mm/dd/yyyy)']
        ];
        
        dateFields.forEach(dateStr => {
          if (dateStr) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              analysisData.monthBreakdown[monthYear] = 
                (analysisData.monthBreakdown[monthYear] || 0) + 1;
            }
          }
        });
      });

      setAnalysisResult(analysisData);
      
      toast({
        title: "اكتمل التحليل",
        description: `تم العثور على ${analysisData.totalCases} حالة في بيانات Excel لشهر ${format(selectedMonth, 'MMM yyyy')}`,
      });

    } catch (err) {
      console.error('Excel analysis error:', err);
      setError(err instanceof Error ? err.message : 'فشل في التحليل');
      toast({
        title: "فشل التحليل",
        description: err instanceof Error ? err.message : 'فشل في تحليل بيانات Excel',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const BreakdownCard = ({ 
    title, 
    icon: Icon, 
    data, 
    variant = "secondary" 
  }: { 
    title: string; 
    icon: any; 
    data: Record<string, number>; 
    variant?: "secondary" | "outline" | "default" 
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(data)
            .sort(([,a], [,b]) => b - a)
            .map(([key, count]) => (
              <div key={key} className="flex justify-between items-center py-2 px-3 hover:bg-muted/50 rounded">
                <span className="font-medium text-sm">{key}</span>
                <Badge variant={variant} className="font-bold">
                  {count}
                </Badge>
              </div>
            ))}
          
          {Object.keys(data).length > 0 && (
            <div className="border-t pt-2 mt-3">
              <div className="text-xs text-muted-foreground text-center">
                الإجمالي: {Object.values(data).reduce((sum, count) => sum + count, 0)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            محلل بيانات Excel - الأعمدة المخصصة
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            تحليل مباشر من ملفات Excel المرفوعة بناءً على الأعمدة المحددة
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedMonth ? format(selectedMonth, 'MMM yyyy') : 'اختر الشهر'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={setSelectedMonth}
                  defaultMonth={selectedMonth || new Date()}
                />
              </PopoverContent>
            </Popover>

            <Button 
              onClick={performExcelAnalysis} 
              disabled={!selectedMonth || loading}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {loading ? 'جاري التحليل...' : 'تحليل بيانات Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="grid gap-6">
          {/* Grand Total */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                تحليل Excel لشهر {selectedMonth ? format(selectedMonth, 'MMM yyyy') : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {analysisResult.totalCases}
                </div>
                <div className="text-sm text-muted-foreground">
                  إجمالي الحالات (عدد Patient's MRN)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <BreakdownCard
              title="حالة العملية"
              icon={TrendingUp}
              data={analysisResult.statusOperationBreakdown}
              variant="default"
            />

            <BreakdownCard
              title="فرع العيادة"
              icon={Building}
              data={analysisResult.branchBreakdown}
              variant="secondary"
            />

            <BreakdownCard
              title="التخصص"
              icon={Stethoscope}
              data={analysisResult.specialtyBreakdown}
              variant="outline"
            />

            <BreakdownCard
              title="منسق الحالة"
              icon={Users}
              data={analysisResult.caseCoordinatorBreakdown}
              variant="secondary"
            />

            <BreakdownCard
              title="المستشفى المحول إليه"
              icon={Building}
              data={analysisResult.referredHospitalBreakdown}
              variant="outline"
            />

            <BreakdownCard
              title="الأشهر الموجودة (عمود AP)"
              icon={CalendarIcon}
              data={analysisResult.monthBreakdown}
              variant="default"
            />
          </div>

          {/* Sample Data */}
          {analysisResult.rawData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">عينة من البيانات (للمراجعة)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {analysisResult.rawData.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-xs bg-muted p-3 rounded">
                      <div><strong>اسم المريض:</strong> {item["Patient's Name:"] || 'غير محدد'}</div>
                      <div><strong>التخصص:</strong> {item["Specialty"] || 'غير محدد'}</div>
                      <div><strong>فرع العيادة:</strong> {item["My Clinic Branch"] || 'غير محدد'}</div>
                      <div><strong>حالة العملية:</strong> {item["Status of operation"] || 'غير محدد'}</div>
                      <div><strong>نوع التأمين:</strong> {item["Insurance/Cash"] || 'غير محدد'}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}