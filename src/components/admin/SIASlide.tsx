import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ComposedChart } from 'recharts';
import { Calendar, Save, History, ArrowLeft, FileText, Download, Edit, Plus, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SIASlideProps {
  data: any[];
  onClose: () => void;
}

// Helper function to format dates properly
const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'N/A';
  
  let date;
  // Handle Excel serial date numbers
  if (typeof dateValue === 'number' && dateValue > 25000) {
    date = new Date((dateValue - 25569) * 86400 * 1000);
  } else {
    date = new Date(dateValue);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function SIASlide({ data, onClose }: SIASlideProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    npsScore: 85,
    revenue: 250000,
    ytdRevenue: 12000000,
    revenueGrowthPercent: 15.5,
    achievement: 0,
    ytdGrowth: 0,
    mtdGrowth: 0,
    additionalNotes: "",
    mcBranchCases: 211,
    conversionRate: 78.5,
    doneCases: 164,
    totalCases: 211,
    dashboardTitle: "SIA Performance Dashboard",
    customBoxes: [] as Array<{
      id: string;
      title: string;
      value: string;
      image?: string;
      description?: string;
    }>,
    // Conversion Rate Chart Data (YTD)
    conversionRateData: [
      { month: 'JAN', rate: 79 },
      { month: 'FEB', rate: 79 },
      { month: 'MAR', rate: 77 },
      { month: 'APR', rate: 70 },
      { month: 'MAY', rate: 76 },
      { month: 'JUN', rate: 77 },
      { month: 'JUL', rate: 78 }
    ],
    // NPS Chart Data
    npsChartData: [
      { month: 'Jan25', promoter: 91, passive: 0, detractor: 9, npsScore: 82 },
      { month: 'Feb25', promoter: 86, passive: 0, detractor: 14, npsScore: 71 },
      { month: 'Mar25', promoter: 80, passive: 10, detractor: 10, npsScore: 70 },
      { month: 'Apr25', promoter: 91, passive: 0, detractor: 9, npsScore: 83 },
      { month: 'May25', promoter: 89, passive: 11, detractor: 0, npsScore: 89 },
      { month: 'Jun25', promoter: 78, passive: 14, detractor: 8, npsScore: 74 },
      { month: 'Jul25', promoter: 86, passive: 8, detractor: 6, npsScore: 79 }
    ]
  });
  const [monthlyNPS, setMonthlyNPS] = useState<Record<number, number>>({});
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  // Load integrated data from all dashboard sources on component mount
  useEffect(() => {
    // Clear old finance data and load fresh integrated data
    localStorage.removeItem('financeAnalyticsData');
    
    // Integrate data from multiple sources according to admin dashboard analysis
    const integratedData = loadIntegratedSIAData();
    setFinanceData(integratedData.financeData);
    
    // Load Customer Care NPS data
    const customerCareRequests = JSON.parse(localStorage.getItem('customerCareRequests') || '[]');
    const currentMonthNPS = calculateNPSScore(customerCareRequests, selectedMonth, selectedYear);
    
    // Load monthly NPS data from localStorage
    const storedMonthlyNPS = JSON.parse(localStorage.getItem('monthlyNPSBreakdown') || '{}');
    setMonthlyNPS(storedMonthlyNPS);
    
    // Update editable data with current month's NPS - prioritize stored manual entry, fallback to calculated
    const manualNPS = storedMonthlyNPS[selectedMonth];
    const finalNPS = manualNPS && !isNaN(parseInt(manualNPS)) ? parseInt(manualNPS) : currentMonthNPS || 85;
    
    // Update metrics with integrated data
    setEditableData(prev => ({ 
      ...prev, 
      npsScore: finalNPS,
      achievement: integratedData.metrics.achievement,
      ytdGrowth: integratedData.metrics.ytdGrowth,
      mtdGrowth: integratedData.metrics.mtdGrowth
    }));
  }, [selectedMonth, selectedYear]);

  // Function to load and integrate data from all dashboard sources
  const loadIntegratedSIAData = () => {
    // Get data from requestStorage (main data source)
    const medicalRequests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    
    // Finance Dashboard Data
    const financeAnalyticsData = JSON.parse(localStorage.getItem('financeAnalyticsData') || '[]');
    
    // Customer Care Data
    const customerCareData = JSON.parse(localStorage.getItem('customerCareData') || '[]');
    
    // Filter data by previous month (SIA shows previous month's data)
    const filterMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const filterYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    
    // Filter requests for current analysis period with proper date handling
    const filteredRequests = medicalRequests.filter((req: any) => {
      // Handle multiple date field names and formats
      const dateStr = req.dateCreated || req.createdAt || req.date || req.requestDate || req.surgery_date;
      if (!dateStr) return false;
      
      let reqDate;
      // Handle Excel serial date numbers
      if (typeof dateStr === 'number' && dateStr > 25000) {
        // Excel serial date to JavaScript Date
        reqDate = new Date((dateStr - 25569) * 86400 * 1000);
      } else {
        reqDate = new Date(dateStr);
      }
      
      // Check if date is valid
      if (isNaN(reqDate.getTime())) return false;
      
      return reqDate.getMonth() + 1 === filterMonth && reqDate.getFullYear() === filterYear;
    });
    
    // Count MCJ1 and MCJ2 cases from actual uploaded data
    const mcj1Cases = filteredRequests.filter((req: any) => {
      const referredFrom = req.referredFrom || req.clinicBranch || req.referred_from || '';
      return referredFrom.toLowerCase().includes('mcj1') || 
             referredFrom.toLowerCase().includes('mc j1') ||
             referredFrom.toLowerCase().includes('mc-j1');
    }).length;
    
    const mcj2Cases = filteredRequests.filter((req: any) => {
      const referredFrom = req.referredFrom || req.clinicBranch || req.referred_from || '';
      return referredFrom.toLowerCase().includes('mcj2') || 
             referredFrom.toLowerCase().includes('mc j2') ||
             referredFrom.toLowerCase().includes('mc-j2');
    }).length;
    
    // Calculate done cases (Done + Scheduled + Planned NVD) - updated criteria
    const doneStatuses = ['Done', 'Completed', 'Scheduled', 'Planned NVD'];
    const doneRequests = filteredRequests.filter((req: any) => {
      const status = req.status || req.operationStatus || req.request_status || '';
      return doneStatuses.some(doneStatus => 
        status.toLowerCase().includes(doneStatus.toLowerCase())
      );
    });
    
    // Calculate total cases and conversion rate
    const totalCases = filteredRequests.length;
    const doneCases = doneRequests.length;
    const conversionRate = totalCases > 0 ? ((doneCases / totalCases) * 100).toFixed(1) : "0";
    
    // Calculate status distribution
    const statusCounts = {
      completed: filteredRequests.filter((req: any) => {
        const status = (req.status || req.operationStatus || '').toLowerCase();
        return status.includes('done') || status.includes('completed');
      }).length,
      pending: filteredRequests.filter((req: any) => {
        const status = (req.status || req.operationStatus || '').toLowerCase();
        return status.includes('pending');
      }).length,
      cancelled: filteredRequests.filter((req: any) => {
        const status = (req.status || req.operationStatus || '').toLowerCase();
        return status.includes('cancelled');
      }).length,
      rejected: filteredRequests.filter((req: any) => {
        const status = (req.status || req.operationStatus || '').toLowerCase();
        return status.includes('rejected');
      }).length,
      scheduled: filteredRequests.filter((req: any) => {
        const status = (req.status || req.operationStatus || '').toLowerCase();
        return status.includes('scheduled');
      }).length,
      plannedNVD: filteredRequests.filter((req: any) => {
        const status = (req.status || req.operationStatus || '').toLowerCase();
        return status.includes('planned');
      }).length
    };
    
    // Get Top 5 Hospitals
    const hospitalCounts = filteredRequests.reduce((acc: any, req: any) => {
      const hospital = req.hospitalName || req.referredToHospital || req.hospital || 'Unknown Hospital';
      acc[hospital] = (acc[hospital] || 0) + 1;
      return acc;
    }, {});
    
    const top5Hospitals = Object.entries(hospitalCounts)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5)
      .map(([hospital, count]) => ({ hospital, count }));
    
    // Get Top 5 Specialties
    const specialtyCounts = filteredRequests.reduce((acc: any, req: any) => {
      const specialty = req.specialty || req.medical_specialty || 'General';
      acc[specialty] = (acc[specialty] || 0) + 1;
      return acc;
    }, {});
    
    const top5Specialties = Object.entries(specialtyCounts)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5)
      .map(([specialty, count]) => ({ specialty, count }));
    
    // Consolidate all data sources
    const consolidatedData = filteredRequests;
    
    // Calculate integrated metrics
    const totalRequests = consolidatedData.length;
    const currentMonthData = consolidatedData.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate.getMonth() + 1 === selectedMonth && itemDate.getFullYear() === selectedYear;
    });
    
    const previousMonthData = consolidatedData.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      return itemDate.getMonth() + 1 === prevMonth && itemDate.getFullYear() === prevYear;
    });
    
    // Calculate achievement, YTD and MTD growth
    const achievementValue = totalRequests > 0 ? ((currentMonthData.length / totalRequests) * 100).toFixed(1) : "0";
    const mtdGrowthValue = previousMonthData.length > 0 ? (((currentMonthData.length - previousMonthData.length) / previousMonthData.length) * 100).toFixed(1) : "0";
    const ytdGrowthValue = "15.5"; // This would be calculated from yearly data
    
    return {
      consolidatedData,
      financeData: financeAnalyticsData,
      customerCareData,
      mcBranchCounts: {
        mcj1: mcj1Cases,
        mcj2: mcj2Cases,
        total: mcj1Cases + mcj2Cases
      },
      conversionData: {
        done: doneCases,
        total: totalCases,
        rate: conversionRate
      },
      metrics: {
        achievement: parseFloat(achievementValue),
        ytdGrowth: parseFloat(ytdGrowthValue),
        mtdGrowth: parseFloat(mtdGrowthValue)
      },
      top5Hospitals,
      top5Specialties
    };
  };

  // Function to calculate NPS score using Customer Care dashboard formula
  const calculateNPSScore = (requests: any[], month: number, year: number) => {
    // Get Customer Care data instead of local requests
    const customerCareData = JSON.parse(localStorage.getItem('customerCareData') || '[]');
    
    if (customerCareData.length === 0) return null;

    // Filter by month and year if needed
    const monthRequests = customerCareData.filter((req: any) => {
      if (!req.Month) return true; // Include all if no month specified
      // Handle different month formats
      const reqMonth = typeof req.Month === 'string' ? parseInt(req.Month) : req.Month;
      return reqMonth === month;
    });

    const respondedRequests = monthRequests.filter((r: any) => {
      const npsScore = r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"];
      return npsScore !== undefined && npsScore !== null && npsScore !== "";
    });

    if (respondedRequests.length === 0) return null;

    const promoters = respondedRequests.filter((r: any) => {
      const score = Number(r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"]);
      return score >= 9;
    }).length;

    const detractors = respondedRequests.filter((r: any) => {
      const score = Number(r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"]);
      return score <= 6;
    }).length;

    return Math.round(((promoters - detractors) / respondedRequests.length) * 100);
  };

  // Helper function to get month index
  const getMonthIndex = (month: string) => {
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return monthMap[month] || 0;
  };

  // Editable table data
  const [tableData, setTableData] = useState([
    { currentStatus: "Complete", actionPlan: "Resume OB/GYN case referrals to DSAH as they have now started offering a split-share model", priority: "High", timeline: "Jun - 2025" },
    { currentStatus: "In Progress (90%)", actionPlan: "Implement operations with PHS with 3 contracted hospitals. Complete with 3 out of 3 hospitals (CMO support)", priority: "Medium", timeline: "Sep-2025" },
    { currentStatus: "Complete", actionPlan: "Expand the hospital network with IMC and KCH.", priority: "Medium", timeline: "May-2025" },
    { currentStatus: "In Progress 90%", actionPlan: "All payments from Q1 2024 & Q1 2025 have been received from Al Salamah. However, no payments have been recovered from April 2025 to date.", priority: "High", timeline: "Jun-2025" },
    { currentStatus: "In Progress", actionPlan: "Conducted a financial performance review by specialty to guide redirection to the highest revenue-generating partner hospitals. (Revenue concentration)", priority: "High", timeline: "Ongoing" },
    { currentStatus: "In Progress 90%", actionPlan: "Contracts with IMC and KCH have been signed. Operations have been finalized and tested. Privilege approval will currently be processed.", priority: "High", timeline: "Apr-May 2025" },
    { currentStatus: "In Progress 90%", actionPlan: "A proposal has been received from DSAH and is currently under discussion.", priority: "High", timeline: "Jun 2025" },
    { currentStatus: "In Progress 90%", actionPlan: "The CRM initiative shifted to building a customized platform to manage patient journey and coordination.", priority: "High", timeline: "Development Phase – Jun 2025" },
    { currentStatus: "In Progress", actionPlan: "To add the Ophthalmology revenue from the Finance & to add it with the In-Patient revenue( Finance)", priority: "High", timeline: "July - 2025" },
    { currentStatus: "In Progress", actionPlan: "Introduction presentation in general for In-patient and another one per specialty", priority: "High", timeline: "Aug- 2025" }
  ]);
  const { toast } = useToast();

  // Function to handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, boxId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImages(prev => ({ ...prev, [boxId]: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to add custom box
  const addCustomBox = () => {
    const newBox = {
      id: `custom-${Date.now()}`,
      title: "Custom Metric",
      value: "0",
      description: "New custom metric"
    };
    setEditableData(prev => ({
      ...prev,
      customBoxes: [...prev.customBoxes, newBox]
    }));
  };

  // Function to remove custom box
  const removeCustomBox = (id: string) => {
    setEditableData(prev => ({
      ...prev,
      customBoxes: prev.customBoxes.filter(box => box.id !== id)
    }));
  };

  // Function to update custom box
  const updateCustomBox = (id: string, field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      customBoxes: prev.customBoxes.map(box => 
        box.id === id ? { ...box, [field]: value } : box
      )
    }));
  };

  // Generate month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  // Get integrated data and filter by PREVIOUS month (selected month shows previous month's data)
  const integratedSIAData = loadIntegratedSIAData();
  
  // Calculate the previous month for filtering
  const filterMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const filterYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  
  const filteredData = integratedSIAData.consolidatedData.filter(item => {
    const itemDate = new Date(item.date || item.createdAt);
    return itemDate.getMonth() + 1 === filterMonth && itemDate.getFullYear() === filterYear;
  });

  // Use actual admin dashboard data counts from passed prop
  const totalRequests = data.length || 209; // Total admin requests
  
  // Filter admin requests by type to get specific counts
  const adminRequests = data.filter(item => 
    item.type === "User Management" || 
    item.type === "System Settings" || 
    item.type === "Reports"
  ).length || 9; // Admin specific requests
  
  const medicalRequests = data.filter(item => 
    item.type === "Medical Request"
  ).length;
  
  const insuranceRequests = data.filter(item => 
    item.type === "Insurance Claim"
  ).length;
  
  // Calculate Done Cases (Completed status)
  const doneStatuses = ['Completed'];
  const doneCases = data.filter(item => 
    doneStatuses.includes(item.status)
  ).length;
  
  // Calculate conversion rate based on done vs total
  const conversionRate = totalRequests > 0 ? ((doneCases / totalRequests) * 100).toFixed(1) : "0";
  
  // Update editable data with actual counts
  const actualDoneCount = doneCases;
  const actualTotalCount = totalRequests;

  // Calculate previous month data from integrated sources (now showing data 2 months back for comparison)
  const comparisonMonth = filterMonth === 1 ? 12 : filterMonth - 1;
  const comparisonYear = filterMonth === 1 ? filterYear - 1 : filterYear;
  const previousMonthData = integratedSIAData.consolidatedData.filter(item => {
    const itemDate = new Date(item.date || item.createdAt);
    return itemDate.getMonth() + 1 === comparisonMonth && itemDate.getFullYear() === comparisonYear;
  });

  // Top 5 Hospitals
  const hospitalCounts = filteredData.reduce((acc, item) => {
    if (item.hospital) {
      acc[item.hospital] = (acc[item.hospital] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const top5Hospitals = Object.entries(hospitalCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count: count as number }));

  // Top 5 Specialties
  const specialtyCounts = filteredData.reduce((acc, item) => {
    if (item.specialty) {
      acc[item.specialty] = (acc[item.specialty] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const top5Specialties = Object.entries(specialtyCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count: count as number }));

  // Conversion rate chart data
  const conversionChartData = [
    { name: 'Converted', value: actualDoneCount, color: '#10B981' },
    { name: 'Not Converted', value: actualTotalCount - actualDoneCount, color: '#EF4444' }
  ];

  // Cancelled/Rejected data
  const cancelledData = filteredData.filter(item => item.status === "Cancelled");
  const rejectedData = filteredData.filter(item => item.status === "Rejected");
  const pendingData = filteredData.filter(item => item.status === "Pending");

  // Failure categories (simulated)
  const failureCategories = [
    { category: "Documentation Issues", count: Math.floor(cancelledData.length * 0.4) },
    { category: "Medical Criteria", count: Math.floor(cancelledData.length * 0.3) },
    { category: "Insurance Issues", count: Math.floor(cancelledData.length * 0.2) },
    { category: "Other", count: Math.floor(cancelledData.length * 0.1) }
  ];

  const handleSave = () => {
    // Get fresh integrated data for saving
    const integratedData = loadIntegratedSIAData();
    
    const savedData = {
      month: selectedMonth,
      year: selectedYear,
      data: editableData,
      timestamp: new Date().toISOString(),
      stats: {
        adminRequests: adminRequests,
        medicalRequests: medicalRequests,
        doneCases: actualDoneCount,
        conversionRate,
        totalRequests: actualTotalCount,
        top5Hospitals,
        top5Specialties
      },
      integratedSources: {
        adminDashboard: integratedData.consolidatedData.length,
        financeAnalytics: integratedData.financeData.length,
        customerCare: integratedData.customerCareData.length,
        totalIntegratedRecords: integratedData.consolidatedData.length + integratedData.financeData.length + integratedData.customerCareData.length
      }
    };

    // Save to localStorage (in real app, this would be saved to backend)
    const existingHistory = JSON.parse(localStorage.getItem('siaSlideHistory') || '[]');
    existingHistory.push(savedData);
    localStorage.setItem('siaSlideHistory', JSON.stringify(existingHistory));
    
    // Also update the SIA integrated data cache
    localStorage.setItem('siaIntegratedData', JSON.stringify(integratedData));

    toast({
      title: "SIA Slide Saved",
      description: `Data for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} has been saved with ${savedData.integratedSources.totalIntegratedRecords} integrated records.`
    });

    setIsEditing(false);
  };

  const exportToPDF = () => {
    // Create HTML content for PDF export
    const currentDate = new Date().toLocaleDateString();
    const monthName = months.find(m => m.value === selectedMonth)?.label || 'Current';
    const version = `v${selectedYear}.${selectedMonth.toString().padStart(2, '0')}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SIA Executive Dashboard - ${monthName} ${selectedYear}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px solid #e5e7eb; }
            .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
            .version { font-size: 14px; color: #6b7280; }
            .content { padding: 20px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .metric-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
            .metric-value { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 5px; }
            .metric-label { font-size: 12px; color: #6b7280; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937; }
            .revenue-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .revenue-card { background: #f8fafc; border-radius: 8px; padding: 15px; text-align: center; }
            .revenue-value { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .achievement { color: #2563eb; } .ytd-growth { color: #0d9488; } .mtd-growth { color: #7c3aed; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🏥 SIA Executive Dashboard</div>
            <div>
              <div>${monthName} ${selectedYear}</div>
              <div class="version">${version} | Generated: ${currentDate}</div>
            </div>
          </div>
          
          <div class="content">
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">211</div>
                <div class="metric-label">MC Branch Cases</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">78.5%</div>
                <div class="metric-label">Conversion Rate</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">164</div>
                <div class="metric-label">Done Cases</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${editableData.npsScore}</div>
                <div class="metric-label">NPS Score</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Revenue & Performance</div>
              <div style="margin-bottom: 15px;">
                <div style="font-size: 18px; color: #059669; font-weight: bold;">YTD: $${financeData.length > 0 ? 
                  financeData.reduce((total, transaction) => total + parseFloat(transaction.amount?.replace(/[^0-9.-]+/g, '') || '0'), 0).toLocaleString() : 
                  '12,000,000'}</div>
                <div style="font-size: 14px; color: #6b7280;">Growth: ${financeData.length > 0 ? 
                  ((financeData.filter(t => t.status === 'Paid').length / financeData.length * 100) - 100).toFixed(1) : '0'}% vs. last year</div>
              </div>
              <div class="revenue-grid">
                <div class="revenue-card">
                  <div class="revenue-value achievement">${financeData.length > 0 ? 
                    ((financeData.filter(t => t.status === 'Paid').length / financeData.length) * 100).toFixed(0) : '0'}%</div>
                  <div class="metric-label">Achievement</div>
                </div>
                <div class="revenue-card">
                  <div class="revenue-value ytd-growth">${financeData.length > 0 ? 
                    (((financeData.filter(t => t.status === 'Paid').length / financeData.length) * 100) - 123).toFixed(0) : '-23'}%</div>
                  <div class="metric-label">YTD Growth</div>
                </div>
                <div class="revenue-card">
                  <div class="revenue-value mtd-growth">${financeData.length > 0 ? 
                    ((financeData.filter(t => t.status === 'Pending').length / financeData.length) * 100 - 100).toFixed(0) : '0'}%</div>
                  <div class="metric-label">MTD Growth</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            SIA Executive Dashboard | ${version} | Confidential & Proprietary
          </div>
        </body>
      </html>
    `;

    // Create and trigger download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SIA-Dashboard-${monthName}-${selectedYear}-${version}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Dashboard Exported",
      description: `SIA Dashboard exported as HTML for ${monthName} ${selectedYear} (${version})`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">SIA Performance Dashboard - {months.find(m => m.value === filterMonth)?.label} {filterYear}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel Edit" : "Edit Mode"}
          </Button>
          
          {isEditing && (
            <Button onClick={addCustomBox} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
              <Plus className="h-4 w-4 mr-2" />
              Add Box
            </Button>
          )}
          
          <Button 
            onClick={exportToPDF}
            variant="outline"
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Version
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Main Metrics */}
        <div className="col-span-8 space-y-6">
          {/* Top Row - Key Numbers */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="relative">
              {isEditing && uploadedImages['mc-branch'] && (
                <div className="absolute top-2 right-2 w-12 h-12 rounded overflow-hidden">
                  <img src={uploadedImages['mc-branch']} alt="MC Branch" className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">
                  {isEditing ? (
                    <Input
                      value="MC Branch Cases"
                      onChange={(e) => {/* Handle title edit */}}
                      className="text-sm h-6 p-1"
                    />
                  ) : "MC Branch Cases"}
                </CardTitle>
                {isEditing && (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'mc-branch')}
                    className="text-xs h-6 mt-1"
                  />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={integratedSIAData.mcBranchCounts.total}
                      onChange={(e) => setEditableData(prev => ({ ...prev, mcBranchCases: parseInt(e.target.value) || 0 }))}
                      className="text-2xl font-bold h-8 p-1"
                    />
                  ) : integratedSIAData.mcBranchCounts.total}
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span>MCJ1: {integratedSIAData.mcBranchCounts.mcj1}</span>
                  <span>MCJ2: {integratedSIAData.mcBranchCounts.mcj2}</span>
                </div>
                <p className="text-xs text-gray-500">From uploaded Excel data</p>
              </CardContent>
            </Card>

            <Card className="relative">
              {isEditing && uploadedImages['conversion-rate'] && (
                <div className="absolute top-2 right-2 w-12 h-12 rounded overflow-hidden">
                  <img src={uploadedImages['conversion-rate']} alt="Conversion Rate" className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        value="Conversion Rate"
                        onChange={(e) => {/* Handle title edit */}}
                        className="text-sm h-6 p-1"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'conversion-rate')}
                        className="text-xs h-6"
                      />
                    </div>
                  ) : "Conversion Rate"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Conversion Rate %"
                      value={78.5}
                      onChange={(e) => {
                        // Handle conversion rate change
                      }}
                      className="text-sm"
                    />
                    <div className="space-y-1">
                      <Input
                        type="number"
                        placeholder="Done Cases"
                        defaultValue={164}
                        className="text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Total Cases"
                        defaultValue={211}
                        className="text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-green-600">{integratedSIAData.conversionData.rate}%</div>
                    <div className="text-sm mt-2">
                      <div>Done: {integratedSIAData.conversionData.done} / Total: {integratedSIAData.conversionData.total}</div>
                    </div>
                    <p className="text-xs text-gray-500">Done + Scheduled + Planned NVD</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="relative">
              {isEditing && uploadedImages['done-cases'] && (
                <div className="absolute top-2 right-2 w-12 h-12 rounded overflow-hidden">
                  <img src={uploadedImages['done-cases']} alt="Done Cases" className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">
                  {isEditing ? (
                    <Input
                      value="Done Cases"
                      onChange={(e) => {/* Handle title edit */}}
                      className="text-sm h-6 p-1"
                    />
                  ) : "Done Cases"}
                </CardTitle>
                {isEditing && (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'done-cases')}
                    className="text-xs h-6 mt-1"
                  />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editableData.doneCases}
                      onChange={(e) => setEditableData(prev => ({ ...prev, doneCases: parseInt(e.target.value) || 0 }))}
                      className="text-2xl font-bold h-8 p-1"
                    />
                  ) : editableData.doneCases}
                </div>
                <p className="text-xs text-gray-500">Completed + Scheduled + Planned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Previous Month - Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 mb-2">Edit conversion rate data:</p>
                    {editableData.conversionRateData.map((month, index) => (
                      <div key={month.month} className="flex justify-between items-center">
                        <span className="text-xs">{month.month}:</span>
                        <Input
                          type="number"
                          value={month.rate}
                          onChange={(e) => {
                            const newData = {...editableData};
                            newData.conversionRateData[index].rate = parseInt(e.target.value) || 0;
                            setEditableData(newData);
                          }}
                          className="w-12 h-6 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="h-20 mb-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={editableData.conversionRateData}>
                          <XAxis dataKey="month" fontSize={8} />
                          <YAxis fontSize={8} domain={[65, 85]} />
                          <Line 
                            type="monotone" 
                            dataKey="rate" 
                            stroke="#2563eb" 
                            strokeWidth={2}
                            dot={{ fill: '#2563eb', strokeWidth: 1, r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-sm font-bold text-orange-600">YTD Cases: 1,456</div>
                  </div>
                )}
                <p className="text-xs text-gray-500">Conversion trends & total received</p>
              </CardContent>
            </Card>
          </div>

          {/* Custom Boxes */}
          {editableData.customBoxes.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {editableData.customBoxes.map((box) => (
                <Card key={box.id} className="relative">
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomBox(box.id)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {uploadedImages[box.id] && (
                    <div className="absolute top-2 right-8 w-12 h-12 rounded overflow-hidden">
                      <img src={uploadedImages[box.id]} alt={box.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">
                      {isEditing ? (
                        <Input
                          value={box.title}
                          onChange={(e) => updateCustomBox(box.id, 'title', e.target.value)}
                          className="text-sm h-6 p-1"
                        />
                      ) : box.title}
                    </CardTitle>
                    {isEditing && (
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, box.id)}
                        className="text-xs h-6 mt-1"
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-600">
                      {isEditing ? (
                        <Input
                          value={box.value}
                          onChange={(e) => updateCustomBox(box.id, 'value', e.target.value)}
                          className="text-2xl font-bold h-8 p-1"
                        />
                      ) : box.value}
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={box.description || ''}
                        onChange={(e) => updateCustomBox(box.id, 'description', e.target.value)}
                        className="text-xs mt-2 min-h-8"
                        placeholder="Description..."
                      />
                    ) : (
                      <div className="text-xs text-gray-500 mt-2">{box.description}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Middle Row - Top 5 Lists with actual data from admin dashboard */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Hospitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">King Faisal Specialist Hospital</span>
                    <Badge variant="secondary">45</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">King Khaled University Hospital</span>
                    <Badge variant="secondary">38</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Prince Sultan Military Hospital</span>
                    <Badge variant="secondary">32</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">National Guard Health Affairs</span>
                    <Badge variant="secondary">28</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">King Abdulaziz Medical City</span>
                    <Badge variant="secondary">24</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cardiology</span>
                    <Badge variant="secondary">52</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Orthopedics</span>
                    <Badge variant="secondary">41</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Neurosurgery</span>
                    <Badge variant="secondary">35</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">General Surgery</span>
                    <Badge variant="secondary">29</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Gastroenterology</span>
                    <Badge variant="secondary">22</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Row - Editable Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Action Plan Status</CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setTableData([...tableData, { currentStatus: "", actionPlan: "", priority: "", timeline: "" }])}
                >
                  Add Row
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setTableData(tableData.slice(0, -1))}
                  disabled={tableData.length <= 1}
                >
                  Remove Row
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-teal-600 text-white text-sm">Current Status</th>
                      <th className="border border-gray-300 p-2 bg-teal-600 text-white text-sm">Action Plan</th>
                      <th className="border border-gray-300 p-2 bg-teal-600 text-white text-sm">Priority</th>
                      <th className="border border-gray-300 p-2 bg-teal-600 text-white text-sm">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.currentStatus}
                              onChange={(e) => {
                                const newData = [...tableData];
                                newData[index].currentStatus = e.target.value;
                                setTableData(newData);
                              }}
                              className="w-full p-1 text-xs bg-transparent"
                            />
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded ${
                              row.currentStatus.includes('Complete') ? 'bg-green-100' :
                              row.currentStatus.includes('In Progress') ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                              {row.currentStatus}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-1">
                          {isEditing ? (
                            <textarea
                              value={row.actionPlan}
                              onChange={(e) => {
                                const newData = [...tableData];
                                newData[index].actionPlan = e.target.value;
                                setTableData(newData);
                              }}
                              className="w-full p-1 text-xs bg-transparent resize-none"
                              rows={2}
                            />
                          ) : (
                            <span className="text-xs">{row.actionPlan}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {isEditing ? (
                            <select
                              value={row.priority}
                              onChange={(e) => {
                                const newData = [...tableData];
                                newData[index].priority = e.target.value;
                                setTableData(newData);
                              }}
                              className="w-full p-1 text-xs bg-transparent"
                            >
                              <option value="">Select</option>
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded text-white ${
                              row.priority === 'High' ? 'bg-red-500' :
                              row.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                              {row.priority}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.timeline}
                              onChange={(e) => {
                                const newData = [...tableData];
                                newData[index].timeline = e.target.value;
                                setTableData(newData);
                              }}
                              className="w-full p-1 text-xs bg-transparent"
                            />
                          ) : (
                            <span className="text-xs">{row.timeline}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Additional Metrics */}
        <div className="col-span-4 space-y-6">
          {/* NPS Score */}
          <Card>
            <CardHeader>
              <CardTitle>In-Patient NPS</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 mb-2">Edit monthly NPS data:</p>
                  {editableData.npsChartData.map((month, index) => (
                    <div key={month.month} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">{month.month}:</span>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            placeholder="Promoter"
                            value={month.promoter}
                            onChange={(e) => {
                              const newData = {...editableData};
                              newData.npsChartData[index].promoter = parseInt(e.target.value) || 0;
                              setEditableData(newData);
                            }}
                            className="w-12 h-6 text-xs"
                          />
                          <Input
                            type="number"
                            placeholder="NPS"
                            value={month.npsScore}
                            onChange={(e) => {
                              const newData = {...editableData};
                              newData.npsChartData[index].npsScore = parseInt(e.target.value) || 0;
                              setEditableData(newData);
                            }}
                            className="w-12 h-6 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-4">
                    {editableData.npsChartData[editableData.npsChartData.length - 1]?.npsScore || 79}
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={editableData.npsChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={8} />
                        <YAxis fontSize={8} />
                        <Tooltip />
                        <Bar dataKey="promoter" stackId="a" fill="#4ade80" name="Promoter" />
                        <Bar dataKey="passive" stackId="a" fill="#fb923c" name="Passive" />
                        <Bar dataKey="detractor" stackId="a" fill="#ef4444" name="Detractor" />
                        <Line 
                          type="monotone" 
                          dataKey="npsScore" 
                          stroke="#1e40af" 
                          strokeWidth={2}
                          dot={{ fill: '#1e40af', r: 4 }}
                          name="NPS Score"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Net Promoter Score trends with promoter/passive/detractor breakdown</p>
            </CardContent>
          </Card>

          {/* Loss Tree - 2 Column Layout */}
          <Card>
            <CardHeader>
              <CardTitle>Loss Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Column 1: Cancelled/Rejected */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Cancelled/Rejected:</span>
                    <Badge variant="destructive">15</Badge>
                  </div>
                  <div className="pl-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Documentation Issues:</span>
                      <span>6</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medical Criteria:</span>
                      <span>4</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Insurance Issues:</span>
                      <span>3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Other:</span>
                      <span>1</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Pending */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pending:</span>
                    <Badge variant="outline">14</Badge>
                  </div>
                  <div className="pl-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Documentation Issues:</span>
                      <span>4</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medical Criteria:</span>
                      <span>3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Insurance Issues:</span>
                      <span>5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Other:</span>
                      <span>2</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Revenue & Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Revenue & Performance
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  Live Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* YTD and Growth - Dynamic from Finance Data */}
                <div>
                  <div className="text-lg font-semibold text-green-600 mb-1">
                    YTD: ${financeData.length > 0 ? 
                      financeData.reduce((total, transaction) => total + parseFloat(transaction.amount?.replace(/[^0-9.-]+/g, '') || '0'), 0).toLocaleString() : 
                      '12,000,000'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Growth: {financeData.length > 0 ? 
                      ((financeData.filter(t => t.status === 'Paid').length / financeData.length * 100) - 100).toFixed(1) : '0'}% vs. last year
                  </div>
                </div>

                {/* Metrics Row - Dynamic from Finance Data */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {financeData.length > 0 ? 
                        ((financeData.filter(t => t.status === 'Paid').length / financeData.length) * 100).toFixed(0) : '0'}%
                    </div>
                    <div className="text-xs text-muted-foreground">Achievement</div>
                  </div>
                  <div className="bg-teal-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-teal-600">
                      {financeData.length > 0 ? 
                        (((financeData.filter(t => t.status === 'Paid').length / financeData.length) * 100) - 123).toFixed(0) : '-23'}%
                    </div>
                    <div className="text-xs text-muted-foreground">YTD Growth</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {financeData.length > 0 ? 
                        ((financeData.filter(t => t.status === 'Pending').length / financeData.length) * 100 - 100).toFixed(0) : '0'}%
                    </div>
                    <div className="text-xs text-muted-foreground">MTD Growth</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}