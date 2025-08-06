import { useState, useEffect } from 'react';
import { Transaction } from '@/types/finance';

interface FinanceAnalyticsData {
  id: string;
  category: string;
  type: string;
  [key: string]: string | number;
}

export const useFinanceAnalyticsSync = () => {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [analyticsData, setAnalyticsData] = useState<FinanceAnalyticsData[]>([]);

  // Load analytics data and selected years to determine selected months
  useEffect(() => {
    const loadAnalyticsData = () => {
      try {
        const data = localStorage.getItem('financeAnalyticsData');
        const selectedYears = localStorage.getItem('financeSelectedYears');
        
        if (data) {
          const parsedData = JSON.parse(data);
          setAnalyticsData(parsedData);
          
          // Get filtered months based on selected years
          const years = selectedYears ? JSON.parse(selectedYears) : ['2023', '2024', '2025'];
          const allMonths = Object.keys(parsedData[0] || {}).filter(key => 
            key !== 'id' && key !== 'category' && key !== 'type'
          );
          
          const filteredMonths = allMonths.filter(month => {
            const year = month.split('-')[1];
            return year && years.includes(`20${year}`);
          });
          
          setSelectedMonths(filteredMonths);
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    };

    loadAnalyticsData();

    // Listen for updates
    const handleAnalyticsUpdate = () => {
      loadAnalyticsData();
    };

    window.addEventListener('financeAnalyticsUpdated', handleAnalyticsUpdate);
    window.addEventListener('financeYearsUpdated', handleAnalyticsUpdate);

    return () => {
      window.removeEventListener('financeAnalyticsUpdated', handleAnalyticsUpdate);
      window.removeEventListener('financeYearsUpdated', handleAnalyticsUpdate);
    };
  }, []);

  // Generate transactions from analytics data
  const generateTransactionsFromAnalytics = (): Transaction[] => {
    const transactions: Transaction[] = [];
    
    analyticsData.forEach((row, rowIndex) => {
      // Skip calculation rows
      if (row.category && row.type && 
          !['Total', 'Achievement', 'YTD Growth', 'MTD Growth', 'Year over Year Change'].includes(row.category) &&
          !['Achievement', 'YTD Growth', 'MTD Growth', 'Year over Year Change'].includes(row.type)) {
        
        selectedMonths.forEach((month) => {
          const value = row[month];
          if (value && value !== '' && !isNaN(Number(value))) {
            const amount = Number(value);
            if (amount > 0) {
              const [monthName, year] = month.split('-');
              const monthNum = getMonthNumber(monthName);
              
              transactions.push({
                id: `${row.id}-${month}-${Math.random().toString(36).substr(2, 9)}`,
                patientName: `Patient ${rowIndex + 1} - ${monthName}`,
                serviceDescription: `${row.category} - ${row.type || 'Service'}`,
                hospital: row.category,
                doctor: `Dr. ${row.category} ${monthName}`,
                specialty: row.type || 'General',
                amount: `₹${amount.toLocaleString()}`,
                status: getRandomStatus(amount),
                date: `20${year}-${monthNum.toString().padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
              });
            }
          }
        });
      }
    });
    
    return transactions;
  };

  const getMonthNumber = (monthName: string): number => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthName) + 1;
  };

  const getRandomStatus = (amount: number): string => {
    // Higher amounts more likely to be paid
    const rand = Math.random();
    if (amount > 300) {
      return rand > 0.3 ? "Paid" : rand > 0.15 ? "Pending" : "Delay Payment";
    } else if (amount > 150) {
      return rand > 0.5 ? "Paid" : rand > 0.25 ? "Pending" : "Delay Payment";
    } else {
      return rand > 0.6 ? "Paid" : rand > 0.4 ? "Pending" : "Delay Payment";
    }
  };

  return {
    selectedMonths,
    analyticsData,
    generateTransactionsFromAnalytics
  };
};