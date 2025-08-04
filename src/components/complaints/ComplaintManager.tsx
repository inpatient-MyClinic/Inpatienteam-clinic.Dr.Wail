import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Clock, MessageCircle, Save, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Complaint {
  id: string;
  patientName: string;
  complaintText: string;
  status: 'open' | 'in-progress' | 'closed';
  createdAt: string;
  assignedTo?: string;
  responses: ComplaintResponse[];
  leadTimeHours?: number;
  closedAt?: string;
}

interface ComplaintResponse {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  isDraft: boolean;
}

interface ComplaintManagerProps {
  currentUserRole: 'case-coordinator' | 'admin';
  currentUserName: string;
}

export default function ComplaintManager({ currentUserRole, currentUserName }: ComplaintManagerProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  // Load complaints from localStorage
  useEffect(() => {
    const loadComplaints = () => {
      const customerCareData = localStorage.getItem('customerCareData');
      if (customerCareData) {
        try {
          const data = JSON.parse(customerCareData);
          const openComplaints = data.filter((req: any) => req.complaintStatus === 'open' || req.complaintStatus === 'in-progress');
          
          // Convert to complaint format
          const complaintData: Complaint[] = openComplaints.map((req: any) => ({
            id: req.id,
            patientName: req.patientName,
            complaintText: req.complaintText || "Patient complaint registered",
            status: req.complaintStatus,
            createdAt: req.complaintCreatedAt || req.completionDate,
            assignedTo: req.complaintAssignedTo || currentUserName,
            responses: req.complaintResponses || [],
            leadTimeHours: req.complaintLeadTimeHours,
            closedAt: req.complaintClosedAt
          }));
          
          setComplaints(complaintData);
        } catch (error) {
          console.error('Error loading complaints:', error);
        }
      }
    };

    loadComplaints();
    
    // Listen for updates
    const handleUpdate = () => loadComplaints();
    window.addEventListener('complaintsUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('complaintsUpdated', handleUpdate);
    };
  }, [currentUserName]);

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponseText("");
    setShowDialog(true);
  };

  const saveDraft = () => {
    if (!selectedComplaint || !responseText.trim()) return;

    const draftResponse: ComplaintResponse = {
      id: Date.now().toString(),
      text: responseText,
      author: currentUserName,
      createdAt: new Date().toISOString(),
      isDraft: true
    };

    const updatedComplaint = {
      ...selectedComplaint,
      responses: [...selectedComplaint.responses, draftResponse],
      status: 'in-progress' as const
    };

    updateComplaintInStorage(updatedComplaint);
    setSelectedComplaint(updatedComplaint);
    setResponseText("");
    
    toast({
      title: "Draft saved",
      description: "Your response has been saved as a draft.",
    });
  };

  const submitResponse = () => {
    if (!selectedComplaint || !responseText.trim()) return;

    const response: ComplaintResponse = {
      id: Date.now().toString(),
      text: responseText,
      author: currentUserName,
      createdAt: new Date().toISOString(),
      isDraft: false
    };

    const closedAt = new Date().toISOString();
    const leadTimeHours = Math.floor(
      (new Date(closedAt).getTime() - new Date(selectedComplaint.createdAt).getTime()) / (1000 * 60 * 60)
    );

    const updatedComplaint = {
      ...selectedComplaint,
      responses: [...selectedComplaint.responses, response],
      status: 'closed' as const,
      closedAt,
      leadTimeHours
    };

    updateComplaintInStorage(updatedComplaint);
    setShowDialog(false);
    
    toast({
      title: "Complaint resolved",
      description: `Complaint closed with ${leadTimeHours} hours lead time.`,
    });
  };

  const updateComplaintInStorage = (updatedComplaint: Complaint) => {
    const customerCareData = localStorage.getItem('customerCareData');
    if (customerCareData) {
      try {
        const data = JSON.parse(customerCareData);
        const updatedData = data.map((req: any) => {
          if (req.id === updatedComplaint.id) {
            return {
              ...req,
              complaintStatus: updatedComplaint.status,
              complaintResponses: updatedComplaint.responses,
              complaintAssignedTo: updatedComplaint.assignedTo,
              complaintClosedAt: updatedComplaint.closedAt,
              complaintLeadTimeHours: updatedComplaint.leadTimeHours
            };
          }
          return req;
        });
        
        localStorage.setItem('customerCareData', JSON.stringify(updatedData));
        window.dispatchEvent(new CustomEvent('complaintsUpdated'));
        
        // Update local state
        setComplaints(prev => 
          prev.map(c => c.id === updatedComplaint.id ? updatedComplaint : c)
            .filter(c => c.status !== 'closed')
        );
      } catch (error) {
        console.error('Error updating complaint:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadTimeColor = (hours: number) => {
    if (hours <= 24) return 'text-green-600';
    if (hours <= 48) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold">Complaints Management</h3>
        <Badge variant="secondary">{complaints.length} Active</Badge>
      </div>

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            No active complaints
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{complaint.patientName}</h4>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {complaint.complaintText}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </div>
                      {complaint.responses.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {complaint.responses.length} responses
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewComplaint(complaint)}
                  >
                    View & Respond
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Complaint Response Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complaint Details & Response</DialogTitle>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Patient: {selectedComplaint.patientName}</h4>
                <p className="text-gray-600 mb-4">{selectedComplaint.complaintText}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Created: {new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                  <Badge className={getStatusColor(selectedComplaint.status)}>
                    {selectedComplaint.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Previous Responses */}
              {selectedComplaint.responses.length > 0 && (
                <div>
                  <h5 className="font-medium mb-3">Previous Responses</h5>
                  <div className="space-y-3">
                    {selectedComplaint.responses.map((response) => (
                      <div key={response.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{response.author}</span>
                          {response.isDraft && (
                            <Badge variant="outline" className="text-xs">Draft</Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(response.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{response.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Response Form */}
              <div>
                <h5 className="font-medium mb-3">Your Response</h5>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response to the complaint..."
                  className="min-h-[100px] mb-4"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={saveDraft}
                    disabled={!responseText.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={submitResponse}
                    disabled={!responseText.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit & Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}