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
      this.triggerStorageEvent();
    } catch (error) {
      console.error('Error saving requests:', error);
    }
  }

  // Initialize with sample data if empty and not cleared by admin
  initializeSampleData(): void {
    try {
      const sampleDataCleared = localStorage.getItem('sample_data_cleared');
      if (this.getAllRequests().length === 0 && !sampleDataCleared) {
        console.log('No requests found, initializing with sample data...');
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
        },
        {
          dateCreated: "2024-01-16",
          timeCreated: "14:20",
          patientName: "Sara Ali", 
          patientNationalId: "2345678901",
          patientMobileNo: "0555558888",
          specialty: "orthopedics",
          doctorName: "Dr. Mohammed Khalil",
          referredFrom: "Outpatient",
          referredToHospital: "King Abdulaziz Hospital",
          hospitalMRN: "MRN-002",
          hospitalName: "King Abdulaziz Hospital", 
          serviceDescription: "Orthopedic Surgery - Knee Replacement",
          expectedSurgeryDate: "2024-02-10",
          admissionType: "Elective",
          history: "Knee pain for 2 years",
          notes: "Requires pre-operative assessment",
          status: "Pending",
          createdBy: "Nurse Ahmed",
          isDelayed: false,
          notifications: [],
          paymentStatus: "Not Paid",
          attachments: ["xray_knee.pdf"]
        },
        {
          dateCreated: "2024-01-17",
          timeCreated: "09:15",
          patientName: "Omar Khalil",
          patientNationalId: "3456789012", 
          patientMobileNo: "0566669999",
          specialty: "neurosurgery",
          doctorName: "Dr. Fatima Nour",
          referredFrom: "Emergency",
          referredToHospital: "King Faisal Hospital",
          hospitalMRN: "MRN-003",
          hospitalName: "King Faisal Hospital",
          serviceDescription: "Neurosurgery - Brain Tumor Removal",
          expectedSurgeryDate: "2024-02-15",
          admissionType: "Emergency",
          history: "Recent onset headaches and vision changes",
          notes: "Urgent case requires immediate attention",
          status: "Under Process",
          createdBy: "Nurse Fatima",
          isDelayed: false,
          notifications: [],
          paymentStatus: "Not Paid",
          coordinatorActionTime: "2024-01-17T10:00:00Z",
          attachments: ["mri_brain.pdf", "ct_scan.pdf"]
        }
      ];

        sampleRequests.forEach(req => {
          this.saveRequest(req as RequestFormData, req.createdBy);
        });
      } else {
        console.log('Found existing requests, skipping sample data initialization');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
  
  // Clear all data for debugging
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.setItem('sample_data_cleared', 'true');
    this.triggerStorageEvent();
    console.log('All request data cleared');
  }
  
  // Force trigger events when data changes
  private triggerStorageEvent(): void {
    // Trigger both storage and custom events
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.STORAGE_KEY,
      newValue: localStorage.getItem(this.STORAGE_KEY)
    }));
    window.dispatchEvent(new CustomEvent('requestsUpdated'));
  }
}

export const requestStorage = new RequestStorageService();