
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Download, ArrowLeft, Settings, Eye, Send, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import NurseDateFilters from "@/components/nurse/NurseDateFilters";
import CustomerCareAnalytics from "@/components/customercare/CustomerCareAnalytics";
import CommentViewDialog from "@/components/customercare/CommentViewDialog";
import SurveyResponseUpload from "@/components/customercare/SurveyResponseUpload";
import ComplaintUpload from "@/components/customercare/ComplaintUpload";
import NPSTargetSettings from "@/components/settings/NPSTargetSettings";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, addDays } from "date-fns";

const stats = [
  { label: "Total Done", key: "total", color: "bg-blue-600", count: 45 },
  { label: "Survey Sent", key: "sent", color: "bg-green-600", count: 35 },
  { label: "Pending Survey", key: "pending", color: "bg-yellow-500", count: 10 },
];

// Sample done requests data with survey responses
const initialDoneRequests: any[] = [];

// Add complaint status to the data
const initialDoneRequestsWithComplaints: any[] = [];

export default function CustomerCareDashboard() {
  // Clear existing data for fresh upload
  const [requests, setRequests] = useState(() => {
    // Clear all related data
    localStorage.removeItem('customerCareData');
    localStorage.removeItem('coordinatorMessages');
    localStorage.removeItem('adminCoordinatorMetrics');
    localStorage.removeItem('recoveryCases');
    return [];
  });
  const [showSettings, setShowSettings] = useState(false);
  const [npsTargets, setNpsTargets] = useState({ customerCare: 75, inPatient: 80, overall: 70, quarterly: 72 });
  const [dateFilters, setDateFilters] = useState<{
    selectedDays: Date[];
    selectedWeeks: { month: Date; weekNumbers: number[] }[];
    selectedMonths: Date[];
  }>({
    selectedDays: [],
    selectedWeeks: [],
    selectedMonths: []
  });
  const [complaintFilter, setComplaintFilter] = useState<'open' | 'closed' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate unread messages for customer-care role
  const unreadCount = 2;

  // Load NPS targets on component mount and listen for updates
  useEffect(() => {
    const loadNPSTargets = () => {
      const savedTargets = localStorage.getItem('npsTargets');
      if (savedTargets) {
        try {
          setNpsTargets(JSON.parse(savedTargets));
        } catch (error) {
          console.error('Error loading NPS targets:', error);
        }
      }
    };

    loadNPSTargets();

    // Listen for NPS target updates
    const handleNPSTargetsUpdate = (event: CustomEvent) => {
      setNpsTargets(event.detail);
    };

    window.addEventListener('npsTargetsUpdated', handleNPSTargetsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('npsTargetsUpdated', handleNPSTargetsUpdate as EventListener);
    };
  }, []);

  // Auto-send survey when request is marked as done
  useEffect(() => {
    requests.forEach(request => {
      if (request.status === "done" && !request.surveySent) {
        const requestCompletedTime = new Date(request.completionDate).getTime();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
        const currentTime = Date.now();
        
        // Check if 2 days have passed since completion
        if (currentTime - requestCompletedTime >= twoDaysInMs) {
          setRequests(prev =>
            prev.map(req =>
              req.id === request.id ? { ...req, surveySent: true } : req
            )
          );
          console.log(`Auto-sent WhatsApp survey to ${request.patientName} for request ${request.id} after 2 days`);
          toast({
            title: "Survey sent automatically",
            description: `WhatsApp survey sent to ${request.patientName} after 2 days`,
          });
        }
      }
    });
  }, [requests, toast]);

  // Apply date and complaint filters
  const applyFilters = (requests: typeof initialDoneRequestsWithComplaints) => {
    return requests.filter(request => {
      const requestDate = new Date(request.completionDate);
      let matchesDateFilter = true;
      
      if (dateFilters.selectedDays.length > 0 || dateFilters.selectedWeeks.length > 0 || dateFilters.selectedMonths.length > 0) {
        matchesDateFilter = false;
        
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
      }
      
      // Apply complaint filter
      let matchesComplaintFilter = true;
      if (complaintFilter) {
        matchesComplaintFilter = request.complaintStatus === complaintFilter;
      }
      
      return matchesDateFilter && matchesComplaintFilter;
    });
  };

  const filteredRequests = applyFilters(requests);

  const handleDateFilterChange = (filters: typeof dateFilters) => {
    setDateFilters(filters);
  };

  const handleComplaintFilter = (status: 'open' | 'closed' | null) => {
    setComplaintFilter(status);
  };

  const sendSurvey = (requestId: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, surveySent: true } : req
      )
    );
    console.log("Sending WhatsApp survey to patient for request:", requestId);
  };

  const handleSurveyResponseUpload = (responses: { 
    id: string; 
    responded: boolean; 
    npsScore?: number;
    hospitalName?: string;
    completionDate?: string;
    complaint?: string;
  }[]) => {
    console.log('Received survey responses:', responses);
    
    // Get existing requests from localStorage to fill missing data
    const existingRequests = JSON.parse(localStorage.getItem('medicalRequests') || '[]');
    
    // Create new requests from uploaded data or update existing ones
    const newRequests = [...requests];
    
    responses.forEach(response => {
      const existingIndex = newRequests.findIndex(req => req.id === response.id);
      
      if (existingIndex >= 0) {
        // Update existing request
        newRequests[existingIndex] = {
          ...newRequests[existingIndex],
          surveySent: true,
          surveyResponded: response.responded,
          npsScore: response.npsScore,
          hospitalName: response.hospitalName || newRequests[existingIndex].hospitalName,
          completionDate: response.completionDate || newRequests[existingIndex].completionDate,
          complaintText: response.complaint
        };
      } else {
        // Try to find request in existing requests by ID or patient MRN
        const masterRequest = existingRequests.find((req: any) => 
          req.id === response.id || 
          req.patientId === response.id ||
          req.hospitalMRN === response.id
        );
        
        // Replace hospital MRN with myclinic MRN format
        const hospitalName = response.hospitalName || 'Unknown Hospital';
        let myclinicMRN = response.id;
        if (hospitalName.toLowerCase().includes('my clinic') || hospitalName.toLowerCase().includes('myclinic')) {
          myclinicMRN = response.id; // Keep as is for My Clinic
        }

        // Create new request from uploaded data
        newRequests.push({
          id: response.id,
          patientName: masterRequest?.patientName || `Patient ${response.id}`,
          idNumber: masterRequest?.patientId || "N/A",
          phone: masterRequest?.phone || masterRequest?.patientPhone || "N/A", 
          hospitalMRN: masterRequest?.hospitalMRN || "N/A",
          myclinicMRN: myclinicMRN,
          hospitalName: response.hospitalName || masterRequest?.hospitalName || "N/A",
          procedure: masterRequest?.procedure || masterRequest?.medicalCondition || "N/A",
          treatingDoctor: masterRequest?.treatingDoctor || masterRequest?.assignedTo || "N/A",
          surveySent: true,
          surveyResponded: response.responded,
          npsScore: response.npsScore,
          completionDate: response.completionDate || new Date().toISOString().split('T')[0],
          status: "done",
          complaintStatus: response.complaint ? 'open' : null,
          complaintText: response.complaint || null,
          complaintCreatedAt: response.complaint ? new Date().toISOString() : null,
          complaintLeadTimeHours: undefined,
          complaintClosedAt: undefined
        });
      }
    });
    
    setRequests(newRequests);
    
    // Update localStorage to persist the changes
    localStorage.setItem('customerCareData', JSON.stringify(newRequests));
    
    console.log('Updated requests:', newRequests);
  };

  const handleComplaintUpload = (complaints: { id: string; status: 'open' | 'closed' }[]) => {
    setRequests(prev =>
      prev.map(request => {
        const complaint = complaints.find(c => c.id === request.id);
        if (complaint) {
          return {
            ...request,
            complaintStatus: complaint.status
          };
        }
        return request;
      })
    );
  };

  const closeComplaint = (requestId: string) => {
    const closedAt = new Date().toISOString();
    const requestToUpdate = requests.find(r => r.id === requestId);
    
    if (requestToUpdate) {
      const leadTimeHours = Math.floor(
        (new Date(closedAt).getTime() - new Date(requestToUpdate.complaintCreatedAt || requestToUpdate.completionDate).getTime()) / (1000 * 60 * 60)
      );

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId 
            ? { 
                ...req, 
                complaintStatus: 'closed' as const,
                complaintClosedAt: closedAt,
                complaintLeadTimeHours: leadTimeHours
              } 
            : req
        )
      );

      // Update localStorage to persist changes
      const customerCareData = localStorage.getItem('customerCareData');
      if (customerCareData) {
        try {
          const data = JSON.parse(customerCareData);
          const updatedData = data.map((req: any) => {
            if (req.id === requestId) {
              return {
                ...req,
                complaintStatus: 'closed',
                complaintClosedAt: closedAt,
                complaintLeadTimeHours: leadTimeHours
              };
            }
            return req;
          });
          localStorage.setItem('customerCareData', JSON.stringify(updatedData));
        } catch (error) {
          console.error('Error updating complaint in storage:', error);
        }
      }

      toast({
        title: "Complaint closed",
        description: `Complaint closed with ${leadTimeHours} hours lead time.`,
      });
    }
  };

  const sendComplimentToCoordinator = (requestId: string, coordinatorName: string, comment: string) => {
    const compliment = {
      id: `COMP-${Date.now()}`,
      requestId,
      coordinatorName,
      comment,
      patientId: requests.find(r => r.id === requestId)?.id,
      createdAt: new Date().toISOString(),
      type: 'compliment'
    };

    // Save to coordinator messages
    const coordinatorMessages = JSON.parse(localStorage.getItem('coordinatorMessages') || '[]');
    coordinatorMessages.push(compliment);
    localStorage.setItem('coordinatorMessages', JSON.stringify(coordinatorMessages));

    // Update admin metrics
    const adminMetrics = JSON.parse(localStorage.getItem('adminCoordinatorMetrics') || '{}');
    if (!adminMetrics[coordinatorName]) {
      adminMetrics[coordinatorName] = { complaints: 0, compliments: 0 };
    }
    adminMetrics[coordinatorName].compliments += 1;
    localStorage.setItem('adminCoordinatorMetrics', JSON.stringify(adminMetrics));

    toast({
      title: "Compliment sent",
      description: `Compliment sent to ${coordinatorName} successfully.`,
    });
  };

  const submitForRecovery = (requestId: string, recoveryNote: string) => {
    const recoveryCase = {
      id: `REC-${Date.now()}`,
      requestId,
      recoveryNote,
      patientId: requests.find(r => r.id === requestId)?.id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      assignedTo: 'case-coordinator'
    };

    // Save to recovery cases
    const recoveryCases = JSON.parse(localStorage.getItem('recoveryCases') || '[]');
    recoveryCases.push(recoveryCase);
    localStorage.setItem('recoveryCases', JSON.stringify(recoveryCases));

    // Update request status
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId 
          ? { ...req, recoverySubmitted: true, recoveryNote } 
          : req
      )
    );

    toast({
      title: "Recovery case submitted",
      description: "Case has been submitted to case coordinator for recovery.",
    });
  };

  const exportToExcel = () => {
    console.log("Exporting customer care data to Excel with current filters", { dateFilters, complaintFilter });
  };

  // Calculate NPS and analytics based on filtered data with proper NPS formula
  const calculateNPS = (requests: typeof filteredRequests) => {
    const respondedRequests = requests.filter(r => r.surveyResponded && r.npsScore !== undefined);
    if (respondedRequests.length === 0) return 0;
    
    const promoters = respondedRequests.filter(r => r.npsScore! >= 9).length;
    const detractors = respondedRequests.filter(r => r.npsScore! <= 6).length;
    
    return Math.round(((promoters - detractors) / respondedRequests.length) * 100);
  };

  const monthlyNPS = calculateNPS(filteredRequests);
  const ytdNPS = calculateNPS(requests); // All requests for YTD
  const targetNPS = npsTargets.customerCare; // Use configurable target
  const complaintsOpen = requests.filter(r => r.complaintStatus === 'open').length;
  const complaintsClosed = requests.filter(r => r.complaintStatus === 'closed').length;

  if (showSettings) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setShowSettings(false)}
            variant="outline"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Customer Care Settings</h1>
        </div>
        <NPSTargetSettings />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
        <div className="text-center mb-6">
          <div className="bg-blue-600 rounded-lg p-3 mb-2">
            <img 
              src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
              alt="My Clinic Logo" 
              className="h-8 w-auto mx-auto filter brightness-0 invert"
            />
          </div>
          <h1 className="text-xl font-bold text-blue-900">Customer Care</h1>
          <p className="text-sm text-blue-700">Dashboard</p>
        </div>
        
        <div className="flex flex-col gap-4 w-full mb-6">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 ${stat.color} text-white`}
            >
              <span className="text-xs">{stat.label}:</span>
              <span className="font-bold text-lg">{stat.count}</span>
            </div>
          ))}
        </div>

        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 mt-auto bg-white text-blue-600 border-white hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-white">
          <h1 className="text-2xl font-bold">Customer Care Dashboard</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              NPS Settings
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 p-6 border-b bg-white justify-between">
          <div>
            <NurseDateFilters onDateFilterChange={handleDateFilterChange} />
          </div>

          <div className="flex gap-2">
            <MessagingIcons currentUserRole="customer-care" unreadCount={unreadCount} />
            <Button onClick={exportToExcel} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-4 flex gap-4">
            <SurveyResponseUpload onUpdateResponses={handleSurveyResponseUpload} />
            <ComplaintUpload onUpdateComplaints={handleComplaintUpload} />
          </div>

          {/* Requests Table */}
          <h2 className="text-lg font-semibold mb-4">
            Completed Requests - Survey Management
            {complaintFilter && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                (Filtered by: {complaintFilter} complaints)
              </span>
            )}
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead className="min-w-40">Did your doctor explain your surgery process thoroughly before the date of the surgery?</TableHead>
                  <TableHead className="min-w-40">Did the My Clinic coordinator explain the whole process that you will go through?</TableHead>
                  <TableHead className="min-w-40">How would you rate the My Clinic coordinator's communication and support?</TableHead>
                  <TableHead className="min-w-40">How would you rate our services at the hospital?</TableHead>
                  <TableHead className="min-w-40">How would you rate your surgical experience?</TableHead>
                  <TableHead className="min-w-48">How was your experience with the post-consultation services provided by My Clinic team?</TableHead>
                  <TableHead className="min-w-32">On a scale of 1-5, how would you rate your overall experience?</TableHead>
                  <TableHead className="min-w-32">On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)</TableHead>
                  <TableHead className="min-w-40">Comments/Suggestions</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req, index) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.__EMPTY || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{req.__EMPTY_1 || "-"}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req["Answered: 24"] === "Yes - نعم" || req["Answered: 24"] === "Yes" ? "bg-green-100 text-green-800" : 
                        req["Answered: 24"] === "No - لا" || req["Answered: 24"] === "No" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {req["Answered: 24"] || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.__EMPTY_2 === "Yes - نعم" || req.__EMPTY_2 === "Yes" ? "bg-green-100 text-green-800" : 
                        req.__EMPTY_2 === "No - لا" || req.__EMPTY_2 === "No" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {req.__EMPTY_2 || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.__EMPTY_3 >= 4 ? "bg-green-100 text-green-800" :
                        req.__EMPTY_3 >= 3 ? "bg-yellow-100 text-yellow-800" :
                        req.__EMPTY_3 && req.__EMPTY_3 > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {req.__EMPTY_3 || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        parseInt(req["Response Rate: 31%"]) >= 4 ? "bg-green-100 text-green-800" :
                        parseInt(req["Response Rate: 31%"]) >= 3 ? "bg-yellow-100 text-yellow-800" :
                        parseInt(req["Response Rate: 31%"]) >= 1 ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {req["Response Rate: 31%"] || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.__EMPTY_5?.toLowerCase()?.includes("satisfactory") ? "bg-green-100 text-green-800" :
                        req.__EMPTY_5?.toLowerCase()?.includes("unsatisfactory") ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {req.__EMPTY_5 || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.__EMPTY_6?.toLowerCase()?.includes("satisfactory") ? "bg-green-100 text-green-800" :
                        req.__EMPTY_6?.toLowerCase()?.includes("unsatisfactory") ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {req.__EMPTY_6 || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.__EMPTY_7?.toLowerCase()?.includes("satisfactory") ? "bg-green-100 text-green-800" :
                        req.__EMPTY_7?.toLowerCase()?.includes("unsatisfactory") ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {req.__EMPTY_7 || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (req.npsScore || req.__EMPTY_7) >= 9 ? "bg-green-100 text-green-800" :
                        (req.npsScore || req.__EMPTY_7) >= 7 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {req.npsScore || req.__EMPTY_7 || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {req.__EMPTY_8 && req.__EMPTY_8 !== "No Comment" ? (
                        req.__EMPTY_8.length > 50 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 truncate">
                              {req.__EMPTY_8.substring(0, 50)}...
                            </span>
                            <CommentViewDialog 
                              comment={req.__EMPTY_8}
                              patientId={req.id || req.__EMPTY_1}
                              npsScore={req.npsScore || req.__EMPTY_7}
                              coordinatorName={req.assignedCoordinator || req.caseCoordinator}
                              onSendCompliment={sendComplimentToCoordinator}
                              onSubmitRecovery={submitForRecovery}
                              requestId={req.id}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{req.__EMPTY_8}</span>
                            <CommentViewDialog 
                              comment={req.__EMPTY_8}
                              patientId={req.id || req.__EMPTY_1}
                              npsScore={req.npsScore || req.__EMPTY_7}
                              coordinatorName={req.assignedCoordinator || req.caseCoordinator}
                              onSendCompliment={sendComplimentToCoordinator}
                              onSubmitRecovery={submitForRecovery}
                              requestId={req.id}
                            />
                          </div>
                        )
                      ) : (
                        <span className="text-gray-400 text-xs">No Comment</span>
                      )}
                    </TableCell>
                    <TableCell>{req.hospitalName || req.__EMPTY_9 || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!req.surveySent ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => sendSurvey(req.id)}
                            className="text-xs"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Send Survey
                          </Button>
                        ) : (
                          <span className="text-green-600 text-xs">✓ Sent</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Analytics */}
          <CustomerCareAnalytics
            monthlyNPS={monthlyNPS}
            ytdNPS={ytdNPS}
            targetNPS={targetNPS}
            complaintsOpen={complaintsOpen}
            complaintsClosed={complaintsClosed}
            onComplaintFilter={handleComplaintFilter}
            activeComplaintFilter={complaintFilter}
          />

          {/* Footer */}
          <Footer />
        </div>
      </main>
    </div>
  );
}
