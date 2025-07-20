import { RequestFormData } from "@/types/request";

export interface StoredRequest extends RequestFormData {
  id: number;
  createdBy?: string;
  isDelayed?: boolean;
  notifications?: string[];
  paymentStatus?: "Paid" | "Not Paid";
  assignedCoordinator?: string;
  coordinatorActionTime?: string;
  delayCause?: "doctor" | "hospital" | "insurance" | "patient";
  agreedSurgeryDate?: string;
  assignedDoctor?: string;
}

class RequestStorageService {
  private readonly STORAGE_KEY = 'medical_requests';
  private requestId = 1000; // Start with high number to avoid conflicts

  // Get all requests from localStorage
  getAllRequests(): StoredRequest[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading requests:', error);
      return [];
    }
  }

  // Save a new request
  saveRequest(requestData: RequestFormData, createdBy?: string): StoredRequest {
    const requests = this.getAllRequests();
    
    const newRequest: StoredRequest = {
      ...requestData,
      id: this.requestId++,
      createdBy: createdBy || 'Unknown User',
      isDelayed: false,
      notifications: [],
      paymentStatus: 'Not Paid',
      status: requestData.status || 'Pending'
    };

    requests.push(newRequest);
    this.saveToStorage(requests);
    
    console.log('Request saved:', newRequest);
    return newRequest;
  }

  // Update an existing request
  updateRequest(id: number, updates: Partial<StoredRequest>): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex(req => req.id === id);
    
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      this.saveToStorage(requests);
      console.log('Request updated:', requests[index]);
    }
  }

  // Get requests by doctor
  getRequestsByDoctor(doctorName: string): StoredRequest[] {
    return this.getAllRequests().filter(req => 
      req.doctorName === doctorName || req.assignedDoctor === doctorName
    );
  }

  // Get requests by coordinator
  getRequestsByCoordinator(coordinatorName: string): StoredRequest[] {
    return this.getAllRequests().filter(req => 
      req.assignedCoordinator === coordinatorName
    );
  }

  // Get requests by hospital
  getRequestsByHospital(hospitalName: string): StoredRequest[] {
    return this.getAllRequests().filter(req => 
      req.hospitalName === hospitalName || req.referredToHospital === hospitalName
    );
  }

  private saveToStorage(requests: StoredRequest[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving requests:', error);
    }
  }

  // Initialize with sample data if empty
  initializeSampleData(): void {
    if (this.getAllRequests().length === 0) {
      const sampleRequests: Omit<StoredRequest, 'id'>[] = [
        {
          dateCreated: "2024-01-15",
          timeCreated: "10:30",
          patientName: "Ahmed Hassan",
          patientNationalId: "1234567890",
          patientMobileNo: "0554447777",
          specialty: "cardiology",
          doctorName: "Dr. Ahmed Salem",
          referredFrom: "Emergency",
          referredToHospital: "King Khaled Hospital",
          hospitalMRN: "MRN-001",
          hospitalName: "King Khaled Hospital",
          serviceDescription: "Cardiac Surgery - Valve Replacement",
          expectedSurgeryDate: "2024-02-01",
          admissionType: "Emergency",
          history: "Patient history",
          notes: "Additional notes",
          status: "Approved",
          createdBy: "Nurse Sara",
          isDelayed: false,
          notifications: [],
          paymentStatus: "Not Paid",
          assignedCoordinator: "Sarah Johnson",
          coordinatorActionTime: "2024-01-15T11:00:00Z",
          attachments: ["cardiac_report.pdf"]
        }
      ];

      sampleRequests.forEach(req => {
        this.saveRequest(req as RequestFormData, req.createdBy);
      });
    }
  }
}

export const requestStorage = new RequestStorageService();