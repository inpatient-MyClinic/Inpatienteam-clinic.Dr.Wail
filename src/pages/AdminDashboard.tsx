import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const stats = [
  { label: "Total Users", key: "total", color: "bg-blue-600", count: 20 },
  { label: "Active Users", key: "active", color: "bg-green-600", count: 15 },
  { label: "Inactive Users", key: "inactive", color: "bg-red-500", count: 5 },
];

export default function AdminDashboard() {
  const [openSubmenus, setOpenSubmenus] = useState({
    users: false,
    settings: false,
  });

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

      {/* Main */}
      <main className="flex-1 bg-white p-6">
        <h2>Welcome to the Admin Dashboard!</h2>
        <p>Here, you can manage users and system settings.</p>
      </main>
    </div>
  );
}
