
import React from "react";
import { Users2 } from "lucide-react";

interface UserManagementHeaderProps {
  totalUsers: number;
}

const UserManagementHeader = ({ totalUsers }: UserManagementHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Users2 className="w-8 h-8 text-blue-600" />
          Enhanced User Management
        </h2>
        <p className="text-gray-600 mt-2">
          Comprehensive user management with field permissions and hospital privileges
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Total Users: {totalUsers} | All data persisted in localStorage
        </p>
      </div>
    </div>
  );
};

export default UserManagementHeader;
