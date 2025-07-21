
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, LogOut, FileQuestion, Clock, Eye, Send, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/components/Logo";

interface DoctorSidebarProps {
  currentDoctorName: string;
  filteredRequests: any[];
  onCreateNewRequest: () => void;
  activeStatusFilter: string | null;
  onStatusFilterClick: (status: string | null) => void;
}

export default function DoctorSidebar({ 
  currentDoctorName, 
  filteredRequests, 
  onCreateNewRequest,
  activeStatusFilter,
  onStatusFilterClick
}: DoctorSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [justificationText, setJustificationText] = useState("");

  const handleLogout = () => {
    // Clear all user data from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('user_') || key.startsWith('password_') || key.startsWith('lastPasswordUpdate_')) {
        localStorage.removeItem(key);
      }
    });

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });

    navigate("/");
  };

  // Calculate status counts
  const statusCounts = {
    pending: filteredRequests.filter(req => req.status === "Pending").length,
    underProcess: filteredRequests.filter(req => req.status === "Under Process").length,
    needJustification: filteredRequests.filter(req => req.status === "Need Justification").length,
    done: filteredRequests.filter(req => req.status === "Done").length,
    rejected: filteredRequests.filter(req => req.status === "Rejected").length,
    delayed: filteredRequests.filter(req => req.isDelayed).length,
  };

  const getNeedJustificationRequests = () => {
    return filteredRequests.filter(req => req.status === "Need Justification");
  };

  const getDelayedRequests = () => {
    return filteredRequests.filter(req => req.isDelayed);
  };

  const submitJustification = (requestId: number) => {
    if (!justificationText.trim()) {
      toast({
        title: "Error",
        description: "Please provide justification text",
        variant: "destructive"
      });
      return;
    }

    setJustificationText("");
    toast({
      title: "Justification Submitted",
      description: "Request has been forwarded with additional justification",
    });
  };

  return (
    <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
      <Logo size="sm" showText={false} className="mb-4" />
      
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold text-blue-900">Doctor Dashboard</h1>
        <p className="text-xs text-blue-700">{currentDoctorName}</p>
      </div>

      <Button className="w-full mb-6" variant="default" onClick={onCreateNewRequest}>
        <Plus className="w-4 h-4 mr-2" />
        Create New Request
      </Button>

      {/* Status Stats */}
      <div className="w-full space-y-2 mb-6">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Pending", value: statusCounts.pending, color: "bg-yellow-600", key: "pending" },
            { label: "Under Process", value: statusCounts.underProcess, color: "bg-blue-600", key: "under_process" },
            { label: "Need Justification", value: statusCounts.needJustification, color: "bg-orange-600", key: "need_justification" },
            { label: "Done", value: statusCounts.done, color: "bg-green-600", key: "done" },
            { label: "Rejected", value: statusCounts.rejected, color: "bg-red-600", key: "rejected" },
            { label: "Delayed", value: statusCounts.delayed, color: "bg-gray-600", key: "delayed" },
          ].map((stat) => (
            <div
              key={stat.key}
              className={`${stat.color} text-white p-3 rounded-lg text-center cursor-pointer transition-all duration-200 ${
                activeStatusFilter === stat.key.replace('_', ' ') ? 'ring-2 ring-white ring-offset-2' : 'hover:opacity-80'
              }`}
              onClick={() => onStatusFilterClick(activeStatusFilter === stat.key.replace('_', ' ') ? null : stat.key.replace('_', ' '))}
            >
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Need Justification Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="bg-pink-600 text-white p-3 rounded-lg text-center cursor-pointer transition-all duration-200 hover:opacity-80">
              <div className="text-xl font-bold">{statusCounts.needJustification}</div>
              <div className="text-xs">Need Justification</div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-pink-800">Doctor - Requests Needing Justification</DialogTitle>
              <DialogDescription>
                Review and provide medical justification for these cases
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {getNeedJustificationRequests().length === 0 ? (
                <p className="text-center text-gray-500 py-8">No requests currently need justification</p>
              ) : (
                getNeedJustificationRequests().map((req) => (
                  <div key={req.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start bg-pink-50 p-3 rounded">
                      <div>
                        <h3 className="font-semibold text-pink-900">{req.patientName}</h3>
                        <p className="text-sm text-pink-700">MRN: {req.mrn} | Specialty: {req.specialty}</p>
                      </div>
                      <span className="px-2 py-1 bg-pink-200 text-pink-800 rounded text-xs">
                        Medical Justification Required
                      </span>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <Label className="font-semibold text-yellow-800">Hospital Review Comments</Label>
                      <div className="mt-2 bg-white p-2 rounded text-sm">
                        <p>"This procedure requires enhanced medical justification. Please provide detailed clinical assessment, diagnostic findings, and treatment rationale."</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded">
                      <Label className="font-semibold text-green-800">Provide Medical Justification</Label>
                      <Textarea
                        placeholder="Include clinical findings, diagnostic results, treatment history, and medical necessity..."
                        value={justificationText}
                        onChange={(e) => setJustificationText(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-3">
                        <Button 
                          onClick={() => submitJustification(req.id)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!justificationText.trim()}
                          size="sm"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Submit Justification
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delayed Requests Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="bg-red-600 text-white p-3 rounded-lg text-center cursor-pointer transition-all duration-200 hover:opacity-80">
              <div className="text-xl font-bold">{statusCounts.delayed}</div>
              <div className="text-xs">Delayed Cases</div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-red-800">Doctor - Delayed Cases</DialogTitle>
              <DialogDescription>
                Review delayed cases and understand the reasons for delays
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {getDelayedRequests().length === 0 ? (
                <p className="text-center text-gray-500 py-8">No delayed cases</p>
              ) : (
                getDelayedRequests().map((req) => (
                  <div key={req.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start bg-red-50 p-3 rounded">
                      <div>
                        <h3 className="font-semibold text-red-900">{req.patientName}</h3>
                        <p className="text-sm text-red-700">MRN: {req.mrn} | Specialty: {req.specialty}</p>
                      </div>
                      <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs">
                        DELAYED
                      </span>
                    </div>

                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                      <Label className="font-semibold text-orange-800">Delay Reasons</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="bg-white p-2 rounded">
                          <p>• Waiting for additional diagnostic tests</p>
                          <p>• Hospital scheduling constraints</p>
                          <p>• Insurance authorization pending</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded">
                      <Label className="font-semibold text-blue-800">Action Required</Label>
                      <p className="text-sm mt-1">Follow up with case coordinator or contact hospital</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Contact Team
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-auto space-y-2 w-full">
        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>

        <Button 
          variant="destructive"
          onClick={handleLogout}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
