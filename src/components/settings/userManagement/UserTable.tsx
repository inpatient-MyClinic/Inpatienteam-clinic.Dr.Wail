
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User } from "./types";
import UserTableActions from "./UserTableActions";
import PermissionsEditor from "./PermissionsEditor";
import PermissionsDisplay from "./PermissionsDisplay";

interface UserTableProps {
  users: User[];
  editingUser: string | null;
  editPermissions: Record<string, "none" | "view" | "edit">;
  onEditUser: (userId: string) => void;
  onSaveUser: (userId: string) => void;
  onCancelEdit: () => void;
  onDeleteUser: (userId: string) => void;
  onUpdateFieldPermission: (fieldId: string, permission: "none" | "view" | "edit") => void;
}

const UserTable = ({
  users,
  editingUser,
  editPermissions,
  onEditUser,
  onSaveUser,
  onCancelEdit,
  onDeleteUser,
  onUpdateFieldPermission
}: UserTableProps) => {
  return (
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
                  permissions={editPermissions}
                  onUpdatePermission={onUpdateFieldPermission}
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
                onEdit={onEditUser}
                onSave={onSaveUser}
                onCancel={onCancelEdit}
                onDelete={onDeleteUser}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
