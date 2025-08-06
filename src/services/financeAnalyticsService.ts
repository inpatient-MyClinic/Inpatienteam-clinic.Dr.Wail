import { supabase } from '@/integrations/supabase/client';

interface FinanceAnalyticsData {
  id: string;
  category: string;
  type: string;
  [key: string]: string | number;
}

interface DatabaseRow {
  id: string;
  row_id: string;
  category: string;
  type: string;
  data: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const saveFinanceAnalyticsData = async (data: FinanceAnalyticsData[]): Promise<void> => {
  try {
    // First, get existing data to update or insert
    const { data: existingData, error: fetchError } = await supabase
      .from('finance_analytics_data')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    const existingRowIds = new Set(existingData?.map(row => row.row_id) || []);
    const updates: any[] = [];
    const inserts: any[] = [];

    data.forEach(row => {
      const { id, category, type, ...monthData } = row;
      
      if (existingRowIds.has(id)) {
        // Update existing row
        updates.push({
          row_id: id,
          category,
          type,
          data: monthData
        });
      } else {
        // Insert new row
        inserts.push({
          row_id: id,
          category,
          type,
          data: monthData
        });
      }
    });

    // Perform updates
    if (updates.length > 0) {
      for (const update of updates) {
        const { error } = await supabase
          .from('finance_analytics_data')
          .update({
            category: update.category,
            type: update.type,
            data: update.data
          })
          .eq('row_id', update.row_id);

        if (error) {
          throw error;
        }
      }
    }

    // Perform inserts
    if (inserts.length > 0) {
      const { error } = await supabase
        .from('finance_analytics_data')
        .insert(inserts);

      if (error) {
        throw error;
      }
    }

  } catch (error) {
    console.error('Error saving finance analytics data:', error);
    throw error;
  }
};

export const loadFinanceAnalyticsData = async (): Promise<FinanceAnalyticsData[]> => {
  try {
    const { data, error } = await supabase
      .from('finance_analytics_data')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Convert database format to component format
    return data.map((row: DatabaseRow) => ({
      id: row.row_id,
      category: row.category,
      type: row.type,
      ...row.data
    }));

  } catch (error) {
    console.error('Error loading finance analytics data:', error);
    throw error;
  }
};

export const deleteFinanceAnalyticsRow = async (rowId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('finance_analytics_data')
      .delete()
      .eq('row_id', rowId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting finance analytics row:', error);
    throw error;
  }
};