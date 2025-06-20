
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { User, defaultFieldPermissions, specialties } from "./userManagement/types";
import UserForm from "./userManagement/UserForm";
import UserTable from "./userManagement/UserTable";

const EnhancedUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      email: "admin@hospital.com",
      category: "Admin",
      status: "Active",
      createdAt: "2025-01-01",
      fieldPermissions: defaultFieldPermissions["Admin"]
    },
    {
      id: "2", 
      email: "dr.ahmed@hospital.com",
      category: "Doctor",
      specialty: "Cardiology",
      status: "Active",
      createdAt: "2025-01-02",
      fieldPermissions: defaultFieldPermissions["Doctor"]
    },
    {
      id: "3",
      email: "nurse.sara@hospital.com", 
      category: "Nurse",
      status: "Active",
      createdAt: "2025-01-03",
      fieldPermissions: defaultFieldPermissions["Nurse"]
    }
  ]);
  
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserCategory, setNewUserCategory] = useState("Nurse");
  const [newUserSpecialty, setNewUserSpecialty] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<Record<string, "none" | "view" | "edit">>({});
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("");

  const handleAddUser = () => {
    if (!newUserEmail) {
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
      id: Date.now().toString(),
      email: newUserEmail,
      category: newUserCategory,
      specialty: newUserCategory === "Doctor" ? newUserSpecialty : undefined,
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions[newUserCategory] || {}
    };

    setUsers([...users, newUser]);
    setNewUserEmail("");
    setNewUserCategory("Nurse");
    setNewUserSpecialty("");
    
    toast({
      title: "Success",
      description: `User ${newUserEmail} added successfully as ${newUserCategory}`
    });
  };

  const handleExcelUpload = (uploadedUsers: any[]) => {
    const newUsers: User[] = uploadedUsers.map((row, index) => ({
      id: (Date.now() + index).toString(),
      email: row["Email"],
      category: row["Category"] || "Doctor",
      specialty: row["Specialty"],
      status: "Active" as const,
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions[row["Category"] || "Doctor"] || {}
    }));

    setUsers(prev => [...prev, ...newUsers]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "User deleted successfully"
    });
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(userId);
      setEditPermissions(user.fieldPermissions);
    }
  };

  const handleSaveUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, fieldPermissions: editPermissions }
        : user
    ));
    setEditingUser(null);
    toast({
      title: "Success",
      description: "User field permissions updated successfully"
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditPermissions({});
  };

  const updateFieldPermission = (fieldId: string, permission: "none" | "view" | "edit") => {
    setEditPermissions(prev => ({
      ...prev,
      [fieldId]: permission
    }));
  };

  const filteredUsers = specialtyFilter 
    ? users.filter(user => user.specialty === specialtyFilter)
    : users;

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      "Email": user.email,
      "Category": user.category,
      "Specialty": user.specialty || "",
      "Status": user.status,
      "Created Date": user.createdAt,
      "Field Permissions": Object.entries(user.fieldPermissions)
        .map(([field, permission]) => `${field}:${permission}`)
        .join("; ")
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    
    const filename = specialtyFilter 
      ? `users_${specialtyFilter}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `all_users_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    
    toast({
      title: "Export Successful",
      description: `${filteredUsers.length} users exported to Excel`
    });
  };

  return (
    <div className="space-y-6">
      <UserForm
        newUserEmail={newUserEmail}
        setNewUserEmail={setNewUserEmail}
        newUserCategory={newUserCategory}
        setNewUserCategory={setNewUserCategory}
        newUserSpecialty={newUserSpecialty}
        setNewUserSpecialty={setNewUserSpecialty}
        onAddUser={handleAddUser}
        onExcelUpload={handleExcelUpload}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>Manage users and their field-level permissions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportToExcel} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable
            users={filteredUsers}
            editingUser={editingUser}
            editPermissions={editPermissions}
            onEditUser={handleEditUser}
            onSaveUser={handleSaveUser}
            onCancelEdit={handleCancelEdit}
            onDeleteUser={handleDeleteUser}
            onUpdateFieldPermission={updateFieldPermission}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedUserManagement;
