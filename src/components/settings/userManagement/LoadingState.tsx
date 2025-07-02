
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const LoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced User Management</h2>
          <p className="text-gray-600">Loading user management system...</p>
        </div>
      </div>
      <Card>
        <CardContent className="text-center py-8">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingState;
