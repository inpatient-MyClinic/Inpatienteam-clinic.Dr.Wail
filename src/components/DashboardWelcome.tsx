
import React, { useState } from "react";

const roles = [
  { name: "Nurse", emoji: "🧑‍⚕️" },
  { name: "Doctor", emoji: "🩺" },
  { name: "Coordinator", emoji: "🧑‍💼" },
  { name: "Hospital", emoji: "🏥" },
  { name: "Finance", emoji: "💵" },
  { name: "Customer Care", emoji: "📞" },
  { name: "Admin", emoji: "👩‍💻" },
];

const roleDescriptions: Record<string, string> = {
  Nurse: "• Create and edit your own surgical requests.",
  Doctor: "• Submit and monitor your surgical requests. Filter by status and calendar.",
  Coordinator:
    "• Track and manage all requests. Assign, submit, and set status for cases.",
  Hospital:
    "• See assigned cases. Change case status and upload feedback. Download monthly reports.",
  Finance:
    "• View, filter, and mark cases as Paid. Export data.",
  "Customer Care": "• View completed cases. System sends automatic patient surveys.",
  Admin:
    "• Analytics, permission management, directory, SLA setup. View & export all data.",
};

const DashboardWelcome = () => {
  const [selectedRole, setSelectedRole] = useState("Nurse");

  return (
    <section className="flex flex-col items-center py-8 px-2 min-h-[70vh]">
      <div className="bg-white/90 backdrop-blur rounded-2xl border border-blue-100 shadow-md w-full max-w-xl">
        <div className="flex flex-col items-center py-6 px-4 gap-3">
          <h2 className="text-xl md:text-2xl font-semibold text-blue-900 mb-6">Welcome to My Clinic – In-patient Portal</h2>
          <div className="mb-2 text-muted-foreground text-center">
            Select a role below to preview feature access:
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {roles.map((role) => (
              <button
                key={role.name}
                onClick={() => setSelectedRole(role.name)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition
                  ${
                    selectedRole === role.name
                      ? "bg-blue-600 text-white border-blue-700 shadow"
                      : "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100"
                  }`}
                aria-pressed={selectedRole === role.name}
              >
                <span>{role.emoji}</span>
                <span>{role.name}</span>
              </button>
            ))}
          </div>
          <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-900 text-left min-h-[64px]">
            <strong>{selectedRole}</strong>
            <div className="mt-2 text-base">
              {roleDescriptions[selectedRole]}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardWelcome;
