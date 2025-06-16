
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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

// Sample analytics data
const conversionData = { done: 45, total: 100, rate: 45 };
const utilizationData = [
  { name: "King Abdulaziz Hospital", requests: 25 },
  { name: "Prince Sultan Hospital", requests: 20 },
  { name: "King Faisal Hospital", requests: 15 },
];

const hospitalPieData = [
  { name: "King Abdulaziz", value: 40, fill: "#0088FE" },
  { name: "Prince Sultan", value: 35, fill: "#00C49F" },
  { name: "King Faisal", value: 25, fill: "#FFBB28" },
];

const lossTreeData = {
  pending: { scheduled: 5, planned: 3, nvd: 2, underProcess: 8 },
  cancelled: { doctor: 3, insurance: 2, hospital: 1, patient: 4 }
};

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

export default function AdminDashboard() {
  const [openSubmenus, setOpenSubmenus] = useState({
    users: false,
    settings: false,
  });
  const [analyticsFilter, setAnalyticsFilter] = useState("day");

  const toggleSubmenu = (submenu: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [submenu]: !prev[submenu],
    }));
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-gray-50 flex flex-col items-start p-6 border-r">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

        <Accordion type="multiple" className="w-full">
          <AccordionItem value="users">
            <AccordionTrigger onClick={() => toggleSubmenu("users")}>
              Users
            </AccordionTrigger>
            <AccordionContent>
              {openSubmenus.users && (
                <div className="ml-6 space-y-2 mt-2">
                  <a
                    href="/doctor-dashboard"
                    className="block text-sm text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    • Doctor Dashboard
                  </a>
                  <a
                    href="/nurse-dashboard"
                    className="block text-sm text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    • Nurse Dashboard
                  </a>
                  <a
                    href="/hospital-dashboard"
                    className="block text-sm text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    • Hospital Dashboard
                  </a>
                  <a
                    href="/case-coordinator-dashboard"
                    className="block text-sm text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    • Case Coordinator Dashboard
                  </a>
                  <a
                    href="/finance-dashboard"
                    className="block text-sm text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    • Finance Dashboard
                  </a>
                  <a
                    href="/customer-care-dashboard"
                    className="block text-sm text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    • Customer Care Dashboard
                  </a>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="settings">
            <AccordionTrigger onClick={() => toggleSubmenu("settings")}>
              Settings
            </AccordionTrigger>
            <AccordionContent>
              {openSubmenus.settings && (
                <div className="ml-6 space-y-2 mt-2">
                  <a
                    href="#"
                    className="block text-sm text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    • General
                  </a>
                  <a
                    href="#"
                    className="block text-sm text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    • Security
                  </a>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-col gap-4 w-full mt-8">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 ${stat.color} text-white`}
            >
              <span className="text-xs">{stat.label}:</span>
              <span className="font-bold text-lg">{stat.count}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className="flex h-full">
          {/* Left Side - Welcome Message */}
          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome to the Admin Dashboard!</h2>
            <p className="text-gray-600">Here, you can manage users and system settings.</p>
          </div>

          {/* Right Side - Analytics */}
          <div className="flex-1 p-6 border-l bg-gray-50">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Analytics Dashboard</h3>
              <Select value={analyticsFilter} onValueChange={setAnalyticsFilter}>
                <SelectTrigger className="w-32">
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
              {/* Conversion Rate */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Conversion Rate</h4>
                <div className="text-2xl font-bold text-green-600">
                  {conversionData.rate}%
                </div>
                <p className="text-sm text-gray-600">
                  {conversionData.done} done out of {conversionData.total} requests
                </p>
              </div>

              {/* Hospital Pie Chart */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Requests by Hospital</h4>
                <ChartContainer
                  config={{}}
                  className="h-48"
                >
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
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Volume Growth</h4>
                <ChartContainer
                  config={{}}
                  className="h-48"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeGrowthData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Bar dataKey="requests" fill="#8884d8" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Finance KPIs */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Finance KPIs</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <span className="text-sm text-gray-600">YTD Growth: </span>
                    <span className="font-bold text-green-600">+{financeData.ytdGrowth}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">YTD Achievement: </span>
                    <span className="font-bold text-blue-600">{financeData.ytdAchievement}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">YTD Revenue: </span>
                    <span className="font-bold text-purple-600">
                      ${financeData.ytdRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loss Tree Summary */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Loss Analysis</h4>
                <div className="text-sm space-y-1">
                  <div>Pending Issues: {Object.values(lossTreeData.pending).reduce((a, b) => a + b, 0)}</div>
                  <div>Cancellations: {Object.values(lossTreeData.cancelled).reduce((a, b) => a + b, 0)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
