
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  averageTime: string;
  hospital: string;
  requestId: string;
  status: string;
}

const LeadTeamMonitoring = () => {
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>("all");
  const [selectedHospital, setSelectedHospital] = useState<string>("all");

  // Mock data for team monitoring
  const teamData: TeamMember[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Case Coordinator",
      currentStep: "Insurance Verification",
      completedSteps: 3,
      totalSteps: 6,
      averageTime: "2.5 days",
      hospital: "DSAH",
      requestId: "REQ-001",
      status: "In Progress"
    },
    {
      id: "2",
      name: "Ahmed Hassan",
      role: "Case Coordinator", 
      currentStep: "Hospital Approval",
      completedSteps: 4,
      totalSteps: 6,
      averageTime: "1.8 days",
      hospital: "DSFH (main)",
      requestId: "REQ-002",
      status: "In Progress"
    },
    {
      id: "3",
      name: "Fatima Ali",
      role: "Case Coordinator",
      currentStep: "Final Authorization",
      completedSteps: 5,
      totalSteps: 6,
      averageTime: "3.2 days",
      hospital: "Al Salamah Hospital",
      requestId: "REQ-003",
      status: "Near Completion"
    },
    {
      id: "4",
      name: "Omar Al-Said",
      role: "Case Coordinator",
      currentStep: "Document Review",
      completedSteps: 2,
      totalSteps: 6,
      averageTime: "4.1 days",
      hospital: "King's College Hospital",
      requestId: "REQ-004",
      status: "Delayed"
    }
  ];

  const coordinators = [...new Set(teamData.map(item => item.name))];
  const hospitals = [...new Set(teamData.map(item => item.hospital))];

  const filteredData = teamData.filter(item => {
    const matchesCoordinator = selectedCoordinator === "all" || item.name === selectedCoordinator;
    const matchesHospital = selectedHospital === "all" || item.hospital === selectedHospital;
    return matchesCoordinator && matchesHospital;
  });

  const getStepProgress = (completed: number, total: number) => {
    return (completed / total) * 100;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "Near Completion":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Delayed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "In Progress": "default",
      "Near Completion": "default",
      "Delayed": "destructive"
    } as const;
    
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Lead Team Monitoring
        </CardTitle>
        <CardDescription>
          Monitor case coordinator progress and performance across all hospitals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Case Coordinator</label>
            <Select value={selectedCoordinator} onValueChange={setSelectedCoordinator}>
              <SelectTrigger>
                <SelectValue placeholder="All Coordinators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coordinators</SelectItem>
                {coordinators.map(coordinator => (
                  <SelectItem key={coordinator} value={coordinator}>
                    {coordinator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Hospital</label>
            <Select value={selectedHospital} onValueChange={setSelectedHospital}>
              <SelectTrigger>
                <SelectValue placeholder="All Hospitals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hospitals</SelectItem>
                {hospitals.map(hospital => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coordinator</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>Current Step</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Avg. Time per Step</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.hospital}</TableCell>
                  <TableCell className="font-mono text-sm">{member.requestId}</TableCell>
                  <TableCell>{member.currentStep}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{member.completedSteps}/{member.totalSteps} steps</span>
                        <span>{Math.round(getStepProgress(member.completedSteps, member.totalSteps))}%</span>
                      </div>
                      <Progress 
                        value={getStepProgress(member.completedSteps, member.totalSteps)} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{member.averageTime}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(member.status)}
                      <Badge variant={getStatusBadge(member.status)}>
                        {member.status}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Active Coordinators</p>
                  <p className="text-2xl font-bold">{filteredData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">
                    {filteredData.filter(item => item.status === "In Progress").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Near Completion</p>
                  <p className="text-2xl font-bold">
                    {filteredData.filter(item => item.status === "Near Completion").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Delayed</p>
                  <p className="text-2xl font-bold">
                    {filteredData.filter(item => item.status === "Delayed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadTeamMonitoring;
