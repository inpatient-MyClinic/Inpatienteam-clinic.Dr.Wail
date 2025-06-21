
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { userCategories, specialties } from "./types";
import UserExcelUpload from "../UserExcelUpload";

interface UserFormProps {
  newUserEmail: string;
  setNewUserEmail: (email: string) => void;
  newUserCategory: string;
  setNewUserCategory: (category: string) => void;
  newUserSpecialty: string;
  setNewUserSpecialty: (specialty: string) => void;
  onAddUser: () => void;
  onExcelUpload: (users: any[]) => void;
}

const UserForm = ({
  newUserEmail,
  setNewUserEmail,
  newUserCategory,
  setNewUserCategory,
  newUserSpecialty,
  setNewUserSpecialty,
  onAddUser,
  onExcelUpload
}: UserFormProps) => {
  return (
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
                <SelectValue placeholder="Select category" />
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
                  <SelectItem value="none">No Specialty</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={onAddUser}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <UserExcelUpload onUpload={onExcelUpload} />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserForm;
