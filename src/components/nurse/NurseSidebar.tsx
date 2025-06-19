
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NurseStats from "./NurseStats";
import NurseAnalytics from "./NurseAnalytics";
import { NurseRequest } from "@/hooks/useNurseRequests";

interface NurseSidebarProps {
  currentNurseName: string;
  filteredRequests: NurseRequest[];
  onCreateNewRequest: () => void;
}

export default function NurseSidebar({ 
  currentNurseName, 
  filteredRequests, 
  onCreateNewRequest 
}: NurseSidebarProps) {
  const navigate = useNavigate();

  const hospitalPrivileges = [
    { name: "King Khaled Hospital", cases: 12 },
    { name: "King Abdulaziz Hospital", cases: 8 },
    { name: "King Faisal Hospital", cases: 15 },
    { name: "Prince Sultan Hospital", cases: 6 },
  ];

  return (
    <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
      <div className="text-center mb-4">
        <img 
          src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
          alt="My Clinic Logo" 
          className="h-8 w-auto mx-auto mb-2"
        />
        <h1 className="text-lg font-bold text-blue-900">Nurse Dashboard</h1>
        <p className="text-xs text-blue-700">{currentNurseName}</p>
      </div>

      <Button className="w-full mb-6" variant="default" onClick={onCreateNewRequest}>
        <Plus className="w-4 h-4 mr-2" />
        Create New Request
      </Button>

      <NurseStats filteredRequests={filteredRequests} />

      {/* Hospital Privileges */}
      <div className="w-full mt-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Hospital Privileges</h3>
        <div className="space-y-2">
          {hospitalPrivileges.map((hospital) => (
            <div
              key={hospital.name}
              className="flex justify-between items-center p-2 bg-white rounded-lg border text-xs"
            >
              <span className="text-gray-700 truncate">{hospital.name}</span>
              <span className="font-bold text-blue-600">{hospital.cases}</span>
            </div>
          ))}
        </div>
      </div>

      <NurseAnalytics filteredRequests={filteredRequests} />

      <Button 
        variant="outline"
        onClick={() => navigate("/role-selection")}
        className="w-full flex items-center gap-2 mt-auto border-blue-300 text-blue-700 hover:bg-blue-100"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Roles
      </Button>
    </aside>
  );
}
