import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface ExcelDataAnalytics {
  totalUploads: number;
  totalRows: number;
  latestUpload: {
    id: string;
    filename: string;
    uploaded_at?: string;
    created_at?: string;
    total_rows: number;
  } | null;
  availableMonths: Array<{
    year: number;
    month: number;
    count: number;
    monthName: string;
  }>;
  statusBreakdown: Record<string, number>;
  branchBreakdown: Record<string, number>;
  loading: boolean;
  error: string | null;
}

export function useExcelDataAnalytics() {
  const [analytics, setAnalytics] = useState<ExcelDataAnalytics>({
    totalUploads: 0,
    totalRows: 0,
    latestUpload: null,
    availableMonths: [],
    statusBreakdown: {},
    branchBreakdown: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get upload stats
      const { data: uploads, error: uploadsError } = await supabase
        .from('excel_upload_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (uploadsError) throw uploadsError;

      // Get total row count and latest upload
      const totalUploads = uploads?.length || 0;
      const totalRows = uploads?.reduce((sum, upload) => sum + (upload.total_rows || 0), 0) || 0;
      const latestUpload = uploads?.[0] || null;

      // Try to get available months from excel_cases_clean (may not exist yet)
      let monthData: any[] = [];
      try {
        const result = await supabase
          .from('excel_cases_clean' as any)
          .select('case_date')
          .not('case_date', 'is', null);
        
        if (!result.error) {
          monthData = result.data || [];
        }
      } catch (error) {
        console.log('⚠️ excel_cases_clean table not available - migration required');
      }

      

      // Process available months
      const monthCounts = new Map<string, number>();
      monthData?.forEach(row => {
        if (row.case_date) {
          const date = new Date(row.case_date);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
        }
      });

      const availableMonths = Array.from(monthCounts.entries())
        .map(([key, count]) => {
          const [year, month] = key.split('-').map(Number);
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            year,
            month,
            count,
            monthName: monthNames[month - 1]
          };
        })
        .sort((a, b) => b.year - a.year || b.month - a.month);

      // Try to get status and branch breakdowns from current data
      let statusData: any[] = [];
      try {
        const result = await supabase
          .from('excel_cases_clean' as any)
          .select('status, branch')
          .not('status', 'is', null);
        
        if (!result.error) {
          statusData = result.data || [];
        }
      } catch (error) {
        console.log('⚠️ excel_cases_clean table not available - using empty data');
      }

      const statusBreakdown: Record<string, number> = {};
      const branchBreakdown: Record<string, number> = {};

      statusData?.forEach(row => {
        if (row.status) {
          statusBreakdown[row.status] = (statusBreakdown[row.status] || 0) + 1;
        }
        if (row.branch) {
          branchBreakdown[row.branch] = (branchBreakdown[row.branch] || 0) + 1;
        }
      });

      setAnalytics({
        totalUploads,
        totalRows,
        latestUpload,
        availableMonths,
        statusBreakdown,
        branchBreakdown,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error loading Excel analytics:', error);
      setAnalytics(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load analytics'
      }));
    }
  };

  return { analytics, refetch: loadAnalytics };
}