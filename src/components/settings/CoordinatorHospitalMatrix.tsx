import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface CoordinatorHospital {
  coordinatorName: string;
  hospitals: string[];
}

const CoordinatorHospitalMatrix = () => {
  const { toast } = useToast();
  const [coordinators, setCoordinators] = useState<CoordinatorHospital[]>([]);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [newCoordinator, setNewCoordinator] = useState('');
  const [newHospital, setNewHospital] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const savedCoordinators = localStorage.getItem('coordinator_hospital_assignments');
    const savedHospitals = localStorage.getItem('hospital_codes');
    
    if (savedCoordinators) {
      setCoordinators(JSON.parse(savedCoordinators));
    }
    
    if (savedHospitals) {
      const hospitalCodes = JSON.parse(savedHospitals);
      const hospitalNames = hospitalCodes.map((h: any) => h.hospitalName || h.name || h.code);
      setHospitals(hospitalNames);
    } else {
      // Default hospitals if none exist
      setHospitals([
        'King Faisal Specialist Hospital',
        'Saudi German Hospital',
        'Dr. Sulaiman Al Habib Hospital',
        'Kingdom Hospital',
        'National Guard Hospital',
        'King Abdulaziz Medical City'
      ]);
    }
  }, []);

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem('coordinator_hospital_assignments', JSON.stringify(coordinators));
    localStorage.setItem('available_hospitals', JSON.stringify(hospitals));
    
    toast({
      title: "Matrix Saved",
      description: "Coordinator-Hospital assignments have been saved successfully."
    });
  };

  const addCoordinator = () => {
    if (!newCoordinator.trim()) return;
    
    const newCoord: CoordinatorHospital = {
      coordinatorName: newCoordinator.trim(),
      hospitals: []
    };
    
    setCoordinators([...coordinators, newCoord]);
    setNewCoordinator('');
  };

  const addHospital = () => {
    if (!newHospital.trim() || hospitals.includes(newHospital.trim())) return;
    
    setHospitals([...hospitals, newHospital.trim()]);
    setNewHospital('');
  };

  const removeCoordinator = (index: number) => {
    setCoordinators(coordinators.filter((_, i) => i !== index));
  };

  const removeHospital = (hospital: string) => {
    setHospitals(hospitals.filter(h => h !== hospital));
    // Also remove from all coordinator assignments
    setCoordinators(coordinators.map(coord => ({
      ...coord,
      hospitals: coord.hospitals.filter(h => h !== hospital)
    })));
  };

  const toggleHospitalAssignment = (coordinatorIndex: number, hospital: string) => {
    setCoordinators(coordinators.map((coord, index) => {
      if (index === coordinatorIndex) {
        const isAssigned = coord.hospitals.includes(hospital);
        return {
          ...coord,
          hospitals: isAssigned 
            ? coord.hospitals.filter(h => h !== hospital)
            : [...coord.hospitals, hospital]
        };
      }
      return coord;
    }));
  };

  const getHospitalCoordinatorCount = (hospital: string) => {
    return coordinators.filter(coord => coord.hospitals.includes(hospital)).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Coordinator - Hospital Assignment Matrix</CardTitle>
        <p className="text-sm text-muted-foreground">
          Assign hospitals to case coordinators. Requests will auto-escalate after 4 hours to the assigned coordinator.
          Hospitals with multiple coordinators won't auto-escalate.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Coordinator */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newCoordinator">Add Case Coordinator</Label>
            <Input
              id="newCoordinator"
              value={newCoordinator}
              onChange={(e) => setNewCoordinator(e.target.value)}
              placeholder="Enter coordinator name"
              onKeyPress={(e) => e.key === 'Enter' && addCoordinator()}
            />
          </div>
          <Button onClick={addCoordinator} className="mt-6">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Add Hospital */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newHospital">Add Hospital</Label>
            <Input
              id="newHospital"
              value={newHospital}
              onChange={(e) => setNewHospital(e.target.value)}
              placeholder="Enter hospital name"
              onKeyPress={(e) => e.key === 'Enter' && addHospital()}
            />
          </div>
          <Button onClick={addHospital} className="mt-6">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Matrix Table */}
        {coordinators.length > 0 && hospitals.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4">
              <h3 className="font-medium">Assignment Matrix</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 font-medium">Case Coordinator</th>
                    {hospitals.map(hospital => (
                      <th key={hospital} className="text-center p-3 font-medium min-w-[120px]">
                        <div className="flex flex-col items-center">
                          <span className="text-xs">{hospital}</span>
                          <span className="text-xs text-gray-500">
                            ({getHospitalCoordinatorCount(hospital)} assigned)
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHospital(hospital)}
                            className="mt-1 p-1 h-6 w-6"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </th>
                    ))}
                    <th className="text-center p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coordinators.map((coordinator, coordIndex) => (
                    <tr key={coordinator.coordinatorName} className="border-t">
                      <td className="p-3 font-medium">
                        {coordinator.coordinatorName}
                      </td>
                      {hospitals.map(hospital => (
                        <td key={hospital} className="text-center p-3">
                          <Checkbox
                            checked={coordinator.hospitals.includes(hospital)}
                            onCheckedChange={() => toggleHospitalAssignment(coordIndex, hospital)}
                          />
                        </td>
                      ))}
                      <td className="text-center p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCoordinator(coordIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assignment Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Auto-Escalation Rules</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Requests unassigned for 4+ hours will auto-escalate to the hospital's assigned coordinator</li>
            <li>• Hospitals with exactly 1 coordinator: auto-escalation enabled</li>
            <li>• Hospitals with 2+ coordinators: auto-escalation disabled (manual assignment required)</li>
            <li>• Hospitals with 0 coordinators: no auto-escalation</li>
          </ul>
        </div>

        {/* Escalation Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 text-green-700">Auto-Escalation Enabled</h4>
            <div className="space-y-1">
              {hospitals.filter(h => getHospitalCoordinatorCount(h) === 1).map(hospital => (
                <div key={hospital} className="text-sm p-2 bg-green-50 rounded">
                  {hospital} → {coordinators.find(c => c.hospitals.includes(hospital))?.coordinatorName}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-amber-700">Auto-Escalation Disabled</h4>
            <div className="space-y-1">
              {hospitals.filter(h => getHospitalCoordinatorCount(h) !== 1).map(hospital => (
                <div key={hospital} className="text-sm p-2 bg-amber-50 rounded">
                  {hospital} ({getHospitalCoordinatorCount(hospital)} coordinators)
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={saveData} className="bg-blue-600 hover:bg-blue-700">
            Save Matrix
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoordinatorHospitalMatrix;