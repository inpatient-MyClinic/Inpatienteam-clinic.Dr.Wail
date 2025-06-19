import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Clock, XCircle, Plus, ArrowLeft, TrendingUp, Timer, CalendarIcon, X, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isWithinInterval, getWeeksInMonth } from "date-fns";

// Request workflow statuses
const REQUEST_STATUSES = {
  NEW: "New",
  PENDING: "Pending",
  UNDER_PROCESS: "Under Process", 
  PATIENT_CONTACTED: "Patient Contacted",
  SUBMITTED_TO_INSURANCE: "Submitted to Insurance",
  APPROVED_BY_HOSPITAL: "Approved by Hospital",
  REJECTED: "Rejected",
  DONE: "Done",
  NEED_JUSTIFICATION: "Need Justification",
  NOT_COMPLETED: "Not Completed",
  DELAYED: "Delayed"
};

const demoRequests = [
  {
    id: 1,
    patientName: "Nora Mohammed",
    idNumber: "2012345678",
    phone: "0551234567",
    agreedSurgeryDate: "2025-06-25",
    hospital: "King Abdulaziz Hospital",
    specialty: "Cardiology",
    doctorName: "Dr. Ahmed Salem",
    status: REQUEST_STATUSES.UNDER_PROCESS,
    coordinator: "John Smith",
    assignedHospitalStaff: null,
    notifications: [],
    createdAt: "2024-01-10T10:00:00Z",
    patientContactedAt: null,
    approvedAt: null
  },
  {
    id: 2,
    patientName: "Omar Hassan",
    idNumber: "2018765432",
    phone: "0567890123",
    agreedSurgeryDate: "2025-06-28",
    hospital: "King Abdulaziz Hospital",
    specialty: "Orthopedics",
    doctorName: "Dr. Sarah Ali",
    status: REQUEST_STATUSES.PATIENT_CONTACTED,
    coordinator: "Jane Doe",
    assignedHospitalStaff: "Hospital Admin 1",
    notifications: ["Patient contacted successfully"],
    createdAt: "2024-01-08T14:30:00Z",
    patientContactedAt: "2024-01-09T10:15:00Z",
    approvedAt: null
  },
  {
    id: 3,
    patientName: "Fatima Ali",
    idNumber: "2014567890",
    phone: "0512345678",
    agreedSurgeryDate: "2025-07-02",
    hospital: "King Abdulaziz Hospital",
    specialty: "Neurosurgery",
    doctorName: "Dr. Mohammed Hassan",
    status: REQUEST_STATUSES.APPROVED_BY_HOSPITAL,
    coordinator: "John Smith",
    assignedHospitalStaff: "Hospital Admin 2",
    notifications: ["Submitted to insurance provider", "Request approved by hospital"],
    createdAt: "2024-01-05T09:15:00Z",
    patientContactedAt: "2024-01-06T11:30:00Z",
    approvedAt: "2024-01-10T16:45:00Z"
  },
  {
    id: 4,
    patientName: "Ahmed Khalil",
    idNumber: "2016789012",
    phone: "0523456789",
    agreedSurgeryDate: "2025-07-05",
    hospital: "King Abdulaziz Hospital",
    specialty: "General Surgery",
    doctorName: "Dr. Layla Hassan",
    status: REQUEST_STATUSES.DONE,
    coordinator: "Jane Doe",
    assignedHospitalStaff: "Hospital Admin 1",
    notifications: ["Patient contacted successfully", "Request approved by hospital", "Surgery completed successfully"],
    createdAt: "2024-01-03T08:00:00Z",
    patientContactedAt: "2024-01-04T09:30:00Z",
    approvedAt: "2024-01-08T14:20:00Z"
  },
  {
    id: 5,
    patientName: "Layla Hassan",
    idNumber: "2019876543",
    phone: "0534567890",
    agreedSurgeryDate: "2025-07-10",
    hospital: "King Abdulaziz Hospital",
    specialty: "Pediatrics",
    doctorName: "Dr. Omar Ali",
    status: REQUEST_STATUSES.REJECTED,
    coordinator: "John Smith",
    assignedHospitalStaff: "Hospital Admin 2",
    notifications: ["Request rejected - additional documentation required"],
    createdAt: "2024-01-02T12:00:00Z",
    patientContactedAt: "2024-01-03T14:00:00Z",
    approvedAt: null
  }
];

