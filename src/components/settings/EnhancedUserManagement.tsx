
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Settings, Plus, Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserExcelUpload from "./UserExcelUpload";
import * as XLSX from 'xlsx';

const userCategories = [
  "Admin",
  "Doctor", 
  "Nurse",
  "Case Coordinator",
  "Hospital",
  "Finance",
  "Customer Service"
];

const specialties = [
  "Cardiology",
  "Neurology", 
  "Orthopedics",
  "Pediatrics",
  "Surgery",
  "Radiology",
  "Emergency Medicine",
  "Internal Medicine",
  "Dermatology",
  "Psychiatry"
];

const systemFields = [
  { id: "patientName", name: "Patient Name", required: true },
  { id: "mrn", name: "MRN", required: true },
  { id: "serviceDescription", name: "Service Description", required: true },
  { id: "hospital", name: "Hospital", required: true },
  { id: "status", name: "Status", required: true },
  { id: "assignedDoctor", name: "Assigned Doctor", required: false },
  { id: "phone", name: "Phone", required: false },
  { id: "expectedSurgeryDate", name: "Expected Surgery Date", required: false },
  { id: "paymentStatus", name: "Payment Status", required: false },
  { id: "notes", name: "Notes", required: false }
];

const defaultFieldPermissions = {
  "Admin": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: "edit" }), {}),
  "Doctor": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: field.id === "paymentStatus" ? "view" : "edit" }), {}),
  "Nurse": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: field.id === "paymentStatus" ? "none" : "edit" }), {}),
  "Case Coordinator": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: "view" }), {}),
  "Hospital": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: "view" }), {}),
  "Finance": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: field.id === "paymentStatus" ? "edit" : "view" }), {}),
  "Customer Service": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: "view" }), {})
};

type User = {
  id: string;
  email: string;
  category: string;
  specialty?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  fieldPermissions: Record<string, "none" | "view" | "edit">;
};

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

  const getPermissionColor = (permission: "none" | "view" | "edit") => {
    switch (permission) {
      case "edit": return "bg-green-100 text-green-800";
      case "view": return "bg-blue-100 text-blue-800";
      case "none": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Add users with automatic field permissions based on their role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@hospital.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="category">Category</Label>
              <Select value={newUserCategory} onValueChange={setNewUserCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newUserCategory === "Doctor" && (
              <div className="w-48">
                <Label htmlFor="specialty">Specialty</Label>
                <Select value={newUserSpecialty} onValueChange={setNewUserSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleAddUser}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <UserExcelUpload onUpload={handleExcelUpload} />
          </div>
        </CardContent>
      </Card>

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
              {filteredUsers.map((user) => (
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
                      <div className="space-y-3 max-w-md">
                        {systemFields.map(field => (
                          <div key={field.id} className="flex items-center justify-between">
                            <Label className="text-sm">{field.name}</Label>
                            <Select 
                              value={editPermissions[field.id] || "none"} 
                              onValueChange={(value: "none" | "view" | "edit") => 
                                updateFieldPermission(field.id, value)
                              }
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="view">View</SelectItem>
                                <SelectItem value="edit">Edit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(user.fieldPermissions).slice(0, 3).map(([fieldId, permission]) => {
                          const field = systemFields.find(f => f.id === fieldId);
                          return field ? (
                            <Badge key={fieldId} className={`text-xs ${getPermissionColor(permission)}`}>
                              {field.name}: {permission}
                            </Badge>
                          ) : null;
                        })}
                        {Object.keys(user.fieldPermissions).length > 3 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Badge variant="secondary" className="text-xs cursor-pointer">
                                +{Object.keys(user.fieldPermissions).length - 3} more
                              </Badge>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Field Permissions for {user.email}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                {Object.entries(user.fieldPermissions).map(([fieldId, permission]) => {
                                  const field = systemFields.find(f => f.id === fieldId);
                                  return field ? (
                                    <div key={fieldId} className="flex justify-between items-center">
                                      <span className="text-sm">{field.name}</span>
                                      <Badge className={getPermissionColor(permission)}>
                                        {permission}
                                      </Badge>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveUser(user.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(user.id)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedUserManagement;
