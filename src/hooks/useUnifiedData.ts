import { useState, useEffect } from 'react';
import { dataIntegrationService, UnifiedRequest } from '@/services/dataIntegrationService';
import { requestStorage } from '@/services/requestStorage';

export interface UnifiedDataHook {
  requests: UnifiedRequest[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getRequestsByRole: (role: string, userInfo?: any) => UnifiedRequest[];
  getAnalyticsData: () => any[];
}

export function useUnifiedData(): UnifiedDataHook {
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Initialize sample data if needed
      requestStorage.initializeSampleData();
      
      // Get unified requests from all sources
      const unifiedRequests = await dataIntegrationService.getAllUnifiedRequests();
      
      console.log(`Loaded ${unifiedRequests.length} unified requests`);
      setRequests(unifiedRequests);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      console.error('Error loading unified data:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests based on user role and permissions
  const getRequestsByRole = (role: string, userInfo?: any): UnifiedRequest[] => {
    return requests.filter(request => {
      switch (role.toLowerCase()) {
        case 'admin':
          return true; // Admins see all requests
          
        case 'doctor':
          return request.doctorName === userInfo?.name || 
                 request.specialty === userInfo?.specialty;
                 
        case 'nurse':
          return request.hospitalName === userInfo?.hospital;
          
        case 'case-coordinator':
          return request.assignedCoordinator === userInfo?.name ||
                 request.hospitalName === userInfo?.hospital;
                 
        case 'hospital':
          return request.hospitalName === userInfo?.hospital;
          
        case 'finance':
          return request.hospitalName === userInfo?.hospital;
          
        default:
          return false;
      }
    });
  };

  // Get data formatted for analytics
  const getAnalyticsData = () => {
    return dataIntegrationService.getAnalyticsData();
  };

  // Initialize data on mount
  useEffect(() => {
    refreshData();
    
    // Listen for data updates
    const handleDataUpdate = () => {
      console.log('Data updated, refreshing unified data...');
      refreshData();
    };
    
    window.addEventListener('requestsUpdated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);
    window.addEventListener('adminDataCleared', handleDataUpdate);
    
    return () => {
      window.removeEventListener('requestsUpdated', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
      window.removeEventListener('adminDataCleared', handleDataUpdate);
    };
  }, []);

  return {
    requests,
    isLoading,
    error,
    refreshData,
    getRequestsByRole,
    getAnalyticsData
  };
}