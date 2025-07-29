
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, UserPlus, AlertTriangle } from "lucide-react";
import { userCategories, specialties } from "./types";
import UserExcelUpload from "../userExcelUpload";

interface UserFormProps {
  newUserEmail: string;
  setNewUserEmail: (email: string) => void;
  newUserCategory: string;
  setNewUserCategory: (category: string) => void;
  newUserSpecialty: string;
  setNewUserSpecialty: (specialty: string) => void;
  onAddUser: () => void;
  onExcelUpload: (users: any[]) => void;
  onCleanupDuplicates?: () => void;
}

const UserForm = ({
  newUserEmail,
  setNewUserEmail,
  newUserCategory,
  setNewUserCategory,
  newUserSpecialty,
  setNewUserSpecialty,
  onAddUser,
  onExcelUpload,
  onCleanupDuplicates
}: UserFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add New User
        </CardTitle>
        <CardDescription>
          Add users with email validation and automatic role-based permissions. 
          Choose category to set default privileges for website access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="w-full">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@hospital.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="mt-1 w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">User Category *</Label>
              <Select value={newUserCategory} onValueChange={setNewUserCategory}>
                <SelectTrigger className="mt-1 w-full">
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
              <div>
                <Label htmlFor="specialty">Medical Specialty</Label>
                <Select value={newUserSpecialty} onValueChange={setNewUserSpecialty}>
                  <SelectTrigger className="mt-1 w-full">
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
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={onAddUser} className="flex-1 min-w-[120px] bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <div className="flex-1 min-w-[120px]">
              <UserExcelUpload onUpload={onExcelUpload} />
            </div>
            {onCleanupDuplicates && (
              <Button 
                variant="outline" 
                onClick={onCleanupDuplicates}
                className="flex-1 min-w-[140px] text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Remove Duplicates
              </Button>
            )}
          </div>
        </div>

        {/* Role Privileges Preview */}
        {newUserCategory && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Default Privileges for {newUserCategory}:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {newUserCategory === "Admin" && (
                <>
                  <span className="text-green-600">✓ Full System Access</span>
                  <span className="text-green-600">✓ User Management</span>
                  <span className="text-green-600">✓ All Field Editing</span>
                </>
              )}
              {newUserCategory === "Doctor" && (
                <>
                  <span className="text-green-600">✓ Patient Records</span>
                  <span className="text-green-600">✓ Medical Fields</span>
                  <span className="text-yellow-600">◐ Payment View Only</span>
                </>
              )}
              {newUserCategory === "Nurse" && (
                <>
                  <span className="text-green-600">✓ Patient Care</span>
                  <span className="text-green-600">✓ Medical Records</span>
                  <span className="text-red-600">✗ Payment Access</span>
                </>
              )}
              {newUserCategory === "Finance" && (
                <>
                  <span className="text-green-600">✓ Payment Management</span>
                  <span className="text-yellow-600">◐ Patient View Only</span>
                  <span className="text-yellow-600">◐ Medical View Only</span>
                </>
              )}
              {newUserCategory === "Case Coordinator" && (
                <>
                  <span className="text-yellow-600">◐ All Fields View</span>
                  <span className="text-green-600">✓ Case Management</span>
                  <span className="text-green-600">✓ Status Updates</span>
                </>
              )}
              {newUserCategory === "Customer Service" && (
                <>
                  <span className="text-yellow-600">◐ Basic Info View</span>
                  <span className="text-green-600">✓ Patient Contact</span>
                  <span className="text-red-600">✗ Medical Details</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserForm;
