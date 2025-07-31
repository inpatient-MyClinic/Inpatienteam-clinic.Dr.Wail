import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, userCategories, specialties } from "./types";
import UserTableActions from "./UserTableActions";
import PermissionsEditor from "./PermissionsEditor";
import PermissionsDisplay from "./PermissionsDisplay";

interface UserTableProps {
  users: User[];
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
}

const UserTable = ({
  users,
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
  onStatusFilterChange
}: UserTableProps) => {
  return (
    <div className="space-y-4">
      {/* Column Filters */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filter by Category</label>
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {userCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filter by Specialty</label>
          <Select value={specialtyFilter} onValueChange={onSpecialtyFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="none">No Specialty</SelectItem>
              {specialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filter by Status</label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Field Permissions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{user.category}</Badge>
              </TableCell>
              <TableCell>
                {user.specialty ? (
                  <Badge variant="secondary">{user.specialty}</Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                {editingUser === user.id ? (
                  <PermissionsEditor
                    permissions={editingPermissions}
                    onUpdatePermission={onUpdatePermission}
                  />
                ) : (
                  <PermissionsDisplay
                    permissions={user.fieldPermissions}
                    userEmail={user.email}
                  />
                )}
              </TableCell>
              <TableCell>
                <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>{user.createdAt}</TableCell>
              <TableCell>
                <UserTableActions
                  userId={user.id}
                  isEditing={editingUser === user.id}
                  onEdit={onEdit}
                  onSave={onSave}
                  onCancel={onCancel}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;