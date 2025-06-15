
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

const sidebarMenu = [
  {
    label: "Dashboard",
    key: "dashboard",
    onClick: (navigate: (to: string) => void) => navigate("/admin"),
  },
  {
    label: "Request",
    key: "request",
    onClick: (navigate: (to: string) => void) => navigate("/create-request"),
  },
  {
    label: "Users",
    key: "users",
    submenu: [
      { label: "Nurse", key: "nurse" },
      { label: "Doctors", key: "doctors" },
      { label: "Case Coordinators", key: "case-coordinators" },
      { label: "Hospital", key: "hospital" },
      { label: "Finance", key: "finance" },
      { label: "Customer Service", key: "customer-service" },
    ],
  },
  {
    label: "Settings",
    key: "settings",
    icon: <Settings className="w-4 h-4 mr-2 inline-block" />,
    onClick: (navigate: (to: string) => void) => navigate("/settings-directory"),
  },
];

const stats = [
  { name: "New Requests", count: 8, color: "bg-blue-600" },
  { name: "Pending", count: 3, color: "bg-yellow-500" },
  { name: "Cancelled", count: 1, color: "bg-red-500" },
];

const filterOptions = [
  { name: "Day", value: "day" },
  { name: "Week", value: "week" },
  { name: "Month", value: "month" },
  { name: "Year to Date", value: "ytd" },
];

export default function AdminDashboard() {
  const [filter, setFilter] = React.useState("day");
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarMenu.map((item) =>
                    item.submenu ? (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton>
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {item.submenu.map((sub) => (
                            <SidebarMenuSubItem key={sub.key}>
                              <SidebarMenuSubButton asChild size="sm">
                                {/* Could link to filtered views or user management pages */}
                                <span>{sub.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </SidebarMenuItem>
                    ) : (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton asChild>
                          <button
                            type="button"
                            onClick={() => item.onClick && item.onClick(navigate)}
                            className="flex items-center w-full"
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-slate-100 min-h-screen">
          {/* Topbar and stats */}
          <div className="flex flex-col md:flex-row items-center justify-between p-6 pb-2 gap-4 border-b">
            <div>
              <button
                className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold hover:bg-blue-800 transition"
                onClick={() => navigate("/create-request")}
              >
                + Create New Request
              </button>
            </div>
            <div className="flex-1 flex flex-wrap gap-4 justify-center md:justify-end">
              {stats.map((stat) => (
                <div
                  key={stat.name}
                  className={`flex flex-col items-center rounded-lg px-4 py-2 ${stat.color} text-white min-w-[100px]`}
                >
                  <span className="text-xs">{stat.name}</span>
                  <span className="text-xl font-bold">{stat.count}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  className={`px-3 py-1 rounded border text-sm font-medium ${
                    filter === option.value
                      ? "bg-blue-700 text-white"
                      : "bg-white text-blue-800 border-blue-400"
                  }`}
                  onClick={() => setFilter(option.value)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
          {/* Placeholder for detailed list/chart */}
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-lg opacity-60 px-5">
            {/* Could show charts, latest requests, etc */}
            <div>
              Welcome to the admin panel. Select menu items or use "Create New Request" to get started.
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

