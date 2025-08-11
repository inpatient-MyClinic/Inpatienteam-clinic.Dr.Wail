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
  // Handle Excel serial date numbers and string representations
  if (typeof dateValue === 'number' && dateValue > 25000) {
    date = new Date((dateValue - 25569) * 86400 * 1000);
  } else if (typeof dateValue === 'string') {
    const t = dateValue.trim();
    const n = Number(t);
    if (!isNaN(n) && n > 25000) {
      date = new Date((n - 25569) * 86400 * 1000);
    } else {
      date = new Date(t);
    }
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
      { month: 'Jul25', promoter: 86, passive: 8, detractor: 6, npsScore: 86 }
    ]
  });
  const [monthlyNPS, setMonthlyNPS] = useState<Record<number, number>>({});
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  // Load integrated data from all dashboard sources on component mount
  useEffect(() => {
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
      mtdGrowth: integratedData.metrics.mtdGrowth,
      doneCases: integratedData.conversionData.done,
      totalCases: integratedData.conversionData.total,
      conversionRate: parseFloat(integratedData.conversionData.rate)
    }));
  }, [selectedMonth, selectedYear]);

  // Function to load and integrate data from all dashboard sources
  const loadIntegratedSIAData = () => {
    // Get data from multiple sources for comprehensive SIA analysis
    const medicalRequests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    const requestStorageData = JSON.parse(localStorage.getItem('requestStorage') || '[]');
    
    // Finance Dashboard Data (prefer SIA-specific if available)
    const siaFinanceData = JSON.parse(localStorage.getItem('siaFinanceData') || '[]');
    const financeAnalyticsData = JSON.parse(localStorage.getItem('financeAnalyticsData') || '[]');
    const allFinance = (Array.isArray(siaFinanceData) && siaFinanceData.length > 0) ? siaFinanceData : (Array.isArray(financeAnalyticsData) ? financeAnalyticsData : []);
    
    // Customer Care Data
    const customerCareData = JSON.parse(localStorage.getItem('customerCareData') || '[]');
    
    // Combine all request sources, prioritizing medical_requests but falling back to requestStorage
    const allRequests = medicalRequests.length > 0 ? medicalRequests : requestStorageData;
    
    // Helper: robustly extract the date from a record
const getItemDate = (item: any) => {
  const raw = item.date ?? item.dateCreated ?? item.requestDate ?? item.created_at ?? item.createdAt ?? item['Date'] ?? item['Created At'] ?? item['Request Date'] ?? item.transaction_date;
  if (raw === undefined || raw === null || raw === '') return null as Date | null;
  if (typeof raw === 'number' && raw > 25000) {
    return new Date((raw - 25569) * 86400 * 1000);
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    const n = Number(t);
    if (!isNaN(n) && n > 25000) {
      return new Date((n - 25569) * 86400 * 1000);
    }
    const d2 = new Date(t);
    return isNaN(d2.getTime()) ? null : d2;
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};
    
    // Helper: robustly extract the date from a finance record
const getFinanceDate = (item: any) => {
  const raw = item.transaction_date ?? item.date ?? item['Transaction Date'] ?? item['Date'] ?? item.createdAt;
  if (raw === undefined || raw === null || raw === '') return null as Date | null;
  if (typeof raw === 'number' && raw > 25000) {
    return new Date((raw - 25569) * 86400 * 1000);
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    const n = Number(t);
    if (!isNaN(n) && n > 25000) {
      return new Date((n - 25569) * 86400 * 1000);
    }
    const d2 = new Date(t);
    return isNaN(d2.getTime()) ? null : d2;
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};
    
    // Normalization helpers for hospital and specialty names
    const normalizeHospitalName = (val: any): string | null => {
      if (val === undefined || val === null) return null;
      const s = String(val).trim();
      if (!s) return null;
      const low = s.toLowerCase();
      // DSFH
      if (/fakee?h|dsfh/.test(low)) return 'DSFH';
      // Al Salamah
      if (/salamah|al\s*salamah/.test(low)) return 'Al Salamah';
      // DSAH Al Basateen / HMG Al Basateen
      if (/basate?e?n|basatin|hmg|dsah/.test(low)) return 'DSAH Al Basateen';
      // Al Batal
      if (/batal|al\s*batal/.test(low)) return 'Al Batal';
      // Bin Rushd
      if (/bin\s*rushd/.test(low)) return 'Bin Rushd';
      // IMC
      if (/international medical center|imc/.test(low)) return 'IMC';
      // KCH
      if (/king\s*\w*\s*hospital|kch/.test(low)) return 'KCH';
      return s; // default as-is (trimmed)
    };

    const normalizeSpecialtyName = (val: any): string | null => {
      if (val === undefined || val === null) return null;
      const s = String(val).trim();
      if (!s) return null;
      const low = s.toLowerCase();
      // OBG / OB-GYN
      if (/^obg$|ob\/?gyn|obstetric|gynec/.test(low)) return 'OBG';
      // Ophthalmology
      if (/ophth|ophtha|ophthalm/.test(low)) return 'Ophtha';
      // ENT / Otolaryngology
      if (/^ent$|otolaryng/.test(low)) return 'ENT';
      // GIT / Gastro
      if (/^git$|gastro/.test(low)) return 'GIT';
      // Cardio shorthand
      if (/cardio/.test(low)) return 'Cardiology';
      return s; // default as-is
    };
    
// Filter by the currently selected month/year
const consolidatedData = (Array.isArray(data) && data.length > 0) ? data : allRequests;
const currentMonthData = consolidatedData.filter((item: any) => {
  const d = getItemDate(item);
  return d && d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
});
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    const previousMonthData = consolidatedData.filter((item: any) => {
      const d = getItemDate(item);
      return d && d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
    });

    // Finance: filter to selected month/year
    const currentMonthFinance = (allFinance || []).filter((t: any) => {
      const d = getFinanceDate(t);
      return d && d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    // Debug: Log the filtered data for the current month
    console.log('Current Month Data Count:', currentMonthData.length);
    console.log('Selected Month:', selectedMonth, 'Selected Year:', selectedYear);
    console.log('Sample current month data:', currentMonthData.slice(0, 3));

    // MC branch counts based on current month data
    const mcj1Cases = currentMonthData.filter((req: any) => {
      const possibleFields = [
        req.H, req['H'], req.__EMPTY_7, req.__EMPTY_6, req.__EMPTY_8,
        req['My Clinic Branch'], req.clinicBranch, req['Column H'],
        req.referredFrom, req.referred_from, req.branch, req.hospitalCode,
        req['Referred From'], req['Hospital Code'], req.source, req.origin,
        req['Branch'], req['Clinic Branch'], req['MC Branch']
      ];
      const columnHValue = possibleFields.find((val: any) => val !== undefined && val !== null && val !== '') || '';
      const valueStr = String(columnHValue).toLowerCase().trim();
      const isMatch = valueStr.includes('al muhammadiyah') || valueStr.includes('muhammadiyah') || valueStr.includes('mc al muhammadiyah') || valueStr.includes('mcj1') || valueStr.includes('mc j1') || valueStr === 'mcj1' || valueStr.includes('mc1') || valueStr.includes('myclinic muhammadiyah');
      if (isMatch) {
        console.log('MCJ1 Match found:', valueStr, 'from fields:', possibleFields);
      }
      return isMatch;
    });
    
    const mcj2Cases = currentMonthData.filter((req: any) => {
      const possibleFields = [
        req.H, req['H'], req.__EMPTY_7, req.__EMPTY_6, req.__EMPTY_8,
        req['My Clinic Branch'], req.clinicBranch, req['Column H'],
        req.referredFrom, req.referred_from, req.branch, req.hospitalCode,
        req['Referred From'], req['Hospital Code'], req.source, req.origin,
        req['Branch'], req['Clinic Branch'], req['MC Branch']
      ];
      const columnHValue = possibleFields.find((val: any) => val !== undefined && val !== null && val !== '') || '';
      const valueStr = String(columnHValue).toLowerCase().trim();
      const isMatch = valueStr.includes('al safa') || valueStr.includes('safa') || valueStr.includes('mc al safa') || valueStr.includes('mcj2') || valueStr.includes('mc j2') || valueStr === 'mcj2' || valueStr.includes('mc2') || valueStr.includes('myclinic safa');
      if (isMatch) {
        console.log('MCJ2 Match found:', valueStr, 'from fields:', possibleFields);
      }
      return isMatch;
    });

    console.log('MCJ1 Cases found:', mcj1Cases.length);
    console.log('MCJ2 Cases found:', mcj2Cases.length);
    
    // Status distribution and conversion counts from current month data
    const statusCounts = {
      completed: currentMonthData.filter((req: any) => {
        const statusFields = [req.status, req.operationStatus, req['Status'], req['Operation Status']];
        const status = statusFields.find((s: any) => s) || '';
        const s = String(status).toLowerCase().trim();
        return s.includes('done') || s.includes('completed') || s.includes('complete');
      }).length,
      pending: currentMonthData.filter((req: any) => {
        const statusFields = [req.status, req.operationStatus, req['Status'], req['Operation Status']];
        const status = statusFields.find((s: any) => s) || '';
        const s = String(status).toLowerCase().trim();
        return s.includes('pending') || s.includes('waiting');
      }).length,
      cancelled: currentMonthData.filter((req: any) => {
        const statusFields = [req.status, req.operationStatus, req['Status'], req['Operation Status']];
        const status = statusFields.find((s: any) => s) || '';
        const s = String(status).toLowerCase().trim();
        return s.includes('cancelled') || s.includes('canceled');
      }).length,
      rejected: currentMonthData.filter((req: any) => {
        const statusFields = [req.status, req.operationStatus, req['Status'], req['Operation Status']];
        const status = statusFields.find((s: any) => s) || '';
        const s = String(status).toLowerCase().trim();
        return s.includes('rejected') || s.includes('declined');
      }).length,
      scheduled: currentMonthData.filter((req: any) => {
        const statusFields = [req.status, req.operationStatus, req['Status'], req['Operation Status']];
        const status = statusFields.find((s: any) => s) || '';
        const s = String(status).toLowerCase().trim();
        return s.includes('scheduled') || s.includes('booked');
      }).length,
      plannedNVD: currentMonthData.filter((req: any) => {
        const statusFields = [req.status, req.operationStatus, req['Status'], req['Operation Status']];
        const status = statusFields.find((s: any) => s) || '';
        const s = String(status).toLowerCase().trim();
        return s.includes('planned') || s.includes('nvd');
      }).length
    };
    
    const doneCount = statusCounts.completed;
    const scheduledCount = statusCounts.scheduled;
    const plannedNVDCount = statusCounts.plannedNVD;
    const totalCasesCount = currentMonthData.length;
    const totalDoneAndScheduled = doneCount + scheduledCount + plannedNVDCount;
    const conversionRate = totalCasesCount > 0 ? ((totalDoneAndScheduled / totalCasesCount) * 100).toFixed(2) : '0.00';
    
    // Top hospitals/specialties based on current month data (with normalization)
    const hospitalCounts = currentMonthData.reduce((acc: any, req: any) => {
      const hospitalFields = [
        req.hospitalName, req.referredToHospital, req.hospital,
        req['Hospital Name'], req['Referred To Hospital'], req['Hospital'],
        req.referredTo, req['Referred To'], req.hospitalCode, req['Hospital Code'],
        req.destinationHospital, req['Destination Hospital'], req.partnerHospital, req['Partner Hospital']
      ];
      const raw = hospitalFields.find((h: any) => h !== undefined && h !== null && String(h).trim() !== '');
      const key = normalizeHospitalName(raw);
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const top5Hospitals = Object.entries(hospitalCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([hospital, count]) => ({ hospital, count }));
    
    const specialtyCounts = currentMonthData.reduce((acc: any, req: any) => {
      const specialtyFields = [
        req.specialty, req.medical_specialty, req['Specialty'], req['Medical Specialty'], req.medicalSpecialty, req.department,
        req['Speciality'], req['Specialization'], req['Department/Specialty'], req.spec, req.Spec, req['Specialty Name']
      ];
      const raw = specialtyFields.find((s: any) => s !== undefined && s !== null && String(s).trim() !== '');
      const key = normalizeSpecialtyName(raw) || 'General';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const top5Specialties = Object.entries(specialtyCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([specialty, count]) => ({ specialty, count }));
    
    // Achievement and growth based on request counts
    const totalRequests = consolidatedData.length;
    const achievementValue = totalRequests > 0 ? ((currentMonthData.length / totalRequests) * 100).toFixed(1) : '0';
    const mtdGrowthValue = previousMonthData.length > 0 ? (((currentMonthData.length - previousMonthData.length) / previousMonthData.length) * 100).toFixed(1) : '0';
    const ytdGrowthValue = '15.5';
    
    return {
      consolidatedData,
financeData: currentMonthFinance,
customerCareData,
mcBranchCounts: { mcj1: mcj1Cases.length, mcj2: mcj2Cases.length, total: mcj1Cases.length + mcj2Cases.length },
conversionData: {
  done: totalDoneAndScheduled,
  total: totalCasesCount,
  rate: conversionRate,
        breakdown: { doneCount, scheduledCount, plannedNVDCount }
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

  // Get integrated data and filter by the SELECTED month
  const integratedSIAData = loadIntegratedSIAData();
  
  // Use the selected month/year for primary filtering
  // Use the selected month/year for primary filtering
  const filterMonth = selectedMonth;
  const filterYear = selectedYear;
  
  // Robust date extraction (handles strings, Date, and Excel serials)
  const filteredData = integratedSIAData.consolidatedData.filter(item => {
    const raw = item.date ?? item.dateCreated ?? item.requestDate ?? item.createdAt ?? item['Date'] ?? item['Created At'] ?? item['Request Date'] ?? item.transaction_date;
    if (!raw) return false;
    let d: Date | null = null;
    if (typeof raw === 'number' && raw > 25000) {
      d = new Date((raw - 25569) * 86400 * 1000);
    } else {
      const tmp = new Date(raw);
      d = isNaN(tmp.getTime()) ? null : tmp;
    }
    return !!d && d.getMonth() + 1 === filterMonth && d.getFullYear() === filterYear;
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
  
  // Calculate Done Cases (Completed status) for the selected month
  const doneStatuses = ['Completed', 'Done', 'Completed Case'];
  const doneCases = filteredData.filter(item => {
    const s = String(item.status || item.operationStatus || item['Status'] || '').toLowerCase();
    return s.includes('done') || s.includes('complete');
  }).length;
  
  // Calculate conversion rate based on done vs total in selected month
  const conversionRate = filteredData.length > 0 ? ((doneCases / filteredData.length) * 100).toFixed(1) : "0";
  
  // Update editable data with actual counts
  const actualDoneCount = doneCases;
  const actualTotalCount = filteredData.length;

  // Calculate previous month data from integrated sources (now showing data 2 months back for comparison)
  const comparisonMonth = filterMonth === 1 ? 12 : filterMonth - 1;
  const comparisonYear = filterMonth === 1 ? filterYear - 1 : filterYear;
  const previousMonthData = integratedSIAData.consolidatedData.filter(item => {
    const raw = item.date ?? item.dateCreated ?? item.requestDate ?? item.createdAt ?? item['Date'] ?? item['Created At'] ?? item['Request Date'];
    if (!raw) return false;
    let itemDate: Date | null = null;
    if (typeof raw === 'number' && raw > 25000) {
      itemDate = new Date((raw - 25569) * 86400 * 1000);
    } else {
      const tmp = new Date(raw);
      itemDate = isNaN(tmp.getTime()) ? null : tmp;
    }
    return !!itemDate && itemDate.getMonth() + 1 === comparisonMonth && itemDate.getFullYear() === comparisonYear;
  });

  // Top 5 Hospitals and Specialties (robust field detection)
  const findValueByKeyIncludes = (obj: any, patterns: string[]) => {
    for (const key in obj) {
      const l = key.toLowerCase();
      if (patterns.some((p) => l.includes(p))) {
        const v = (obj as any)[key];
        if (v !== undefined && v !== null && String(v).trim() !== '') return v;
      }
    }
    return undefined;
  };

  // Normalizers for display in Top lists
  const normalizeHospital = (val: any): string => {
    if (val === undefined || val === null) return 'Unknown Hospital';
    const s = String(val).trim();
    if (!s) return 'Unknown Hospital';
    const low = s.toLowerCase();
    if (/fakee?h|dsfh/.test(low)) return 'DSFH';
    if (/salamah|al\s*salamah/.test(low)) return 'Al Salamah';
    if (/basate?e?n|basatin|hmg|dsah/.test(low)) return 'DSAH Al Basateen';
    if (/batal|al\s*batal/.test(low)) return 'Al Batal';
    if (/bin\s*rushd/.test(low)) return 'Bin Rushd';
    if (/international medical center|imc/.test(low)) return 'IMC';
    if (/king\s*\w*\s*hospital|kch/.test(low)) return 'KCH';
    return s;
  };

  const normalizeSpecialty = (val: any): string => {
    if (val === undefined || val === null) return 'General';
    const s = String(val).trim();
    if (!s) return 'General';
    const low = s.toLowerCase();
    if (/^obg$|ob\/?gyn|obstetric|gynec/.test(low)) return 'OBG';
    if (/ophth|ophtha|ophthalm/.test(low)) return 'Ophtha';
    if (/^ent$|otolaryng/.test(low)) return 'ENT';
    if (/^git$|gastro/.test(low)) return 'GIT';
    if (/cardio/.test(low)) return 'Cardiology';
    return s;
  };

  const getHospitalFromItem = (item: any) => {
    const direct = item.hospitalName ?? item.referredToHospital ?? item.hospital ??
      item['Hospital Name'] ?? item['Referred To Hospital'] ?? item['Hospital'] ??
      item.referredTo ?? item['Referred To'] ?? item.hospitalCode ?? item['Hospital Code'] ??
      item.partnerHospital ?? item['Partner Hospital'] ?? item.receivingHospital ?? item['Receiving Hospital'] ??
      item.destinationHospital ?? item['Destination Hospital'];
    const raw = direct ?? findValueByKeyIncludes(item, ['hospital']);
    return normalizeHospital(raw);
  };

  const getSpecialtyFromItem = (item: any) => {
    const direct = item.specialty ?? item.medical_specialty ?? item['Specialty'] ?? item['Speciality'] ??
      item['Medical Specialty'] ?? item.medicalSpecialty ?? item.department ?? item['Department'] ??
      item['Specialization'] ?? item['Department/Specialty'] ?? item.spec ?? item.Spec ?? item['Specialty Name'];
    const raw = direct ?? findValueByKeyIncludes(item, ['special', 'dept']);
    return normalizeSpecialty(raw);
  };
  const hospitalCounts = filteredData.reduce((acc, item) => {
    const h = getHospitalFromItem(item);
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const top5Hospitals = Object.entries(hospitalCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count: count as number }));

  const specialtyCounts = filteredData.reduce((acc, item) => {
    const s = getSpecialtyFromItem(item);
    acc[s] = (acc[s] || 0) + 1;
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

  // Function to handle viewing old version
  const handleViewOldVersion = () => {
    const savedVersions = JSON.parse(localStorage.getItem('siaSlideVersions') || '[]');
    if (savedVersions.length > 0) {
      const lastVersion = savedVersions[savedVersions.length - 1];
      setEditableData(lastVersion);
      toast({
        title: "Old Version Loaded",
        description: `Loaded version from ${new Date(lastVersion.timestamp).toLocaleDateString()}`,
      });
    } else {
      toast({
        title: "No Previous Versions",
        description: "No previous versions found to load.",
        variant: "destructive",
      });
    }
  };

  // Function to handle PDF export
  const handleExportPDF = () => {
    // Save current version before export
    const currentVersion = {
      ...editableData,
      timestamp: new Date().toISOString()
    };
    
    const savedVersions = JSON.parse(localStorage.getItem('siaSlideVersions') || '[]');
    savedVersions.push(currentVersion);
    localStorage.setItem('siaSlideVersions', JSON.stringify(savedVersions));
    
    // Call the existing export function
    exportToPDF();
    
    toast({
      title: "Version Saved",
      description: "Current version has been saved for future reference.",
    });
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
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleViewOldVersion}
            variant="outline"
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            <History className="h-4 w-4 mr-2" />
            Old Version
          </Button>

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
            onClick={handleExportPDF}
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
                  <span>MCJ1 (Al Muhammadiyah): {integratedSIAData.mcBranchCounts.mcj1}</span>
                  <span>MCJ2 (Al Safa): {integratedSIAData.mcBranchCounts.mcj2}</span>
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
                      <div>Total Done: {integratedSIAData.conversionData.done} / Total: {integratedSIAData.conversionData.total}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Done: {integratedSIAData.conversionData.breakdown.doneCount} | 
                        Scheduled: {integratedSIAData.conversionData.breakdown.scheduledCount} | 
                        Planned NVD: {integratedSIAData.conversionData.breakdown.plannedNVDCount}
                      </div>
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

          {/* Middle Row - Top 5 Lists with actual data from selected month */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Hospitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {top5Hospitals.length > 0 ? (
                    top5Hospitals.map((h, idx) => (
                      <div key={`${h.name}-${idx}`} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{h.name}</span>
                        <Badge variant="secondary">{h.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No data for selected month</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {top5Specialties.length > 0 ? (
                    top5Specialties.map((s, idx) => (
                      <div key={`${s.name}-${idx}`} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{s.name}</span>
                        <Badge variant="secondary">{s.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No data for selected month</div>
                  )}
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
                    {editableData.npsChartData[editableData.npsChartData.length - 1]?.npsScore || 86}
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
                    Revenue (Selected Month): SAR {financeData.length > 0 ? 
                      financeData.reduce((total, t) => {
                        const raw = (t.amount ?? t.Amount ?? t['Amount'] ?? t['Amount (SAR)'] ?? t.value ?? t['Value']);
                        const num = typeof raw === 'number' ? raw : parseFloat(String(raw || '').replace(/[^0-9.-]+/g, ''));
                        return total + (isNaN(num) ? 0 : num);
                      }, 0).toLocaleString() : 
                      '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Paid % this month: {financeData.length > 0 ? 
                      ((financeData.filter(t => String(t.status || t.payment_status || '').toLowerCase() === 'paid').length / financeData.length) * 100).toFixed(1) : '0'}%
                  </div>
                </div>

                {/* Metrics Row - Dynamic from Finance Data */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">
                    {financeData.length > 0 ? 
                      ((financeData.filter(t => String(t.status || t.payment_status || '').toLowerCase() === 'paid').length / financeData.length) * 100).toFixed(0) : '0'}%
                    </div>
                    <div className="text-xs text-muted-foreground">Paid %</div>
                  </div>
                  <div className="bg-teal-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-teal-600">
                      {financeData.length > 0 ? 
                        (financeData.filter(t => String(t.status || t.payment_status || '').toLowerCase() === 'paid').length).toLocaleString() : '0'}
                    </div>
                    <div className="text-xs text-muted-foreground">Paid Count</div>
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