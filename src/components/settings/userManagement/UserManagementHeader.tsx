
import React from "react";

interface UserManagementHeaderProps {
  totalUsers: number;
}

const UserManagementHeader = ({ totalUsers }: UserManagementHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Enhanced User Management</h2>
        <p className="text-gray-600">
          Manage users with field permissions ({totalUsers} total users)
        </p>
      </div>
    </div>
  );
};

export default UserManagementHeader;
