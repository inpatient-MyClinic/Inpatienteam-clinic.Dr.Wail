
import { useState, useEffect } from 'react';
import { Transaction, StatusCounts } from '@/types/finance';
import { initialTransactions } from '@/data/financeData';
import { savePaymentUpdateToSystem, loadSystemPaymentUpdates } from '@/utils/financeUtils';
import { useToast } from '@/hooks/use-toast';
import { useFinanceAnalyticsSync } from './useFinanceAnalyticsSync';

export const useFinanceDashboard = () => {
  const { generateTransactionsFromAnalytics } = useFinanceAnalyticsSync();
  
  // Check if data was cleared and initialize accordingly
  const getInitialTransactions = () => {
    const dataCleared = localStorage.getItem('sample_data_cleared') === 'true';
    if (dataCleared) return [];
    
    // Try to load from analytics data first
    const analyticsTransactions = generateTransactionsFromAnalytics();
    if (analyticsTransactions.length > 0) {
      return analyticsTransactions;
    }
    
    return initialTransactions;
  };
  
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions());
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Load system payment updates on component mount and listen for analytics updates
  useEffect(() => {
    // Check if data was cleared
    const dataCleared = localStorage.getItem('sample_data_cleared') === 'true';
    
    if (dataCleared) {
      setTransactions([]);
      return;
    }
    
    const systemUpdates = loadSystemPaymentUpdates();
    if (Object.keys(systemUpdates).length > 0) {
      setTransactions(prev => prev.map(transaction => {
        if (systemUpdates[transaction.id]) {
          return { ...transaction, status: systemUpdates[transaction.id].status };
        }
        return transaction;
      }));
      console.log('Loaded payment updates from system:', Object.keys(systemUpdates).length);
    }
    
    // Listen for analytics data updates
    const handleAnalyticsDataUpdate = () => {
      try {
        const generatedTransactions = generateTransactionsFromAnalytics();
        if (generatedTransactions.length > 0) {
          setTransactions(generatedTransactions);
        }
      } catch (error) {
        console.error('Error updating transactions from analytics:', error);
      }
    };
    
    // Listen for data clear events
    const handleDataCleared = () => {
      setTransactions([]);
    };
    
    window.addEventListener('financeDataCleared', handleDataCleared);
    window.addEventListener('financeAnalyticsUpdated', handleAnalyticsDataUpdate);
    window.addEventListener('financeYearsUpdated', handleAnalyticsDataUpdate);
    
    return () => {
      window.removeEventListener('financeDataCleared', handleDataCleared);
      window.removeEventListener('financeAnalyticsUpdated', handleAnalyticsDataUpdate);
      window.removeEventListener('financeYearsUpdated', handleAnalyticsDataUpdate);
    };
  }, []);

  // Enhanced filtering logic
  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = !activeStatusFilter || transaction.status === activeStatusFilter;
    const matchesStatusFilter = statusFilter === "all" || transaction.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === "all" || 
      (paymentStatusFilter === "paid" && transaction.status === "Paid") ||
      (paymentStatusFilter === "not-paid" && transaction.status !== "Paid");
    const matchesHospital = hospitalFilter === "all" || 
      transaction.hospital.toLowerCase().includes(hospitalFilter.toLowerCase());
    const matchesDoctor = doctorFilter === "all" || 
      transaction.doctor.toLowerCase().includes(doctorFilter.toLowerCase());
    
    return matchesStatus && matchesStatusFilter && matchesPaymentStatus && matchesHospital && matchesDoctor;
  });

  // Calculate status counts
  const statusCounts: StatusCounts = {
    paid: transactions.filter(t => t.status === "Paid").length,
    pending: transactions.filter(t => t.status === "Pending").length,
    delayPayment: transactions.filter(t => t.status === "Delay Payment").length
  };

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    activeStatusFilter ||
    dateFilter !== "all" ||
    statusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    hospitalFilter !== "all" ||
    doctorFilter !== "all"
  );

  const handleStatusIconClick = (status: string | null) => {
    setActiveStatusFilter(status);
  };

  const handleClearAllFilters = () => {
    setActiveStatusFilter(null);
    setDateFilter("all");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setHospitalFilter("all");
    setDoctorFilter("all");
  };

  const handleUpdatePaymentStatus = (id: string, isPaid: boolean) => {
    const newStatus = isPaid ? "Paid" : "Pending";
    
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id 
          ? { ...transaction, status: newStatus }
          : transaction
      )
    );
    
    // Save to global system
    savePaymentUpdateToSystem(id, newStatus);
    
    toast({
      title: isPaid ? "Payment Confirmed" : "Payment Status Updated",
      description: `Transaction ${id} has been marked as ${newStatus} and updated system-wide`,
    });
  };

  const handleBulkUpdatePayments = (ids: string[]) => {
    setTransactions(prev =>
      prev.map(transaction =>
        ids.includes(transaction.id)
          ? { ...transaction, status: "Paid" }
          : transaction
      )
    );
    
    // Save all updates to global system
    ids.forEach(id => savePaymentUpdateToSystem(id, "Paid"));
    
    toast({
      title: "Bulk Update Completed",
      description: `${ids.length} transactions updated from Excel upload and reflected system-wide`,
    });
  };

  const handleExportToExcel = () => {
    console.log("Exporting finance data to Excel");
  };

  const handlePrint = () => {
    window.print();
  };

  return {
    transactions,
    filteredTransactions,
    statusCounts,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    hospitalFilter,
    setHospitalFilter,
    doctorFilter,
    setDoctorFilter,
    activeStatusFilter,
    hasActiveFilters,
    handleStatusIconClick,
    handleClearAllFilters,
    handleUpdatePaymentStatus,
    handleBulkUpdatePayments,
    handleExportToExcel,
    handlePrint
  };
};
