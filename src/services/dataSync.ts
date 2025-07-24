import { loadUsersFromStorage } from '@/components/settings/userManagement/UserStorage';
import { hospitals } from '@/data/medicalData';

interface UserWithStringIndex {
  [key: string]: any;
  "Doctor Name"?: string;
  "Email"?: string;
  "Hospital"?: string;
  "Role"?: string;
}

export class DataSyncService {
  
  // Get all hospital names from users and static data
  static getAllHospitalNames(): string[] {
    const users = loadUsersFromStorage() as UserWithStringIndex[];
    const userHospitals = users
      .filter(user => user["Hospital"] && user["Hospital"].trim() !== '')
      .map(user => user["Hospital"]);
    
    // Combine static hospitals with user hospitals and remove duplicates
    const allHospitals = [...new Set([...hospitals, ...userHospitals])];
    
    // Filter out demo/test hospital names
    return allHospitals.filter(hospital => 
      !hospital.toLowerCase().includes('demo') &&
      !hospital.toLowerCase().includes('test') &&
      !hospital.toLowerCase().includes('sample')
    );
  }

  // Get all doctor names from users
  static getAllDoctorNames(): string[] {
    const users = loadUsersFromStorage() as UserWithStringIndex[];
    return users
      .filter(user => user["Role"] === 'doctor' && user["Doctor Name"] && user["Doctor Name"].trim() !== '')
      .map(user => user["Doctor Name"])
      .filter(name => 
        !name.toLowerCase().includes('demo') &&
        !name.toLowerCase().includes('test') &&
        !name.toLowerCase().includes('sample')
      );
  }

  // Sync hospital names across all requests
  static syncHospitalNames(): void {
    const validHospitals = this.getAllHospitalNames();
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    
    let updated = false;
    const updatedRequests = requests.map((request: any) => {
      // Update hospitalName if it's a demo/test hospital
      if (request.hospitalName && 
          (request.hospitalName.toLowerCase().includes('demo') ||
           request.hospitalName.toLowerCase().includes('test') ||
           request.hospitalName.toLowerCase().includes('sample'))) {
        updated = true;
        return {
          ...request,
          hospitalName: validHospitals[0] || 'DSAH'
        };
      }
      return request;
    });

    if (updated) {
      localStorage.setItem('medical_requests', JSON.stringify(updatedRequests));
      console.log('Hospital names synchronized across requests');
    }
  }

  // Sync doctor names across all requests
  static syncDoctorNames(): void {
    const validDoctors = this.getAllDoctorNames();
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    
    let updated = false;
    const updatedRequests = requests.map((request: any) => {
      // Update doctorName if it's a demo/test doctor
      if (request.doctorName && 
          (request.doctorName.toLowerCase().includes('demo') ||
           request.doctorName.toLowerCase().includes('test') ||
           request.doctorName.toLowerCase().includes('sample'))) {
        updated = true;
        return {
          ...request,
          doctorName: validDoctors[0] || 'Dr. System User'
        };
      }
      return request;
    });

    if (updated) {
      localStorage.setItem('medical_requests', JSON.stringify(updatedRequests));
      console.log('Doctor names synchronized across requests');
    }
  }

  // Clean demo data from all storage
  static cleanDemoData(): void {
    // Clean requests
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    const cleanedRequests = requests.filter((request: any) => {
      const isDemoRequest = 
        (request.hospitalName && 
         (request.hospitalName.toLowerCase().includes('demo') ||
          request.hospitalName.toLowerCase().includes('test') ||
          request.hospitalName.toLowerCase().includes('sample'))) ||
        (request.doctorName && 
         (request.doctorName.toLowerCase().includes('demo') ||
          request.doctorName.toLowerCase().includes('test') ||
          request.doctorName.toLowerCase().includes('sample'))) ||
        (request.patientName && 
         (request.patientName.toLowerCase().includes('demo') ||
          request.patientName.toLowerCase().includes('test') ||
          request.patientName.toLowerCase().includes('sample')));
      
      return !isDemoRequest;
    });

    localStorage.setItem('medical_requests', JSON.stringify(cleanedRequests));

    // Clean users
    const users = loadUsersFromStorage() as UserWithStringIndex[];
    const cleanedUsers = users.filter(user => {
      const isDemoUser = 
        (user["Doctor Name"] && 
         (user["Doctor Name"].toLowerCase().includes('demo') ||
          user["Doctor Name"].toLowerCase().includes('test') ||
          user["Doctor Name"].toLowerCase().includes('sample'))) ||
        (user["Email"] && 
         (user["Email"].toLowerCase().includes('demo') ||
          user["Email"].toLowerCase().includes('test') ||
          user["Email"].toLowerCase().includes('sample'))) ||
        (user["Hospital"] && 
         (user["Hospital"].toLowerCase().includes('demo') ||
          user["Hospital"].toLowerCase().includes('test') ||
          user["Hospital"].toLowerCase().includes('sample')));
      
      return !isDemoUser;
    });

    localStorage.setItem('enhancedUserManagementUsers', JSON.stringify(cleanedUsers));

    console.log('Demo data cleaned from system');
  }

  // Initialize production-ready system
  static initializeProduction(): void {
    this.cleanDemoData();
    this.syncHospitalNames();
    this.syncDoctorNames();
    
    // Clear notifications
    localStorage.setItem('notifications', JSON.stringify([]));
    
    console.log('System initialized for production use');
  }
}