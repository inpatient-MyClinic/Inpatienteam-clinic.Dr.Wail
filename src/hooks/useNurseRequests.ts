
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Request workflow statuses
export const REQUEST_STATUSES = {
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

export interface NurseRequest {
  id: number;
  patientName: string;
  mrn: string;
  serviceDescription: string;
  hospital: string;
  status: string;
  paymentStatus: string;
  assignedDoctor: string;
  createdAt: string;
  phone: string;
  expectedSurgeryDate: string;
  createdBy: string;
  attachments: string[];
  isDelayed: boolean;
  notifications: string[];
}

export const useNurseRequests = (currentNurseName: string) => {
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<NurseRequest[]>([
    {
      id: 1,
      patientName: "Layla Hasan",
      mrn: "2019988776",
      serviceDescription: "Cardiac Surgery - Valve Replacement",
      hospital: "King Khaled Hospital",
      status: REQUEST_STATUSES.PENDING,
      paymentStatus: "Pending",
      assignedDoctor: "Dr. Ahmed Salem",
      createdAt: "2024-01-10T11:00:00Z",
      phone: "0554447777",
      expectedSurgeryDate: "2025-07-12",
      createdBy: "Nurse Sara",
      attachments: ["patient_records.pdf"],
      isDelayed: false,
      notifications: []
    },
    {
      id: 2,
      patientName: "Khaled Ali",
      mrn: "2015566778",
      serviceDescription: "Orthopedic Surgery - Hip Replacement",
      hospital: "King Abdulaziz Hospital",
      status: REQUEST_STATUSES.NOT_COMPLETED,
      paymentStatus: "Pending",
      assignedDoctor: "Dr. Mohammed Ali",
      createdAt: "2024-01-09T15:30:00Z",
      phone: "0508889992",
      expectedSurgeryDate: "2025-07-14",
      createdBy: "Nurse Sara",
      attachments: [],
      isDelayed: false,
      notifications: ["Request marked as incomplete by coordinator - additional documentation required"]
    },
  ]);

  // Check for delayed requests
  useEffect(() => {
    const checkDelayedRequests = () => {
      const now = new Date();
      const businessStart = 9; // 9 AM
      const businessEnd = 20; // 8 PM
      
      setRequests(prev => prev.map(req => {
        if (req.status === REQUEST_STATUSES.PENDING) {
          const createdTime = new Date(req.createdAt);
          const hoursDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
          
          const currentHour = now.getHours();
          const isBusinessHours = currentHour >= businessStart && currentHour <= businessEnd;
          
          if (hoursDiff >= 4 && isBusinessHours && !req.isDelayed) {
            return {
              ...req,
              isDelayed: true,
              status: REQUEST_STATUSES.DELAYED,
              notifications: [...req.notifications, "Request automatically forwarded to hospital due to delay"]
            };
          }
        }
        return req;
      }));
    };

    const interval = setInterval(checkDelayedRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle notifications for incomplete requests
  useEffect(() => {
    const incompleteRequests = requests.filter(req => req.status === REQUEST_STATUSES.NOT_COMPLETED);
    incompleteRequests.forEach(req => {
      toast({
        title: "Action Required",
        description: `Request ${req.id} for ${req.patientName} needs completion`,
        variant: "destructive",
      });
    });
  }, [requests, toast]);

  const updateStatus = (requestId: number, newStatus: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { 
          ...req, 
          status: newStatus,
          notifications: [...req.notifications, `Status updated to ${newStatus}`]
        } : req
      )
    );

    toast({
      title: "Status Updated",
      description: `Request ${requestId} status changed to ${newStatus}`,
    });
  };

  // Filter to show only requests created by this nurse
  const filteredRequests = requests.filter(request => 
    request.createdBy === currentNurseName
  );

  return {
    requests,
    filteredRequests,
    updateStatus
  };
};
