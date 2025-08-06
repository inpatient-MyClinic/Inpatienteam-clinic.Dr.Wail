
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import NurseStats from "./NurseStats";
import UserProfileHeader from "@/components/UserProfileHeader";
import { NurseRequest } from "@/hooks/useNurseRequests";

interface NurseSidebarProps {
  currentNurseName: string;
  filteredRequests: NurseRequest[];
  onCreateNewRequest: () => void;
  activeStatusFilter: string | null;
  onStatusFilterClick: (status: string | null) => void;
}

export default function NurseSidebar({ 
  currentNurseName, 
  filteredRequests, 
  onCreateNewRequest,
  activeStatusFilter,
  onStatusFilterClick
}: NurseSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
      <UserProfileHeader className="mb-6" />
      
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold text-blue-900">Nurse Dashboard</h1>
        <p className="text-xs text-blue-700">{currentNurseName}</p>
      </div>

      <Button className="w-full mb-6" variant="default" onClick={onCreateNewRequest}>
        <Plus className="w-4 h-4 mr-2" />
        Create New Request
      </Button>

      <NurseStats 
        filteredRequests={filteredRequests} 
        activeStatusFilter={activeStatusFilter}
        onStatusFilterClick={onStatusFilterClick}
      />

      <div className="mt-auto space-y-2 w-full">
        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </div>
    </aside>
  );
}
