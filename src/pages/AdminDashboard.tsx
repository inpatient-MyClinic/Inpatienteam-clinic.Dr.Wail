import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const stats = [
  { label: "Total Users", key: "total", color: "bg-blue-600", count: 20 },
  { label: "Active Users", key: "active", color: "bg-green-600", count: 15 },
  { label: "Inactive Users", key: "inactive", color: "bg-red-500", count: 5 },
];

const conversionData = { done: 45, total: 100, rate: 45 };
const hospitalPieData = [
  { name: "King Abdulaziz", value: 40, fill: "#0088FE" },
  { name: "Prince Sultan", value: 35, fill: "#00C49F" },
  { name: "King Faisal", value: 25, fill: "#FFBB28" },
];

const volumeGrowthData = [
  { month: "Jan", requests: 20 },
  { month: "Feb", requests: 35 },
  { month: "Mar", requests: 28 },
  { month: "Apr", requests: 45 },
  { month: "May", requests: 52 },
  { month: "Jun", requests: 48 },
];

const financeData = {
  ytdGrowth: 15.5,
  ytdAchievement: 82.3,
  ytdRevenue: 2500000
};

// Hospital lead time data
const hospitalLeadTimeData = [
  {
    hospital: "King Abdulaziz Hospital",
    patientContactLeadTime: 2.5, // hours from request received to patient contacted
    approvalLeadTime: 18.5, // hours from patient contacted to approval
    totalRequests: 45,
    completedRequests: 38
  },
  {
    hospital: "Prince Sultan Hospital", 
    patientContactLeadTime: 3.2,
    approvalLeadTime: 22.8,
    totalRequests: 35,
    completedRequests: 28
  },
  {
    hospital: "King Faisal Hospital",
    patientContactLeadTime: 4.1,
    approvalLeadTime: 28.3,
    totalRequests: 25,
    completedRequests: 20
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analyticsFilter, setAnalyticsFilter] = useState("day");

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-80 bg-blue-50 flex flex-col p-6 border-r border-blue-200">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
            alt="My Clinic Logo" 
            className="h-10 w-auto mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
          <p className="text-sm text-blue-700">System Management</p>
        </div>

        <Accordion type="multiple" className="w-full mb-8">
          <AccordionItem value="users">
            <AccordionTrigger className="text-blue-900 font-semibold">
              User Management
            </AccordionTrigger>
            <AccordionContent>
              <div className="ml-4 space-y-3 mt-3">
                <button
                  onClick={() => navigate("/doctor-dashboard")}
                  className="block text-sm text-blue-700 hover:text-blue-900 transition-colors py-1 w-full text-left"
                >
                  • Doctor Dashboard
                </button>
                <button
                  onClick={() => navigate("/nurse-dashboard")}
                  className="block text-sm text-blue-700 hover:text-blue-900 transition-colors py-1 w-full text-left"
                >
                  • Nurse Dashboard
                </button>
                <button
                  onClick={() => navigate("/hospital-dashboard")}
                  className="block text-sm text-blue-700 hover:text-blue-900 transition-colors py-1 w-full text-left"
                >
                  • Hospital Dashboard
                </button>
                <button
                  onClick={() => navigate("/case-coordinator-dashboard")}
                  className="block text-sm text-blue-700 hover:text-blue-900 transition-colors py-1 w-full text-left"
                >
                  • Case Coordinator Dashboard
                </button>
                <button
                  onClick={() => navigate("/finance-dashboard")}
                  className="block text-sm text-blue-700 hover:text-blue-900 transition-colors py-1 w-full text-left"
                >
                  • Finance Dashboard
                </button>
                <button
                  onClick={() => navigate("/customer-care-dashboard")}
                  className="block text-sm text-blue-700 hover:text-blue-900 transition-colors py-1 w-full text-left"
                >
                  • Customer Care Dashboard
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="settings">
            <AccordionTrigger className="text-blue-900 font-semibold">
              System Settings
            </AccordionTrigger>
            <AccordionContent>
              <div className="ml-4 space-y-3 mt-3">
                <button
                  onClick={() => navigate("/settings-directory")}
                  className="block text-sm text-blue-700 hover:text-blue-900 transition-colors py-1 w-full text-left"
                >
                  • Settings & Directory
                </button>
                <button
                  onClick={() => navigate("#")}
                  className="block text-sm text-blue-700 hover:text-blue-900 transition-colors py-1 w-full text-left"
                >
                  • Security Settings
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-col gap-4 w-full mb-8">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${stat.color} text-white shadow-sm`}
            >
              <span className="text-sm font-medium">{stat.label}</span>
              <span className="font-bold text-xl">{stat.count}</span>
            </div>
          ))}
        </div>

        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 mt-auto border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className="flex h-full">
          {/* Left Side - Welcome Message */}
          <div className="flex-1 p-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-6 text-blue-900">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Manage your healthcare system with comprehensive tools for user management, 
                system configuration, and real-time analytics. Monitor all activities and 
                ensure optimal performance across all departments.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Actions</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• View all user dashboards</li>
                    <li>• Manage system settings</li>
                    <li>• Monitor real-time analytics</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">System Status</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• All systems operational</li>
                    <li>• 15 active users online</li>
                    <li>• Real-time sync enabled</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Analytics */}
          <div className="flex-1 p-8 border-l bg-gray-50">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h3>
              <Select value={analyticsFilter} onValueChange={setAnalyticsFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {/* Hospital Lead Time Analysis */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-4 text-gray-900">Hospital Lead Time Performance</h4>
                <div className="space-y-4">
                  {hospitalLeadTimeData.map((hospital) => (
                    <div key={hospital.hospital} className="border rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-3">{hospital.hospital}</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-xs text-blue-600 mb-1">Patient Contact Lead Time</p>
                          <p className="text-lg font-bold text-blue-800">{hospital.patientContactLeadTime}h</p>
                          <p className="text-xs text-blue-600">From request to contact</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-xs text-green-600 mb-1">Approval Lead Time</p>
                          <p className="text-lg font-bold text-green-800">{hospital.approvalLeadTime}h</p>
                          <p className="text-xs text-green-600">From contact to approval</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completion Rate:</span>
                          <span className="font-medium">
                            {Math.round((hospital.completedRequests / hospital.totalRequests) * 100)}% 
                            ({hospital.completedRequests}/{hospital.totalRequests})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-3 text-gray-900">Conversion Rate</h4>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {conversionData.rate}%
                </div>
                <p className="text-sm text-gray-600">
                  {conversionData.done} completed out of {conversionData.total} total requests
                </p>
              </div>

              {/* Hospital Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-4 text-gray-900">Requests by Hospital</h4>
                <ChartContainer config={{}} className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hospitalPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {hospitalPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Volume Growth */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-4 text-gray-900">Monthly Volume Growth</h4>
                <ChartContainer config={{}} className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeGrowthData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Bar dataKey="requests" fill="#3B82F6" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Finance KPIs */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-4 text-gray-900">Financial Overview</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">YTD Growth</span>
                    <span className="font-bold text-green-600 text-lg">+{financeData.ytdGrowth}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">YTD Achievement</span>
                    <span className="font-bold text-blue-600 text-lg">{financeData.ytdAchievement}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">YTD Revenue</span>
                    <span className="font-bold text-purple-600 text-lg">
                      ${financeData.ytdRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
