import { useState, useEffect, useCallback } from 'react';
import { unifiedDataService, UnifiedRequest, UserProfile, AnalyticsData } from '@/services/unifiedDataService';
import { useToast } from '@/hooks/use-toast';

export interface DataFilters {
  startDate?: string;
  endDate?: string;
  hospital?: string;
  specialty?: string;
  status?: string;
  assignedTo?: string;
}

export function useUnifiedData() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [filters, setFilters] = useState<DataFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load all data on initialization
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load current user
      const user = await unifiedDataService.getCurrentUser();
      setCurrentUser(user);

      if (!user) {
        setError('No authenticated user found');
        return;
      }

      // Load users (admin only)
      if (user.role === 'admin') {
        const users = await unifiedDataService.getAllUsers();
        setAllUsers(users);
      }

      // Sync local storage to Supabase first
      await unifiedDataService.syncLocalStorageToSupabase();

      // Load requests based on filters
      const requestsData = await unifiedDataService.getAllRequests(filters);
      setRequests(requestsData);

      // Load analytics
      const analyticsData = await unifiedDataService.getAnalytics(filters);
      setAnalytics(analyticsData);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      toast({
        title: "Error Loading Data",
        description: "There was an error loading your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Filtered requests based on user role
  const filteredRequests = useCallback(() => {
    if (!currentUser || !requests.length) return [];

    return requests.filter(request => {
      switch (currentUser.role) {
        case 'admin':
          return true; // Admin sees everything
        
        case 'doctor':
          return (
            request.created_by === currentUser.id ||
            request.assigned_to === currentUser.id ||
            request.specialty === currentUser.specialty
          );
        
        case 'nurse':
        case 'hospital':
        case 'case-coordinator':
        case 'finance':
          return request.hospital_code === currentUser.hospital_code;
        
        case 'customer-care':
          return request.assigned_to === currentUser.id;
        
        default:
          return false;
      }
    });
  }, [currentUser, requests]);

  // Create new request
  const createRequest = useCallback(async (requestData: Omit<UnifiedRequest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const newRequest = await unifiedDataService.createRequest({
        ...requestData,
        created_by: currentUser.id
      });

      if (newRequest) {
        setRequests(prev => [newRequest, ...prev]);
        toast({
          title: "Request Created",
          description: "Medical request has been created successfully.",
        });
        
        // Refresh analytics
        const updatedAnalytics = await unifiedDataService.getAnalytics(filters);
        setAnalytics(updatedAnalytics);
        
        return newRequest;
      }
      throw new Error('Failed to create request');
    } catch (err) {
      console.error('Error creating request:', err);
      toast({
        title: "Error Creating Request",
        description: err instanceof Error ? err.message : "Failed to create request",
        variant: "destructive"
      });
      return null;
    }
  }, [currentUser, filters, toast]);

  // Update request
  const updateRequest = useCallback(async (requestId: string, updates: Partial<UnifiedRequest>) => {
    try {
      const success = await unifiedDataService.updateRequest(requestId, updates);
      
      if (success) {
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, ...updates, updated_at: new Date().toISOString() }
              : req
          )
        );
        
        toast({
          title: "Request Updated",
          description: "Medical request has been updated successfully.",
        });

        // Refresh analytics
        const updatedAnalytics = await unifiedDataService.getAnalytics(filters);
        setAnalytics(updatedAnalytics);
        
        return true;
      }
      throw new Error('Failed to update request');
    } catch (err) {
      console.error('Error updating request:', err);
      toast({
        title: "Error Updating Request",
        description: err instanceof Error ? err.message : "Failed to update request",
        variant: "destructive"
      });
      return false;
    }
  }, [filters, toast]);

  // Excel import
  const importExcelData = useCallback(async (
    filename: string,
    excelData: any[],
    columnMappings: Record<string, string>
  ) => {
    try {
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Create upload batch
      const uploadBatch = await unifiedDataService.createExcelUploadBatch(filename, currentUser.id);
      if (!uploadBatch) {
        throw new Error('Failed to create upload batch');
      }

      // Process excel data
      const results = await unifiedDataService.processExcelData(
        uploadBatch.id,
        excelData,
        columnMappings
      );

      toast({
        title: "Excel Import Complete",
        description: `Successfully imported ${results.success} requests with ${results.errors} errors.`,
        variant: results.errors > 0 ? "destructive" : "default"
      });

      // Refresh data
      await loadAllData();
      
      return results;
    } catch (err) {
      console.error('Error importing excel data:', err);
      toast({
        title: "Excel Import Failed",
        description: err instanceof Error ? err.message : "Failed to import excel data",
        variant: "destructive"
      });
      return { success: 0, errors: 1, warnings: 0, details: ['Import failed'] };
    }
  }, [currentUser, loadAllData, toast]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<DataFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    return loadAllData();
  }, [loadAllData]);

  // Update user profile
  const updateUserProfile = useCallback(async (userId: string, updates: any) => {
    try {
      const success = await unifiedDataService.updateUserProfile(userId, updates);
      
      if (success) {
        if (userId === currentUser?.id) {
          setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        }
        
        setAllUsers(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, ...updates }
              : user
          )
        );

        toast({
          title: "Profile Updated",
          description: "User profile has been updated successfully.",
        });
        
        return true;
      }
      throw new Error('Failed to update profile');
    } catch (err) {
      console.error('Error updating user profile:', err);
      toast({
        title: "Error Updating Profile",
        description: err instanceof Error ? err.message : "Failed to update profile",
        variant: "destructive"
      });
      return false;
    }
  }, [currentUser, toast]);

  // Get finance transactions
  const getFinanceTransactions = useCallback(async () => {
    try {
      return await unifiedDataService.getFinanceTransactions();
    } catch (err) {
      console.error('Error fetching finance transactions:', err);
      toast({
        title: "Error Loading Transactions",
        description: "Failed to load finance transactions",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  // Update payment status
  const updatePaymentStatus = useCallback(async (transactionId: string, status: string) => {
    try {
      const success = await unifiedDataService.updatePaymentStatus(transactionId, status);
      
      if (success) {
        toast({
          title: "Payment Status Updated",
          description: "Transaction payment status has been updated.",
        });
        return true;
      }
      throw new Error('Failed to update payment status');
    } catch (err) {
      console.error('Error updating payment status:', err);
      toast({
        title: "Error Updating Payment",
        description: err instanceof Error ? err.message : "Failed to update payment status",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Permission helpers
  const canCreateRequests = currentUser?.role !== 'customer-care' && currentUser?.role !== 'finance';
  const canViewFinance = currentUser?.role === 'admin' || currentUser?.role === 'finance';
  const canManageUsers = currentUser?.role === 'admin';
  const canImportData = currentUser?.role === 'admin' || currentUser?.role === 'case-coordinator';
  const canViewAnalytics = currentUser?.role === 'admin' || currentUser?.role === 'case-coordinator';

  return {
    // State
    currentUser,
    allUsers,
    requests: filteredRequests(),
    analytics,
    filters,
    isLoading,
    error,

    // Actions
    createRequest,
    updateRequest,
    importExcelData,
    updateFilters,
    clearFilters,
    refreshData,
    updateUserProfile,
    getFinanceTransactions,
    updatePaymentStatus,

    // Permissions
    canCreateRequests,
    canViewFinance,
    canManageUsers,
    canImportData,
    canViewAnalytics
  };
}