
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const userCategories = [
  "Admin",
  "Doctor", 
  "Nurse",
  "Case Coordinator",
  "Hospital",
  "Finance",
  "Customer Service"
];

const SystemSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure system-wide settings and templates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Default User Category</Label>
            <Select defaultValue="Nurse">
              <SelectTrigger className="w-48">
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
            <p className="text-sm text-gray-500 mt-1">All new users will be assigned to this category by default</p>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Excel Upload Templates</h3>
            <Button variant="outline">Download User Template</Button>
            <p className="text-sm text-gray-500 mt-1">Download Excel template for bulk user import</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
