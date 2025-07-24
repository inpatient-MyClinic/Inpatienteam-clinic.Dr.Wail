
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Edit, Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const hospitals = [
  "King Fahad Hospital",
  "King Faisal Hospital", 
  "King Abdulaziz Hospital",
  "Prince Sultan Hospital",
  "King Khalid Hospital",
  "King Saud Hospital",
  "National Guard Hospital",
  "Specialized Hospital",
  "DSFH",
  "DSFH (Albasateen)",
  "EMC"
];

const HospitalCodes = () => {
  const [selectedHospital, setSelectedHospital] = useState("");
  const [surgeryCode, setSurgeryCode] = useState("");
  const [surgeryName, setSurgeryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [hospitalCodes, setHospitalCodes] = useState([]);
  const [copyFromHospital, setCopyFromHospital] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const savedCodes = localStorage.getItem('hospital_codes');
    if (savedCodes) {
      setHospitalCodes(JSON.parse(savedCodes));
    }
  }, []);

  const saveToStorage = (codes) => {
    localStorage.setItem('hospital_codes', JSON.stringify(codes));
    setHospitalCodes(codes);
  };

  const addCode = () => {
    if (!selectedHospital || !surgeryCode || !surgeryName) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    const newCode = {
      id: Date.now(),
      hospital: selectedHospital,
      code: surgeryCode,
      name: surgeryName,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedCodes = [...hospitalCodes, newCode];
    saveToStorage(updatedCodes);
    
    setSurgeryCode("");
    setSurgeryName("");
    setSelectedHospital("");
    
    toast({
      title: "Success",
      description: "Surgery code added successfully"
    });
  };

  const updateCode = () => {
    if (!selectedHospital || !surgeryCode || !surgeryName) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    const updatedCodes = hospitalCodes.map(code => 
      code.id === editingId 
        ? { ...code, hospital: selectedHospital, code: surgeryCode, name: surgeryName }
        : code
    );
    
    saveToStorage(updatedCodes);
    
    setEditingId(null);
    setSurgeryCode("");
    setSurgeryName("");
    setSelectedHospital("");
    
    toast({
      title: "Success",
      description: "Surgery code updated successfully"
    });
  };

  const deleteCode = (id) => {
    const updatedCodes = hospitalCodes.filter(code => code.id !== id);
    saveToStorage(updatedCodes);
    
    toast({
      title: "Success",
      description: "Surgery code deleted successfully"
    });
  };

  const startEditing = (code) => {
    setEditingId(code.id);
    setSelectedHospital(code.hospital);
    setSurgeryCode(code.code);
    setSurgeryName(code.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setSurgeryCode("");
    setSurgeryName("");
    setSelectedHospital("");
  };

  const copyCodesFromHospital = () => {
    if (!copyFromHospital || !selectedHospital) {
      toast({
        title: "Error",
        description: "Please select both hospitals",
        variant: "destructive"
      });
      return;
    }

    const codesToCopy = hospitalCodes.filter(code => code.hospital === copyFromHospital);
    
    if (codesToCopy.length === 0) {
      toast({
        title: "Error",
        description: "No codes found for the selected hospital",
        variant: "destructive"
      });
      return;
    }

    const newCodes = codesToCopy.map(code => ({
      ...code,
      id: Date.now() + Math.random(),
      hospital: selectedHospital,
      createdAt: new Date().toISOString().split('T')[0]
    }));

    const updatedCodes = [...hospitalCodes, ...newCodes];
    saveToStorage(updatedCodes);
    
    setCopyFromHospital("");
    setSelectedHospital("");
    
    toast({
      title: "Success",
      description: `Copied ${newCodes.length} codes to ${selectedHospital}`
    });
  };

  const getCodesForHospital = (hospital) => {
    return hospitalCodes.filter(code => code.hospital === hospital);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Hospital Surgery Codes Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add/Edit Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="hospital">Hospital</Label>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map(hospital => (
                    <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="code">Surgery Code</Label>
              <Input
                id="code"
                value={surgeryCode}
                onChange={(e) => setSurgeryCode(e.target.value)}
                placeholder="Enter surgery code"
              />
            </div>
            
            <div>
              <Label htmlFor="name">Surgery Name</Label>
              <Input
                id="name"
                value={surgeryName}
                onChange={(e) => setSurgeryName(e.target.value)}
                placeholder="Enter surgery name"
              />
            </div>
            
            <div className="flex items-end gap-2">
              {editingId ? (
                <>
                  <Button onClick={updateCode} className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Update
                  </Button>
                  <Button onClick={cancelEditing} variant="outline">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={addCode} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Code
                </Button>
              )}
            </div>
          </div>

          {/* Copy Codes Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Copy Codes Between Hospitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="copyFrom">Copy From Hospital</Label>
                <Select value={copyFromHospital} onValueChange={setCopyFromHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map(hospital => (
                      <SelectItem key={hospital} value={hospital}>
                        {hospital} ({getCodesForHospital(hospital).length} codes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="copyTo">Copy To Hospital</Label>
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map(hospital => (
                      <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={copyCodesFromHospital} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Codes
                </Button>
              </div>
            </div>
          </div>

          {/* Codes Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">All Hospital Codes ({hospitalCodes.length})</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Surgery Code</TableHead>
                  <TableHead>Surgery Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospitalCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No surgery codes found. Add some codes to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  hospitalCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <Badge variant="outline">{code.hospital}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{code.code}</TableCell>
                      <TableCell>{code.name}</TableCell>
                      <TableCell>{code.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(code)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCode(code.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalCodes;
