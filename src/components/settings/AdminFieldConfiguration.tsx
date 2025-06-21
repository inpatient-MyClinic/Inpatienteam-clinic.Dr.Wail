
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserExcelUpload from "./userExcelUpload";

interface FieldConfig {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: string[];
  required: boolean;
  category: string;
}

const AdminFieldConfiguration = () => {
  const [fields, setFields] = useState<FieldConfig[]>([
    {
      id: 'specialty',
      name: 'Specialty',
      type: 'select',
      options: ['Cardiology', 'Neurology', 'Orthopedics', 'General Surgery', 'Pediatrics', 'OB/GYN', 'Oncology', 'Gastroenterology', 'Dermatology', 'Endocrinology'],
      required: true,
      category: 'Medical'
    },
    {
      id: 'category',
      name: 'User Category',
      type: 'select',
      options: ['Doctor', 'Nurse', 'Admin', 'Case Coordinator', 'Hospital', 'Finance', 'Customer Care'],
      required: true,
      category: 'User Management'
    },
    {
      id: 'referredFrom',
      name: 'Referred From',
      type: 'select',
      options: ['Emergency Department', 'Outpatient Clinic', 'Primary Care', 'Other Hospital', 'Self Referral', 'Insurance Company'],
      required: false,
      category: 'Medical'
    },
    {
      id: 'hospitalName',
      name: 'Hospital Name',
      type: 'select',
      options: ['King Fahad Hospital', 'King Faisal Hospital', 'King Abdulaziz Hospital', 'Prince Sultan Hospital', 'King Khaled Hospital', 'National Guard Hospital'],
      required: true,
      category: 'Hospital'
    },
    {
      id: 'admissionType',
      name: 'Admission Type',
      type: 'select',
      options: ['Inpatient', 'Outpatient', 'Day Surgery', 'Emergency'],
      required: false,
      category: 'Medical'
    },
    {
      id: 'urgency',
      name: 'Urgency Level',
      type: 'select',
      options: ['Low', 'Normal', 'High', 'Emergency'],
      required: false,
      category: 'Medical'
    },
    {
      id: 'coverageType',
      name: 'Coverage Type',
      type: 'select',
      options: ['Insurance', 'Cash', 'Government', 'Company'],
      required: false,
      category: 'Finance'
    },
    {
      id: 'gender',
      name: 'Gender',
      type: 'select',
      options: ['Male', 'Female'],
      required: true,
      category: 'Patient Info'
    },
    {
      id: 'requestStatus',
      name: 'Request Status',
      type: 'select',
      options: ['Pending', 'Under Review', 'Approved', 'Rejected', 'On Hold', 'Completed', 'Cancelled'],
      required: true,
      category: 'System'
    },
    {
      id: 'serviceDescription',
      name: 'Service Description',
      type: 'select',
      options: ['Consultation', 'Surgery', 'Diagnostic Test', 'Treatment', 'Follow-up', 'Emergency Care'],
      required: false,
      category: 'Medical'
    }
  ]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [newOption, setNewOption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { toast } = useToast();

  const categories = ['All', 'Medical', 'Hospital', 'Patient Info', 'Finance', 'User Management', 'System'];
  const filteredFields = selectedCategory === 'All' ? fields : fields.filter(field => field.category === selectedCategory);

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

  const addNewField = () => {
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      name: 'New Field',
      type: 'text',
      required: false,
      category: 'Medical'
    };
    
    setFields([...fields, newField]);
    setEditingField(newField.id);
  };

  const updateFieldName = (fieldId: string, newName: string) => {
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { ...field, name: newName }
        : field
    ));
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    toast({
      title: "Field Deleted",
      description: "Field has been removed from configuration."
    });
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
          <CardTitle>Admin Field Configuration</CardTitle>
          <CardDescription>
            Configure all dropdown fields and options available in request creation forms across all user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Label htmlFor="category-filter">Filter by Category:</Label>
              <select 
                id="category-filter"
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded px-3 py-1"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
              <div key={field.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {editingField === field.id ? (
                      <Input
                        value={field.name}
                        onChange={(e) => updateFieldName(field.id, e.target.value)}
                        className="w-40"
                      />
                    ) : (
                      <h4 className="font-medium">{field.name}</h4>
                    )}
                    <Badge variant="outline">{field.type}</Badge>
                    <Badge variant="secondary">{field.category}</Badge>
                    {field.required && <Badge variant="destructive">Required</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                    >
                      {editingField === field.id ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteField(field.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {field.type === 'select' && (
                  <div className="space-y-3">
                    <Label>Options:</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {field.options?.map(option => (
                        <div key={option} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                          <span className="text-sm">{option}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 w-4 h-4"
                            onClick={() => removeOption(field.id, option)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {editingField === field.id && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="New option"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addOption(field.id)}
                        />
                        <Button onClick={() => addOption(field.id)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFieldConfiguration;
