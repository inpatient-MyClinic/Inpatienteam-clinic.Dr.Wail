import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Filter, X } from "lucide-react";
import { User, userCategories, specialties, defaultFieldPermissions } from "./userManagement/types";
import UserForm from "./userManagement/UserForm";
import UserTable from "./userManagement/UserTable";
import UserExcelUpload from "./UserExcelUpload";

const EnhancedUserManagement = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      email: "dr.smith@hospital.com",
      category: "Doctor",
      specialty: "Cardiology",
      status: "Active",
      createdAt: "2024-01-15",
      fieldPermissions: defaultFieldPermissions["Doctor"]
    },
    {
      id: "2", 
      email: "nurse.johnson@hospital.com",
      category: "Nurse",
      status: "Active",
      createdAt: "2024-01-20",
      fieldPermissions: defaultFieldPermissions["Nurse"]
    },
    {
      id: "3",
      email: "coordinator@hospital.com", 
      category: "Case Coordinator",
      status: "Active",
      createdAt: "2024-01-25",
      fieldPermissions: defaultFieldPermissions["Case Coordinator"]
    }
  ]);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserCategory, setNewUserCategory] = useState("Doctor");
  const [newUserSpecialty, setNewUserSpecialty] = useState("none");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Record<string, "none" | "view" | "edit">>({});
  
  // Filter states
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSpecialty = specialtyFilter === "all" || user.specialty === specialtyFilter;
    const matchesSearch = searchFilter === "" || 
      user.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      user.category.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesSpecialty && matchesSearch;
  });

  const addUser = () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    if (users.some(user => user.email === newUserEmail)) {
      toast({
        title: "Error", 
        description: "User with this email already exists",
        variant: "destructive"
      });
      return;
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      email: newUserEmail,
      category: newUserCategory,
      specialty: newUserCategory === "Doctor" ? newUserSpecialty : undefined,
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions[newUserCategory as keyof typeof defaultFieldPermissions]
    };

    setUsers([...users, newUser]);
    setNewUserEmail("");
    setNewUserCategory("Doctor");
    setNewUserSpecialty("none");

    toast({
      title: "Success",
      description: "User added successfully"
    });
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "User deleted successfully"
    });
  };

  const startEditing = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(userId);
      setEditingPermissions(user.fieldPermissions);
    }
  };

  const savePermissions = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, fieldPermissions: editingPermissions }
        : user
    ));
    setEditingUser(null);
    setEditingPermissions({});
    
    toast({
      title: "Success",
      description: "Permissions updated successfully"
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditingPermissions({});
  };

  const updatePermission = (fieldId: string, permission: "none" | "view" | "edit") => {
    setEditingPermissions(prev => ({
      ...prev,
      [fieldId]: permission
    }));
  };

  const handleExcelUpload = (uploadedUsers: any[]) => {
    const newUsers: User[] = uploadedUsers.map((userData, index) => ({
      id: (users.length + index + 1).toString(),
      email: userData.Email || userData.email,
      category: userData.Category || "Doctor",
      specialty: userData.Specialty || userData.specialty,
      status: "Active" as const,
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions[userData.Category as keyof typeof defaultFieldPermissions] || defaultFieldPermissions["Doctor"]
    }));

    setUsers([...users, ...newUsers]);
    
    toast({
      title: "Success",
      description: `${newUsers.length} users imported successfully`
    });
  };

  const exportToExcel = () => {
    const csvContent = [
      ["Email", "Category", "Specialty", "Status", "Created Date"].join(","),
      ...filteredUsers.map(user => [
        user.email,
        user.category,
        user.specialty || "",
        user.status,
        user.createdAt
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Users exported to Excel successfully"
    });
  };

  const clearFilters = () => {
    setSpecialtyFilter("all");
    setSearchFilter("");
  };

  const hasActiveFilters = specialtyFilter !== "all" || searchFilter !== "";

  return (
    <div className="space-y-6">
      <UserForm
        newUserEmail={newUserEmail}
        setNewUserEmail={setNewUserEmail}
        newUserCategory={newUserCategory}
        setNewUserCategory={setNewUserCategory}
        newUserSpecialty={newUserSpecialty}
        setNewUserSpecialty={setNewUserSpecialty}
        onAddUser={addUser}
        onExcelUpload={handleExcelUpload}
      />

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <CardTitle>User Filters & Export</CardTitle>
          <CardDescription>Filter users and export data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <Input
                id="search"
                placeholder="Search by email or category..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="specialty-filter">Filter by Specialty</Label>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue />
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
            <Button onClick={exportToExcel} variant="outline">
              <FileDown className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <UserTable
        users={filteredUsers}
        editingUser={editingUser}
        editingPermissions={editingPermissions}
        onEdit={startEditing}
        onSave={savePermissions}
        onCancel={cancelEditing}
        onDelete={deleteUser}
        onUpdatePermission={updatePermission}
      />
    </div>
  );
};

export default EnhancedUserManagement;
