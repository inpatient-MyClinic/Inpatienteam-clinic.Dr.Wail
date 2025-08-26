
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import RPCAnalyticsDashboard from "@/components/admin/RPCAnalyticsDashboard";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <RPCAnalyticsDashboard />
      </div>
    </div>
  );
}
