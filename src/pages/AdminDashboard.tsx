
import React from "react";
import { Plus, Calendar, Check, ArrowUp, ArrowDown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const userTypes = [
  { name: "Nurse", label: "ممرضة" },
  { name: "Doctor", label: "طبيب" },
  { name: "Case Coordinator", label: "منسق الحالات" },
  { name: "Hospital", label: "المستشفى" },
  { name: "Finance", label: "المالية" },
  { name: "Customer Care", label: "خدمة العملاء" },
];

const stats = [
  { name: "الطلبات الجديدة", count: 4, color: "bg-blue-600" },
  { name: "المعلّقة", count: 2, color: "bg-yellow-600" },
  { name: "المكتملة", count: 8, color: "bg-green-600" },
];

// filters: Today, This Week, This Month
const filterOptions = [
  { name: "اليوم", value: "day" },
  { name: "هذا الأسبوع", value: "week" },
  { name: "هذا الشهر", value: "month" },
];

export default function AdminDashboard() {
  const [filter, setFilter] = React.useState("month");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>أنواع المستخدمين</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userTypes.map((user) => (
                    <SidebarMenuItem key={user.name}>
                      <SidebarMenuButton asChild>
                        <span className="flex gap-2 items-center">
                          {/* simple circle avatar */}
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                          <span>{user.label}</span>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-slate-100 min-h-screen">
          {/* Topbar */}
          <div className="flex flex-col md:flex-row items-center justify-between p-6 pb-2 gap-4 border-b">
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold hover:bg-blue-800 transition">
                <Plus className="w-5 h-5" />
                إنشاء طلب جديد
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
          {/* Content placeholder */}
          <div className="flex-1 flex items-center justify-center text-gray-600 text-lg opacity-60">
            محتوى لوحة التحكم للمدير (Dashboard) سيتوفر لاحقا
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
