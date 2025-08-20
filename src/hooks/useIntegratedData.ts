import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { dataIntegrationService, UserProfile, IntegratedRequest, FinanceTransaction } from '@/services/dataIntegrationService';
import { requestStorage } from '@/services/requestStorage';

export interface DataFilters {
  startDate?: string;
  endDate?: string;
  hospital?: string;
  specialty?: string;
  status?: string;
  assignedTo?: string;
}

export function useIntegratedData() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<IntegratedRequest[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DataFilters>({});
  const { toast } = useToast();

  // Initialize data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Load current user
      const user = await dataIntegrationService.getCurrentUser();
      setCurrentUser(user);

      // Load users (admin only)
      if (user?.role === 'admin') {
        const allUsers = await dataIntegrationService.getAllUsers();
        setUsers(allUsers);
      }

      // Load requests
      const allRequests = await dataIntegrationService.getAllMedicalRequests();
      setRequests(allRequests);

      // Load transactions (finance and admin only)
      if (user?.role === 'admin' || user?.role === 'finance') {
        const allTransactions = await dataIntegrationService.getFinanceTransactions();
        setTransactions(allTransactions);
      }

      // Sync local storage data to Supabase if user is admin
      if (user?.role === 'admin') {
        await dataIntegrationService.syncLocalStorageToSupabase();
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error Loading Data',
        description: 'Failed to load application data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests based on current filters and user permissions
  const filteredRequests = requests.filter(request => {
    // Role-based filtering
    if (currentUser?.role === 'doctor') {
      // Doctors see only their requests or requests in their specialty
      if (request.created_by !== currentUser.id && 
          request.assigned_to !== currentUser.id && 
          request.specialty !== currentUser.specialty) {
        return false;
      }
    } else if (currentUser?.role === 'nurse' || currentUser?.role === 'hospital') {
      // Hospital staff see only requests from their hospital
      if (request.hospital_code !== currentUser.hospital_code) {
        return false;
      }
    } else if (currentUser?.role === 'case-coordinator') {
      // Case coordinators see requests assigned to them or from their hospital
      if (request.assigned_to !== currentUser.id && 
          request.hospital_code !== currentUser.hospital_code) {
        return false;
      }
    } else if (currentUser?.role === 'finance') {
      // Finance sees only requests from their hospital (for billing)
      if (request.hospital_code !== currentUser.hospital_code) {
        return false;
      }
    }
    // Admin sees all requests

    // Apply additional filters
    if (filters.startDate && request.request_date < filters.startDate) return false;
    if (filters.endDate && request.request_date > filters.endDate) return false;
    if (filters.hospital && request.hospital_code !== filters.hospital) return false;
    if (filters.specialty && request.specialty !== filters.specialty) return false;
    if (filters.status && request.status !== filters.status) return false;
    if (filters.assignedTo && request.assigned_to !== filters.assignedTo) return false;

    return true;
  });

  // Create new request
  const createRequest = async (requestData: Omit<IntegratedRequest, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to create requests',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const newRequest = await dataIntegrationService.createMedicalRequest({
        ...requestData,
        created_by: currentUser.id
      });

      if (newRequest) {
        setRequests(prev => [newRequest, ...prev]);
        toast({
          title: 'Request Created',
          description: `Request for ${requestData.patient_name} has been created successfully`
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: 'Error Creating Request',
        description: 'Failed to create the request',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Update request
  const updateRequest = async (requestId: string, updates: Partial<IntegratedRequest>) => {
    try {
      const success = await dataIntegrationService.updateMedicalRequest(requestId, updates);
      
      if (success) {
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, ...updates } : req
        ));
        toast({
          title: 'Request Updated',
          description: 'Request has been updated successfully'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error Updating Request',
        description: 'Failed to update the request',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Import Excel data
  const importExcelData = async (excelData: any[]) => {
    if (!currentUser?.role || !['admin', 'case-coordinator'].includes(currentUser.role)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to import data',
        variant: 'destructive'
      });
      return { success: 0, errors: ['Permission denied'] };
    }

    try {
      const results = await dataIntegrationService.importExcelData(excelData);
      
      if (results.success > 0) {
        // Reload requests to show imported data
        const updatedRequests = await dataIntegrationService.getAllMedicalRequests();
        setRequests(updatedRequests);
        
        // Clear local storage to avoid conflicts
        requestStorage.clearAllData();
        
        toast({
          title: 'Import Successful',
          description: `${results.success} requests imported successfully`
        });
      }
      
      if (results.errors.length > 0) {
        console.error('Import errors:', results.errors);
      }
      
      return results;
    } catch (error) {
      console.error('Error importing Excel data:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import Excel data',
        variant: 'destructive'
      });
      return { success: 0, errors: ['Import failed'] };
    }
  };

  // Update payment status
  const updatePaymentStatus = async (transactionId: string, status: 'pending' | 'paid' | 'failed') => {
    if (!currentUser?.role || !['admin', 'finance'].includes(currentUser.role)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to update payment status',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const success = await dataIntegrationService.updatePaymentStatus(transactionId, status);
      
      if (success) {
        setTransactions(prev => prev.map(txn => 
          txn.id === transactionId ? { ...txn, payment_status: status } : txn
        ));
        toast({
          title: 'Payment Status Updated',
          description: `Payment status updated to ${status}`
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Error Updating Payment',
        description: 'Failed to update payment status',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Get analytics data
  const getAnalytics = async (analyticsFilters?: DataFilters) => {
    try {
      return await dataIntegrationService.getAnalyticsData(analyticsFilters);
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  };

  // Update filters
  const updateFilters = (newFilters: Partial<DataFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
  };

  return {
    // State
    currentUser,
    users,
    requests: filteredRequests,
    allRequests: requests,
    transactions,
    isLoading,
    filters,
    
    // Actions
    loadAllData,
    createRequest,
    updateRequest,
    importExcelData,
    updatePaymentStatus,
    getAnalytics,
    updateFilters,
    clearFilters,
    
    // Utils
    canCreateRequests: currentUser?.role && ['admin', 'doctor', 'nurse', 'case-coordinator'].includes(currentUser.role),
    canViewFinance: currentUser?.role && ['admin', 'finance'].includes(currentUser.role),
    canManageUsers: currentUser?.role === 'admin',
    canImportData: currentUser?.role && ['admin', 'case-coordinator'].includes(currentUser.role)
  };
}