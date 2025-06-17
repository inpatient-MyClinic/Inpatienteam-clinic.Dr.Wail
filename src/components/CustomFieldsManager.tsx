
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FieldType = "text" | "number" | "date" | "select" | "textarea";

interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

const CustomFieldsManager = () => {
  const { toast } = useToast();
  const [fields, setFields] = useState<CustomField[]>([]);
  const [newField, setNewField] = useState({
    name: "",
    type: "text" as FieldType,
    required: false,
    options: ""
  });

  const handleAddField = () => {
    if (!newField.name) {
      toast({
        title: "Error",
        description: "Please enter field name",
        variant: "destructive"
      });
      return;
    }

    const field: CustomField = {
      id: Date.now().toString(),
      name: newField.name,
      type: newField.type,
      required: newField.required,
      options: newField.type === "select" ? newField.options.split(",").map(s => s.trim()) : undefined
    };

    setFields(prev => [...prev, field]);
    setNewField({ name: "", type: "text", required: false, options: "" });
    
    toast({
      title: "Success",
      description: "Custom field added successfully"
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    toast({
      title: "Success",
      description: "Field deleted successfully"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Field</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Field Name</Label>
              <Input
                value={newField.name}
                onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter field name"
              />
            </div>
            <div>
              <Label>Field Type</Label>
              <Select 
                value={newField.type} 
                onValueChange={(value: FieldType) => setNewField(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newField.type === "select" && (
              <div className="col-span-2">
                <Label>Options (comma separated)</Label>
                <Input
                  value={newField.options}
                  onChange={(e) => setNewField(prev => ({ ...prev, options: e.target.value }))}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                />
                <span>Required field</span>
              </label>
            </div>
            <Button onClick={handleAddField} className="col-span-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map(field => (
                <TableRow key={field.id}>
                  <TableCell>{field.name}</TableCell>
                  <TableCell>{field.type}</TableCell>
                  <TableCell>{field.required ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

export default CustomFieldsManager;