export default function HospitalDashboard() {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [requests, setRequests] = useState(demoRequests);
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentHospitalStaff = "Hospital Admin 1";
  const currentHospital = "King Abdulaziz Hospital";
  
  // Date filters state
  const [dateFilters, setDateFilters] = useState<{
    selectedDays: Date[];
    selectedWeeks: { month: Date; weekNumbers: number[] }[];
    selectedMonths: Date[];
  }>({
    selectedDays: [],
    selectedWeeks: [],
    selectedMonths: []
  });

  // Table column filters
  const [surgeryDateFilter, setSurgeryDateFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Week filter state
  const [weekFilterMonth, setWeekFilterMonth] = useState<Date>(new Date());

  // Filter requests for current hospital
  const hospitalRequests = requests.filter(request => 
    request.hospital === currentHospital
  );

  // Apply date filters
  const dateFilteredRequests = hospitalRequests.filter(request => {
    if (dateFilters.selectedDays.length === 0 && dateFilters.selectedWeeks.length === 0 && dateFilters.selectedMonths.length === 0) {
      return true;
    }

    const requestDate = new Date(request.createdAt);
    let matchesDateFilter = false;
    
    // Check selected days
    if (dateFilters.selectedDays.length > 0) {
      matchesDateFilter = dateFilters.selectedDays.some(day => 
        isWithinInterval(requestDate, {
          start: startOfDay(day),
          end: endOfDay(day)
        })
      );
    }
    
    // Check selected weeks
    if (!matchesDateFilter && dateFilters.selectedWeeks.length > 0) {
      matchesDateFilter = dateFilters.selectedWeeks.some(monthWeeks => 
        monthWeeks.weekNumbers.some(weekNumber => {
          const firstDayOfMonth = startOfMonth(monthWeeks.month);
          const weekStart = addDays(firstDayOfMonth, (weekNumber - 1) * 7);
          const weekEnd = addDays(weekStart, 6);
          
          return isWithinInterval(requestDate, {
            start: startOfDay(weekStart),
            end: endOfDay(weekEnd)
          });
        })
      );
    }
    
    // Check selected months
    if (!matchesDateFilter && dateFilters.selectedMonths.length > 0) {
      matchesDateFilter = dateFilters.selectedMonths.some(month => 
        isWithinInterval(requestDate, {
          start: startOfMonth(month),
          end: endOfMonth(month)
        })
      );
    }
    
    return matchesDateFilter;
  });

  // Apply table column filters
  const filteredRequests = dateFilteredRequests.filter(request => {
    const matchesSurgeryDate = surgeryDateFilter === "" || 
      (request.agreedSurgeryDate && request.agreedSurgeryDate.includes(surgeryDateFilter));
    const matchesSpecialty = specialtyFilter === "all" || request.specialty === specialtyFilter;
    const matchesDoctor = doctorFilter === "all" || request.doctorName === doctorFilter;
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesActiveStatus = !activeStatusFilter || request.status === activeStatusFilter;
    
    return matchesSurgeryDate && matchesSpecialty && matchesDoctor && matchesStatus && matchesActiveStatus;
  });

  // Calculate stats for sidebar
  const stats = useMemo(() => {
    const baseRequests = activeStatusFilter ? hospitalRequests : filteredRequests;
    
    return [
      {
        key: "total",
        label: "Total Requests",
        count: baseRequests.length,
        color: "bg-blue-500",
        status: null
      },
      {
        key: "pending",
        label: "Pending",
        count: baseRequests.filter(r => r.status === REQUEST_STATUSES.UNDER_PROCESS).length,
        color: "bg-orange-500",
        status: REQUEST_STATUSES.UNDER_PROCESS
      },
      {
        key: "contacted",
        label: "Patient Contacted",
        count: baseRequests.filter(r => r.status === REQUEST_STATUSES.PATIENT_CONTACTED).length,
        color: "bg-purple-500",
        status: REQUEST_STATUSES.PATIENT_CONTACTED
      },
      {
        key: "approved",
        label: "Approved",
        count: baseRequests.filter(r => r.status === REQUEST_STATUSES.APPROVED_BY_HOSPITAL).length,
        color: "bg-green-500",
        status: REQUEST_STATUSES.APPROVED_BY_HOSPITAL
      },
      {
        key: "completed",
        label: "Completed",
        count: baseRequests.filter(r => r.status === REQUEST_STATUSES.DONE).length,
        color: "bg-emerald-600",
        status: REQUEST_STATUSES.DONE
      },
      {
        key: "rejected",
        label: "Rejected",
        count: baseRequests.filter(r => r.status === REQUEST_STATUSES.REJECTED).length,
        color: "bg-red-500",
        status: REQUEST_STATUSES.REJECTED
      }
    ];
  }, [filteredRequests, hospitalRequests, activeStatusFilter]);

  // Calculate analytics metrics
  const analyticsMetrics = useMemo(() => {
    const totalRequests = hospitalRequests.length;
    const doneRequests = hospitalRequests.filter(req => req.status === REQUEST_STATUSES.DONE).length;
    const approvedRequests = hospitalRequests.filter(req => req.status === REQUEST_STATUSES.APPROVED_BY_HOSPITAL).length;
    const rejectedRequests = hospitalRequests.filter(req => req.status === REQUEST_STATUSES.REJECTED).length;
    
    const conversionRate = totalRequests > 0 ? ((doneRequests / totalRequests) * 100).toFixed(1) : "0";
    const approvalRate = totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(1) : "0";
    const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : "0";

    return {
      conversionRate,
      approvalRate,
      rejectionRate,
      doneRequests,
      approvedRequests,
      rejectedRequests,
      totalRequests
    };
  }, [hospitalRequests]);

  // Calculate lead time metrics for current hospital only
  const leadTimeMetrics = useMemo(() => {
    const contactLeadTimes = hospitalRequests
      .filter(req => req.patientContactedAt)
      .map(req => {
        const created = new Date(req.createdAt);
        const contacted = new Date(req.patientContactedAt!);
        return (contacted.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      });

    const approvalLeadTimes = hospitalRequests
      .filter(req => req.approvedAt)
      .map(req => {
        const created = new Date(req.createdAt);
        const approved = new Date(req.approvedAt!);
        return (approved.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      });

    const avgContactLeadTime = contactLeadTimes.length > 0 
      ? contactLeadTimes.reduce((a, b) => a + b, 0) / contactLeadTimes.length 
      : 0;

    const avgApprovalLeadTime = approvalLeadTimes.length > 0 
      ? approvalLeadTimes.reduce((a, b) => a + b, 0) / approvalLeadTimes.length 
      : 0;

    const contactRate = hospitalRequests.length > 0 
      ? (contactLeadTimes.length / hospitalRequests.length) * 100 
      : 0;

    const approvalRate = hospitalRequests.length > 0 
      ? (approvalLeadTimes.length / hospitalRequests.length) * 100 
      : 0;

    return {
      avgContactLeadTime: Math.round(avgContactLeadTime),
      avgApprovalLeadTime: Math.round(avgApprovalLeadTime),
      contactRate: Math.round(contactRate),
      approvalRate: Math.round(approvalRate),
      totalRequests: hospitalRequests.length
    };
  }, [hospitalRequests]);

  // Get unique values for filters
  const uniqueSpecialties = [...new Set(hospitalRequests.map(req => req.specialty))];
  const uniqueDoctors = [...new Set(hospitalRequests.map(req => req.doctorName))];
  const uniqueStatuses = [...new Set(hospitalRequests.map(req => req.status))];

  // Generate months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return date;
  });

  // Generate weeks for selected month
  const getWeeksForMonth = (month: Date) => {
    const weeksInMonth = getWeeksInMonth(month);
    const weeks = [];
    
    for (let weekNum = 1; weekNum <= weeksInMonth; weekNum++) {
      const firstDayOfMonth = startOfMonth(month);
      const weekStart = addDays(firstDayOfMonth, (weekNum - 1) * 7);
      const weekEnd = addDays(weekStart, 6);
      
      weeks.push({
        number: weekNum,
        range: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
      });
    }
    
    return weeks;
  };

  const handleDaySelect = (days: Date[] | undefined) => {
    const newSelectedDays = days || [];
    setDateFilters(prev => ({
      ...prev,
      selectedDays: newSelectedDays
    }));
  };

  const handleWeekSelect = (weekNumber: number) => {
    const monthKey = weekFilterMonth.getTime();
    const existingMonthIndex = dateFilters.selectedWeeks.findIndex(w => w.month.getTime() === monthKey);
    
    let newSelectedWeeks = [...dateFilters.selectedWeeks];
    
    if (existingMonthIndex >= 0) {
      const existingWeeks = newSelectedWeeks[existingMonthIndex].weekNumbers;
      if (existingWeeks.includes(weekNumber)) {
        newSelectedWeeks[existingMonthIndex].weekNumbers = existingWeeks.filter(w => w !== weekNumber);
        if (newSelectedWeeks[existingMonthIndex].weekNumbers.length === 0) {
          newSelectedWeeks = newSelectedWeeks.filter((_, i) => i !== existingMonthIndex);
        }
      } else {
        newSelectedWeeks[existingMonthIndex].weekNumbers.push(weekNumber);
      }
    } else {
      newSelectedWeeks.push({
        month: new Date(weekFilterMonth),
        weekNumbers: [weekNumber]
      });
    }
    
    setDateFilters(prev => ({
      ...prev,
      selectedWeeks: newSelectedWeeks
    }));
  };

  const handleMonthSelect = (monthIndex: string) => {
    const month = new Date();
    month.setMonth(parseInt(monthIndex));
    month.setDate(1);
    
    const isSelected = dateFilters.selectedMonths.some(m => m.getMonth() === month.getMonth());
    let newSelectedMonths;
    
    if (isSelected) {
      newSelectedMonths = dateFilters.selectedMonths.filter(m => m.getMonth() !== month.getMonth());
    } else {
      newSelectedMonths = [...dateFilters.selectedMonths, month];
    }
    
    setDateFilters(prev => ({
      ...prev,
      selectedMonths: newSelectedMonths
    }));
  };

  const clearDateFilters = () => {
    setDateFilters({
      selectedDays: [],
      selectedWeeks: [],
      selectedMonths: []
    });
  };

  const clearTableFilters = () => {
    setSurgeryDateFilter("");
    setSpecialtyFilter("all");
    setDoctorFilter("all");
    setStatusFilter("all");
  };

  const hasDateFilters = dateFilters.selectedDays.length > 0 || dateFilters.selectedWeeks.length > 0 || dateFilters.selectedMonths.length > 0;
  const hasTableFilters = surgeryDateFilter !== "" || specialtyFilter !== "all" || doctorFilter !== "all" || statusFilter !== "all";

  const isWeekSelected = (weekNumber: number) => {
    const monthKey = weekFilterMonth.getTime();
    const monthWeeks = dateFilters.selectedWeeks.find(w => w.month.getTime() === monthKey);
    return monthWeeks?.weekNumbers.includes(weekNumber) || false;
  };

  const updateStatus = (requestId: number, newStatus: string, notification?: string) => {
    const now = new Date().toISOString();
    
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { 
          ...req, 
          status: newStatus,
          assignedHospitalStaff: currentHospitalStaff,
          notifications: [...req.notifications, notification || `Status updated to ${newStatus}`],
          patientContactedAt: newStatus === REQUEST_STATUSES.PATIENT_CONTACTED ? now : req.patientContactedAt,
          approvedAt: newStatus === REQUEST_STATUSES.APPROVED_BY_HOSPITAL ? now : req.approvedAt
        } : req
      )
    );

    toast({
      title: "Status Updated",
      description: `Request ${requestId} status changed to ${newStatus}`,
    });

    if (newStatus === REQUEST_STATUSES.DONE) {
      const request = requests.find(r => r.id === requestId);
      console.log(`Sending WhatsApp survey link to patient: ${request?.patientName}`);
      toast({
        title: "Survey Sent",
        description: "Post-surgery survey link sent to patient via WhatsApp",
      });
    }
  };

  const contactPatient = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.PATIENT_CONTACTED, "Patient successfully contacted");
  };

  const submitToInsurance = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.SUBMITTED_TO_INSURANCE, "Submitted to insurance provider for approval");
  };

  const approveRequest = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.APPROVED_BY_HOSPITAL, "Request approved by hospital");
  };

  const rejectRequest = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.REJECTED, "Request rejected - additional justification required");
    
    toast({
      title: "Rejection Notification Sent",
      description: "Coordinator has been notified about the rejection",
    });
  };

  const markSurgeryComplete = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.DONE, "Surgery completed successfully");
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      [REQUEST_STATUSES.NEW]: "bg-blue-100 text-blue-800",
      [REQUEST_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800",
      [REQUEST_STATUSES.UNDER_PROCESS]: "bg-orange-100 text-orange-800",
      [REQUEST_STATUSES.PATIENT_CONTACTED]: "bg-purple-100 text-purple-800",
      [REQUEST_STATUSES.SUBMITTED_TO_INSURANCE]: "bg-cyan-100 text-cyan-800",
      [REQUEST_STATUSES.APPROVED_BY_HOSPITAL]: "bg-green-100 text-green-800",
      [REQUEST_STATUSES.DONE]: "bg-green-200 text-green-900",
      [REQUEST_STATUSES.REJECTED]: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getActionButtons = (request: any) => {
    switch (request.status) {
      case REQUEST_STATUSES.UNDER_PROCESS:
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => contactPatient(request.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Contact Patient
            </Button>
          </div>
        );
      
      case REQUEST_STATUSES.PATIENT_CONTACTED:
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => submitToInsurance(request.id)}
              className="flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              Submit to Insurance
            </Button>
          </div>
        );
      
      case REQUEST_STATUSES.SUBMITTED_TO_INSURANCE:
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => approveRequest(request.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => rejectRequest(request.id)}
              className="flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Reject
            </Button>
          </div>
        );
      
      case REQUEST_STATUSES.APPROVED_BY_HOSPITAL:
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => markSurgeryComplete(request.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Mark Surgery Complete
            </Button>
          </div>
        );
      
      default:
        return (
          <Button size="sm" variant="outline">
            View Details
          </Button>
        );
    }
  };

  const createNewRequest = () => {
    navigate("/create-request");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
        <h1 className="text-xl font-bold mb-4 text-center text-blue-900">Hospital Dashboard</h1>
        <p className="text-sm text-blue-700 mb-4">{currentHospital}</p>
        
        <Button className="w-full mb-6" variant="default" onClick={createNewRequest}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Request
        </Button>
        
        <div className="flex flex-col gap-4 w-full mb-8">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 cursor-pointer transition-opacity ${
                !activeStatusFilter || activeStatusFilter === stat.status 
                  ? stat.color 
                  : stat.color + ' opacity-50'
              } text-white`}
              onClick={() => setActiveStatusFilter(activeStatusFilter === stat.status ? null : stat.status)}
            >
              <span className="text-xs">{stat.label}:</span>
              <span className="font-bold text-lg">{stat.count}</span>
            </div>
          ))}
          
          {activeStatusFilter && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveStatusFilter(null)}
              className="mt-2"
            >
              Clear Filter
            </Button>
          )}
        </div>

        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 mt-auto border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </aside>
      
      {/* Main */}
      <main className="flex-1 bg-white p-6">
        {/* Date Filters */}
        <div className="mb-4 flex flex-wrap gap-2 items-center justify-end">
          {/* Days Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Filter by Days
                {dateFilters.selectedDays.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {dateFilters.selectedDays.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="multiple"
                selected={dateFilters.selectedDays}
                onSelect={handleDaySelect}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Weeks Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Filter by Weeks
                {dateFilters.selectedWeeks.reduce((total, month) => total + month.weekNumbers.length, 0) > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {dateFilters.selectedWeeks.reduce((total, month) => total + month.weekNumbers.length, 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Month</label>
                  <Select 
                    value={weekFilterMonth.getMonth().toString()} 
                    onValueChange={(value) => setWeekFilterMonth(new Date(2024, parseInt(value), 1))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {format(month, 'MMMM yyyy')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Weeks</label>
                  <div className="grid grid-cols-1 gap-2">
                    {getWeeksForMonth(weekFilterMonth).map((week) => (
                      <Button
                        key={week.number}
                        variant={isWeekSelected(week.number) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleWeekSelect(week.number)}
                        className="justify-start"
                      >
                        Week {week.number}: {week.range}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Months Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Filter by Months
                {dateFilters.selectedMonths.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {dateFilters.selectedMonths.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="start">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Months</label>
                <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                  {months.map((month, index) => {
                    const isSelected = dateFilters.selectedMonths.some(m => m.getMonth() === month.getMonth());
                    return (
                      <Button
                        key={index}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleMonthSelect(index.toString())}
                        className="justify-start"
                      >
                        {format(month, 'MMMM yyyy')}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear Date Filters */}
          {hasDateFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateFilters}
              className="text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear Date Filters
            </Button>
          )}
        </div>

        {/* Clear Table Filters */}
        {hasTableFilters && (
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredRequests.length} of {hospitalRequests.length} requests (filtered)
            </div>
            <Button
              variant="ghost"
              onClick={clearTableFilters}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
              Clear Table Filters
            </Button>
          </div>
        )}
        
        {/* Requests table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border text-sm rounded">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="p-2">Patient Name</th>
                <th className="p-2">ID Number</th>
                <th className="p-2">Phone</th>
                <th className="p-2 relative">
                  <div className="flex items-center justify-between">
                    Surgery Date
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Filter className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3 bg-white border shadow-lg z-50">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Filter by Surgery Date</Label>
                          <Input
                            type="date"
                            value={surgeryDateFilter}
                            onChange={(e) => setSurgeryDateFilter(e.target.value)}
                            className="w-full"
                          />
                          {surgeryDateFilter && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSurgeryDateFilter("")}
                              className="w-full text-xs"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="p-2 relative">
                  <div className="flex items-center justify-between">
                    Specialty
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Filter className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3 bg-white border shadow-lg z-50">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Filter by Specialty</Label>
                          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select specialty" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="all">All specialties</SelectItem>
                              {uniqueSpecialties.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {specialtyFilter !== "all" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSpecialtyFilter("all")}
                              className="w-full text-xs"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="p-2 relative">
                  <div className="flex items-center justify-between">
                    Doctor
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Filter className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3 bg-white border shadow-lg z-50">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Filter by Doctor</Label>
                          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select doctor" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="all">All doctors</SelectItem>
                              {uniqueDoctors.map((doctor) => (
                                <SelectItem key={doctor} value={doctor}>
                                  {doctor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {doctorFilter !== "all" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setDoctorFilter("all")}
                              className="w-full text-xs"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="p-2">Coordinator</th>
                <th className="p-2 relative">
                  <div className="flex items-center justify-between">
                    Status
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Filter className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-3 bg-white border shadow-lg z-50">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Filter by Status</Label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="all">All statuses</SelectItem>
                              {uniqueStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {statusFilter !== "all" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setStatusFilter("all")}
                              className="w-full text-xs"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-gray-400 py-6">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{req.patientName}</td>
                    <td className="p-2">{req.idNumber}</td>
                    <td className="p-2">{req.phone}</td>
                    <td className="p-2">{req.agreedSurgeryDate}</td>
                    <td className="p-2">{req.specialty}</td>
                    <td className="p-2">{req.doctorName}</td>
                    <td className="p-2">{req.coordinator}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {getActionButtons(req)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Hospital Lead Time Performance - Moved below table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Hospital Lead Time Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-600" />
                  Avg Contact Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {leadTimeMetrics.avgContactLeadTime}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Time to contact patient
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  Avg Approval Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {leadTimeMetrics.avgApprovalLeadTime}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Time to approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Contact Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {leadTimeMetrics.contactRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Patients contacted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  Approval Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {leadTimeMetrics.approvalRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Requests approved
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
              <p className="text-4xl font-bold text-green-600">{analyticsMetrics.conversionRate}%</p>
              <p className="text-sm text-gray-500">
                ({analyticsMetrics.doneRequests} done / {analyticsMetrics.totalRequests} total requests)
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Approval Rate</h3>
              <p className="text-4xl font-bold text-blue-600">{analyticsMetrics.approvalRate}%</p>
              <p className="text-sm text-gray-500">
                ({analyticsMetrics.approvedRequests} approved / {analyticsMetrics.totalRequests} total requests)
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Rejection Rate</h3>
              <p className="text-4xl font-bold text-red-600">{analyticsMetrics.rejectionRate}%</p>
              <p className="text-sm text-gray-500">
                ({analyticsMetrics.rejectedRequests} rejected / {analyticsMetrics.totalRequests} total requests)
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
