import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserExcelUpload from "./userExcelUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hospitals } from "@/data/medicalData";

interface FieldConfig {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: string[];
  required: boolean;
  category: string;
  userRoles: string[];
}

const AdminFieldConfiguration = () => {
  const [fields, setFields] = useState<FieldConfig[]>([
    {
      id: 'specialty',
      name: 'Medical Specialty',
      type: 'select',
      options: ['Cardiology', 'Neurology', 'Orthopedics', 'General Surgery', 'Pediatrics', 'OB/GYN', 'Oncology', 'Gastroenterology', 'Dermatology', 'Endocrinology'],
      required: true,
      category: 'Medical',
      userRoles: ['Doctor', 'Nurse', 'Hospital', 'Case Coordinator']
    },
    {
      id: 'requestStatus',
      name: 'Request Status',
      type: 'select',
      options: ['Pending', 'Under Review', 'Approved', 'Rejected', 'On Hold', 'Completed', 'Cancelled'],
      required: true,
      category: 'System',
      userRoles: ['Admin', 'Case Coordinator', 'Hospital']
    },
    {
      id: 'priority',
      name: 'Priority Level',
      type: 'select',
      options: ['Low', 'Normal', 'High', 'Emergency'],
      required: false,
      category: 'System',
      userRoles: ['Admin', 'Doctor', 'Case Coordinator']
    },
    {
      id: 'hospitalName',
      name: 'Hospital Name',
      type: 'select',
      options: hospitals,
      required: true,
      category: 'Hospital',
      userRoles: ['Doctor', 'Nurse', 'Hospital', 'Case Coordinator', 'Admin']
    },
    {
      id: 'serviceDescription',
      name: 'Service Type',
      type: 'select',
      options: ['Consultation', 'Surgery', 'Diagnostic Test', 'Treatment', 'Follow-up', 'Emergency Care'],
      required: false,
      category: 'Medical',
      userRoles: ['Doctor', 'Hospital', 'Case Coordinator']
    }
  ]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [newOption, setNewOption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUserRole, setSelectedUserRole] = useState<string>('All');
  const [editingFieldName, setEditingFieldName] = useState('');
  const { toast } = useToast();

  const categories = ['All', 'Medical', 'Hospital', 'Patient Info', 'Finance', 'User Management', 'System'];
  const userRoles = ['All', 'Admin', 'Doctor', 'Nurse', 'Hospital', 'Case Coordinator', 'Finance', 'Customer Care'];
  
  const filteredFields = fields.filter(field => {
    const categoryMatch = selectedCategory === 'All' || field.category === selectedCategory;
    const roleMatch = selectedUserRole === 'All' || field.userRoles.includes(selectedUserRole);
    return categoryMatch && roleMatch;
  });

  const addOption = (fieldId: string) => {
    if (!newOption.trim()) return;
    
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { ...field, options: [...(field.options || []), newOption.trim()] }
        : field
    ));
    
    setNewOption('');
    toast({
      title: "Option Added",
      description: `Added "${newOption}" to field options.`
    });
  };

  const removeOption = (fieldId: string, optionToRemove: string) => {
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { ...field, options: field.options?.filter(option => option !== optionToRemove) }
        : field
    ));
    
    toast({
      title: "Option Removed",
      description: `Removed "${optionToRemove}" from field options.`
    });
  };

  const startEditingFieldName = (fieldId: string, currentName: string) => {
    setEditingField(fieldId);
    setEditingFieldName(currentName);
  };

  const saveFieldName = (fieldId: string) => {
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { ...field, name: editingFieldName }
        : field
    ));
    
    setEditingField(null);
    setEditingFieldName('');
    
    toast({
      title: "Field Name Updated",
      description: "Field name has been successfully updated."
    });
  };

  const addNewField = () => {
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      name: 'New Field',
      type: 'text',
      required: false,
      category: 'Medical',
      userRoles: ['Admin']
    };
    
    setFields([...fields, newField]);
    startEditingFieldName(newField.id, newField.name);
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    toast({
      title: "Field Deleted",
      description: "Field has been removed from configuration."
    });
  };

  const updateFieldRoles = (fieldId: string, roles: string[]) => {
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { ...field, userRoles: roles }
        : field
    ));
  };

  const handleExcelUpload = (uploadedData: any[]) => {
    console.log("Field configuration data uploaded:", uploadedData);
    toast({
      title: "Excel Data Uploaded",
      description: `${uploadedData.length} field configurations processed.`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Field Configuration</CardTitle>
          <CardDescription>
            Configure all dropdown fields, field names, and options available across all user roles and forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fields" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fields">Field Management</TabsTrigger>
              <TabsTrigger value="global">Global Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div>
                    <Label htmlFor="category-filter">Filter by Category:</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role-filter">Filter by User Role:</Label>
                    <Select value={selectedUserRole} onValueChange={setSelectedUserRole}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <UserExcelUpload onUpload={handleExcelUpload} />
                  <Button onClick={addNewField} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Field
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {filteredFields.map(field => (
                  <div key={field.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {editingField === field.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingFieldName}
                              onChange={(e) => setEditingFieldName(e.target.value)}
                              className="w-64"
                              placeholder="Field name"
                            />
                            <Button
                              size="sm"
                              onClick={() => saveFieldName(field.id)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingField(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold text-lg">{field.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingFieldName(field.id, field.name)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Badge variant="outline">{field.type}</Badge>
                        <Badge variant="secondary">{field.category}</Badge>
                        {field.required && <Badge variant="destructive">Required</Badge>}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteField(field.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* User Roles */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Available for User Roles:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.userRoles.map(role => (
                          <Badge key={role} variant="outline">{role}</Badge>
                        ))}
                      </div>
                    </div>

                    {field.type === 'select' && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Available Options:</Label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {field.options?.map(option => (
                            <div key={option} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                              <span className="text-sm font-medium">{option}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 w-5 h-5 hover:bg-red-100"
                                onClick={() => removeOption(field.id, option)}
                              >
                                <X className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add new option"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addOption(field.id)}
                            className="flex-1"
                          />
                          <Button onClick={() => addOption(field.id)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="global" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Global System Settings</CardTitle>
                  <CardDescription>Configure system-wide field behaviors and defaults</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      These settings affect how fields behave across all user interfaces and forms.
                      Changes here will immediately apply to all active users and forms.
                    </p>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Field configuration changes will be applied in real-time.
                        Make sure to test changes in a staging environment before applying to production.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFieldConfiguration;
