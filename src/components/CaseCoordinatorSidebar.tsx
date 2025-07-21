
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Plus, FileQuestion, Clock, Eye, Send, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/components/Logo";

interface CaseCoordinatorSidebarProps {
  currentCoordinatorName: string;
  allStats: Array<{
    label: string;
    value: number;
    color: string;
    key: string;
  }>;
  coordinatorStats: Array<{
    label: string;
    value: number;
    color: string;
    key: string;
  }>;
  activeStatusFilter: string | null;
  onStatusFilterClick: (status: string | null) => void;
  filteredRequests?: any[]; // Add this for getting request details
}

export default function CaseCoordinatorSidebar({ 
  currentCoordinatorName, 
  allStats,
  coordinatorStats,
  activeStatusFilter,
  onStatusFilterClick,
  filteredRequests = []
}: CaseCoordinatorSidebarProps) {
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

  const handleCreateRequest = () => {
    navigate("/create-request");
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
      title: "Coordination Note Sent",
      description: "Request has been updated with coordination guidance",
    });
  };

  return (
    <aside className="w-[19rem] bg-purple-50 flex flex-col items-center p-6 border-r">
      <Logo size="sm" showText={false} className="mb-4" />
      
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold text-purple-900">Case Coordinator</h1>
        <p className="text-xs text-purple-700">{currentCoordinatorName}</p>
      </div>

      {/* Create Request Button */}
      <div className="w-full mb-6">
        <Button 
          onClick={handleCreateRequest}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Request
        </Button>
      </div>

      {/* All Requests Stats */}
      <div className="w-full mb-6">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">All Requests</h3>
        <div className="grid grid-cols-2 gap-2">
          {allStats.map((stat) => (
            <div
              key={stat.key}
              className={`${stat.color} text-white p-2 rounded text-center cursor-pointer transition-all duration-200 ${
                activeStatusFilter === stat.label ? 'ring-2 ring-white ring-offset-1' : 'hover:opacity-80'
              }`}
              onClick={() => onStatusFilterClick(activeStatusFilter === stat.label ? null : stat.label)}
            >
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Coordinator Specific Stats */}
      <div className="w-full mb-6">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">My Assignments</h3>
        <div className="grid grid-cols-2 gap-2">
          {coordinatorStats.map((stat) => (
            <div
              key={stat.key}
              className={`${stat.color} text-white p-2 rounded text-center cursor-pointer transition-all duration-200 ${
                activeStatusFilter === stat.label ? 'ring-2 ring-white ring-offset-1' : 'hover:opacity-80'
              }`}
              onClick={() => onStatusFilterClick(activeStatusFilter === stat.label ? null : stat.label)}
            >
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Action Buttons */}
      <div className="w-full space-y-2">
        {/* Need Justification Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="bg-pink-600 text-white p-3 rounded-lg text-center cursor-pointer transition-all duration-200 hover:opacity-80 w-full">
              <div className="text-lg font-bold">{getNeedJustificationRequests().length}</div>
              <div className="text-xs">Need Justification</div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-pink-800">Case Coordinator - Requests Needing Justification</DialogTitle>
              <DialogDescription>
                Coordinate and guide justification requests between hospital and clinical teams
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {getNeedJustificationRequests().length === 0 ? (
                <p className="text-center text-gray-500 py-8">No requests currently need justification coordination</p>
              ) : (
                getNeedJustificationRequests().map((req) => (
                  <div key={req.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start bg-pink-50 p-3 rounded">
                      <div>
                        <h3 className="font-semibold text-pink-900">{req.patientName}</h3>
                        <p className="text-sm text-pink-700">MRN: {req.mrn} | Hospital: {req.hospital}</p>
                      </div>
                      <span className="px-2 py-1 bg-pink-200 text-pink-800 rounded text-xs">
                        Coordination Required
                      </span>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <Label className="font-semibold text-yellow-800">Hospital Requirements</Label>
                      <div className="mt-2 bg-white p-2 rounded text-sm">
                        <p>"Insurance pre-authorization requires enhanced documentation. Need comprehensive clinical justification and treatment timeline."</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded">
                      <Label className="font-semibold text-green-800">Coordination Notes</Label>
                      <Textarea
                        placeholder="Provide guidance to clinical team on required documentation, coordinate between hospital and nurses/doctors..."
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
                          Send Coordination
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
            <div className="bg-red-600 text-white p-3 rounded-lg text-center cursor-pointer transition-all duration-200 hover:opacity-80 w-full">
              <div className="text-lg font-bold">{getDelayedRequests().length}</div>
              <div className="text-xs">Delayed Cases</div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-red-800">Case Coordinator - Delayed Cases</DialogTitle>
              <DialogDescription>
                Monitor and coordinate resolution of delayed cases
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {getDelayedRequests().length === 0 ? (
                <p className="text-center text-gray-500 py-8">No delayed cases requiring coordination</p>
              ) : (
                getDelayedRequests().map((req) => (
                  <div key={req.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start bg-red-50 p-3 rounded">
                      <div>
                        <h3 className="font-semibold text-red-900">{req.patientName}</h3>
                        <p className="text-sm text-red-700">MRN: {req.mrn} | Hospital: {req.hospital}</p>
                      </div>
                      <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs">
                        REQUIRES COORDINATION
                      </span>
                    </div>

                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                      <Label className="font-semibold text-orange-800">Coordination Issues</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="bg-white p-2 rounded">
                          <p>• Hospital awaiting insurance pre-authorization</p>
                          <p>• Missing documentation from referring physician</p>
                          <p>• Scheduling conflicts between departments</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded">
                      <Label className="font-semibold text-blue-800">Coordination Actions</Label>
                      <p className="text-sm mt-1">Follow up with all stakeholders and expedite resolution</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Timeline
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Coordinate Resolution
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
          className="w-full flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-100"
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
