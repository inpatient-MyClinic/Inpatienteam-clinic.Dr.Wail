
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import UserTable from "./UserTable";
import { User } from "./types";

interface UserTableSectionProps {
  filteredUsers: User[];
  users: User[];
  hasActiveFilters: boolean;
  editingUser: string | null;
  editingPermissions: Record<string, "none" | "view" | "edit">;
  onEdit: (userId: string) => void;
  onSave: (userId: string) => void;
  onCancel: () => void;
  onDelete: (userId: string) => void;
  onUpdatePermission: (fieldId: string, permission: "none" | "view" | "edit") => void;
  categoryFilter: string;
  specialtyFilter: string;
  statusFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onSpecialtyFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onUsersUpdate: () => void;
}

const UserTableSection = ({
  filteredUsers,
  users,
  hasActiveFilters,
  editingUser,
  editingPermissions,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onUpdatePermission,
  categoryFilter,
  specialtyFilter,
  statusFilter,
  onCategoryFilterChange,
  onSpecialtyFilterChange,
  onStatusFilterChange,
  onUsersUpdate
}: UserTableSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({filteredUsers.length} of {users.length})</CardTitle>
        <CardDescription>
          {hasActiveFilters ? 
            "Filtered user list - click 'Clear All Filters' to see all users" : 
            "Complete user list with management options"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredUsers.length > 0 ? (
          <UserTable
            users={filteredUsers}
            editingUser={editingUser}
            editingPermissions={editingPermissions}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={onDelete}
            onUpdatePermission={onUpdatePermission}
            categoryFilter={categoryFilter}
            specialtyFilter={specialtyFilter}
            statusFilter={statusFilter}
            onCategoryFilterChange={onCategoryFilterChange}
            onSpecialtyFilterChange={onSpecialtyFilterChange}
            onStatusFilterChange={onStatusFilterChange}
            onUsersUpdate={onUsersUpdate}
          />
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {hasActiveFilters ? 
                "No users match the current filters." : 
                "No users found. Add some users to get started."
              }
            </p>
            <p className="text-sm text-blue-600 mb-2">
              Debug Info: Total users in storage: {users.length}, Filtered: {filteredUsers.length}
            </p>
            {users.length === 0 && (
              <p className="text-sm text-green-600">
                Try adding your first user using the form above!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTableSection;
