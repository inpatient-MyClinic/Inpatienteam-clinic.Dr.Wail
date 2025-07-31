
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, userCategories, specialties } from "./types";
import UserTableActions from "./UserTableActions";
import PermissionsEditor from "./PermissionsEditor";
import PermissionsDisplay from "./PermissionsDisplay";
import { KeyRound, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  onUsersUpdate: () => void;
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
  onStatusFilterChange,
  onUsersUpdate
}: UserTableProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isRenewingPassword, setIsRenewingPassword] = useState<string | null>(null);
  const [isBulkRenewing, setIsBulkRenewing] = useState(false);

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleRenewPassword = async (userId: string, userEmail: string) => {
    setIsRenewingPassword(userId);
    try {
      // Update the user's profile to force password change
      const { error } = await supabase
        .from('profiles')
        .update({ 
          must_change_password: true,
          password_change_required_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error forcing password renewal:', error);
        toast.error('Failed to force password renewal');
      } else {
        toast.success(`Password renewal forced for ${userEmail}`);
        onUsersUpdate();
      }
    } catch (error) {
      console.error('Error forcing password renewal:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsRenewingPassword(null);
    }
  };

  const handleBulkRenewPasswords = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to renew passwords');
      return;
    }

    setIsBulkRenewing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          must_change_password: true,
          password_change_required_at: new Date().toISOString()
        })
        .in('id', selectedUsers);

      if (error) {
        console.error('Error bulk renewing passwords:', error);
        toast.error('Failed to renew passwords for selected users');
      } else {
        toast.success(`Password renewal forced for ${selectedUsers.length} users`);
        setSelectedUsers([]);
        onUsersUpdate();
      }
    } catch (error) {
      console.error('Error bulk renewing passwords:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsBulkRenewing(false);
    }
  };

  const formatPasswordDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const isPasswordExpired = (user: User) => {
    if (user.mustChangePassword) return true;
    if (!user.passwordChangeRequiredAt) return false;
    return new Date(user.passwordChangeRequiredAt) <= new Date();
  };
  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium">
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
          </span>
          <Button
            onClick={handleBulkRenewPasswords}
            disabled={isBulkRenewing}
            size="sm"
            variant="outline"
          >
            {isBulkRenewing ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <KeyRound className="w-4 h-4 mr-2" />
            )}
            Renew Selected Passwords
          </Button>
        </div>
      )}

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
            <TableHead className="w-12">
              <Checkbox
                checked={selectedUsers.length === users.length && users.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all users"
              />
            </TableHead>
            <TableHead>Password Actions</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Password Created</TableHead>
            <TableHead>Password Status</TableHead>
            <TableHead>Field Permissions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                  aria-label={`Select ${user.email}`}
                />
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRenewPassword(user.id, user.email)}
                  disabled={isRenewingPassword === user.id}
                  className="h-8"
                >
                  {isRenewingPassword === user.id ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <KeyRound className="w-3 h-3" />
                  )}
                </Button>
              </TableCell>
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
                <span className="text-sm">
                  {formatPasswordDate(user.passwordCreatedAt)}
                </span>
              </TableCell>
              <TableCell>
                {isPasswordExpired(user) ? (
                  <Badge variant="destructive" className="text-xs">
                    Renewal Required
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-xs">
                    Valid
                  </Badge>
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
