
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const userCategories = [
  "Admin",
  "Doctor", 
  "Nurse",
  "Case Coordinator",
  "Hospital",
  "Finance",
  "Customer Service"
];

const privileges = [
  { id: "view_requests", name: "View Requests" },
  { id: "create_requests", name: "Create Requests" },
  { id: "modify_requests", name: "Modify Requests" },
  { id: "delete_requests", name: "Delete Requests" },
  { id: "view_analytics", name: "View Analytics" },
  { id: "manage_users", name: "Manage Users" },
  { id: "view_all_requests", name: "View All Requests" },
  { id: "approve_requests", name: "Approve Requests" }
];

const defaultPrivileges = {
  "Admin": ["view_requests", "create_requests", "modify_requests", "delete_requests", "view_analytics", "manage_users", "view_all_requests", "approve_requests"],
  "Doctor": ["view_requests", "create_requests", "modify_requests", "view_analytics"],
  "Nurse": ["view_requests", "create_requests", "modify_requests"],
  "Case Coordinator": ["view_requests", "view_analytics", "approve_requests"],
  "Hospital": ["view_requests", "view_analytics"],
  "Finance": ["view_requests", "view_analytics"],
  "Customer Service": ["view_requests"]
};

type User = {
  id: string;
  email: string;
  category: string;
  privileges: string[];
  status: "Active" | "Inactive";
  createdAt: string;
};

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      email: "admin@hospital.com",
      category: "Admin",
      privileges: defaultPrivileges["Admin"],
      status: "Active",
      createdAt: "2025-01-01"
    },
    {
      id: "2", 
      email: "dr.ahmed@hospital.com",
      category: "Doctor",
      privileges: defaultPrivileges["Doctor"],
      status: "Active",
      createdAt: "2025-01-02"
    },
    {
      id: "3",
      email: "nurse.sara@hospital.com", 
      category: "Nurse",
      privileges: defaultPrivileges["Nurse"],
      status: "Active",
      createdAt: "2025-01-03"
    }
  ]);
  
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserCategory, setNewUserCategory] = useState("Nurse");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPrivileges, setEditPrivileges] = useState<string[]>([]);
  const [categoryPrivileges, setCategoryPrivileges] = useState(defaultPrivileges);

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
      privileges: categoryPrivileges[newUserCategory] || [],
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, newUser]);
    setNewUserEmail("");
    setNewUserCategory("Nurse");
    
    toast({
      title: "Success",
      description: `User ${newUserEmail} added successfully as ${newUserCategory}`
    });
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
      setEditPrivileges(user.privileges);
    }
  };

  const handleSaveUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, privileges: editPrivileges }
        : user
    ));
    setEditingUser(null);
    toast({
      title: "Success",
      description: "User privileges updated successfully"
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditPrivileges([]);
  };

  const togglePrivilege = (privilegeId: string) => {
    setEditPrivileges(prev => 
      prev.includes(privilegeId)
        ? prev.filter(p => p !== privilegeId)
        : [...prev, privilegeId]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Add users by email and assign them to categories. All users default to Nurse category.</CardDescription>
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
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>Manage existing users and their privileges</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Privileges</TableHead>
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
                    {editingUser === user.id ? (
                      <div className="space-y-2">
                        {privileges.map(privilege => (
                          <label key={privilege.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editPrivileges.includes(privilege.id)}
                              onChange={() => togglePrivilege(privilege.id)}
                              className="rounded"
                            />
                            <span className="text-sm">{privilege.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.privileges.slice(0, 3).map(privilege => (
                          <Badge key={privilege} variant="secondary" className="text-xs">
                            {privileges.find(p => p.id === privilege)?.name}
                          </Badge>
                        ))}
                        {user.privileges.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{user.privileges.length - 3} more
                          </Badge>
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
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(user.id)}>
                          <Edit className="w-4 h-4" />
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

export default UserManagement;
