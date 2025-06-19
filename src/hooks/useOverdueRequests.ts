
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface OverdueRequest {
  id: number;
  patientName: string;
  mrn?: string;
  idNumber?: string;
  phone: string;
  agreedSurgeryDate: string;
  hospital: string;
  specialty: string;
  doctorName: string;
  status: string;
  coordinator: string | null;
  createdAt: string;
  isOverdue: boolean;
  isDelayed?: boolean;
  overdueTimestamp?: string;
  attachments: string[];
  notifications: string[];
  rejectionCause?: string | null;
  pendingCause?: string | null;
  plannedCause?: string | null;
}

export const useOverdueRequests = () => {
  const { toast } = useToast();

  const checkBusinessHours = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 10 && currentHour <= 20; // 10 AM to 8 PM
  };

  const sendHospitalNotification = async (request: OverdueRequest) => {
    // Simulate hospital notification
    console.log("Sending hospital notification for request:", request.id);
    
    // In a real implementation, this would call an API
    const notificationData = {
      type: "new_request_assignment",
      requestId: request.id,
      patientName: request.patientName,
      hospital: request.hospital,
      specialty: request.specialty,
      doctorName: request.doctorName,
      urgency: request.isOverdue ? "overdue" : "normal",
      attachments: request.attachments,
      requestData: {
        phone: request.phone,
        agreedSurgeryDate: request.agreedSurgeryDate,
        createdAt: request.createdAt
      }
    };

    try {
      // Simulate API call for hospital notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Hospital Notified",
        description: `${request.hospital} has been notified about request ${request.id}`,
      });

      return true;
    } catch (error) {
      console.error("Failed to send hospital notification:", error);
      toast({
        title: "Notification Failed",
        description: "Failed to notify hospital. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendHospitalEmail = async (request: OverdueRequest) => {
    // Simulate email sending
    console.log("Sending hospital email for request:", request.id);
    
    const emailData = {
      to: `${request.hospital.toLowerCase().replace(/\s+/g, '')}@hospital.com`,
      subject: `${request.isOverdue ? 'OVERDUE' : 'NEW'} Medical Request Assignment - ${request.patientName}`,
      body: `
        Dear ${request.hospital} Team,

        A ${request.isOverdue ? 'OVERDUE ' : ''}medical request has been assigned to your hospital.

        Patient Details:
        - Name: ${request.patientName}
        - Phone: ${request.phone}
        - Agreed Surgery Date: ${request.agreedSurgeryDate}

        Medical Information:
        - Specialty: ${request.specialty}
        - Doctor: ${request.doctorName}
        - Hospital: ${request.hospital}

        Request Information:
        - Request ID: ${request.id}
        - Created: ${new Date(request.createdAt).toLocaleDateString()}
        - Status: ${request.status}
        ${request.isOverdue ? '- OVERDUE: This request was not processed within the required timeframe' : ''}

        Attachments: ${request.attachments.length > 0 ? request.attachments.join(', ') : 'None'}

        Please log into the system to view full details and take necessary action.

        Best regards,
        Medical Request System
      `,
      attachments: request.attachments
    };

    try {
      // Simulate API call for email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Email Sent",
        description: `Email sent to ${request.hospital}`,
      });

      return true;
    } catch (error) {
      console.error("Failed to send hospital email:", error);
      toast({
        title: "Email Failed",
        description: "Failed to send email to hospital. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const assignToHospital = async (request: OverdueRequest, isAutomatic = false) => {
    const updatedRequest = {
      ...request,
      status: "Submitted to Hospital",
      notifications: [
        ...request.notifications,
        `${isAutomatic ? 'Automatically' : 'Manually'} assigned to ${request.hospital} ${isAutomatic ? 'due to coordinator inactivity' : 'by case coordinator'}`
      ]
    };

    // Send notifications and email
    const notificationSent = await sendHospitalNotification(updatedRequest);
    const emailSent = await sendHospitalEmail(updatedRequest);

    if (notificationSent && emailSent) {
      toast({
        title: isAutomatic ? "Request Auto-Assigned" : "Request Assigned",
        description: `Request ${request.id} has been ${isAutomatic ? 'automatically ' : ''}assigned to ${request.hospital}`,
        variant: isAutomatic ? "destructive" : "default",
      });
    }

    return updatedRequest;
  };

  const checkOverdueRequests = (requests: OverdueRequest[]) => {
    if (!checkBusinessHours()) return requests;

    const now = new Date();
    
    return requests.map(request => {
      // Skip if already processed or assigned
      if (request.coordinator || request.status === "Submitted to Hospital" || request.isOverdue) {
        return request;
      }

      const createdTime = new Date(request.createdAt);
      const hoursDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);

      // Check if request is overdue (4+ hours during business hours)
      if (hoursDiff >= 4) {
        const overdueRequest = {
          ...request,
          isOverdue: true,
          overdueTimestamp: now.toISOString(),
          status: "Submitted to Hospital",
          notifications: [
            ...request.notifications,
            `Request automatically forwarded to ${request.hospital} due to coordinator inactivity (overdue)`
          ]
        };

        // Trigger hospital assignment asynchronously
        assignToHospital(overdueRequest, true);

        return overdueRequest;
      }

      return request;
    });
  };

  return {
    checkOverdueRequests,
    assignToHospital,
    sendHospitalNotification,
    sendHospitalEmail,
    checkBusinessHours
  };
};
