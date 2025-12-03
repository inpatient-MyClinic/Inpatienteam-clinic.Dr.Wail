import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

interface AssignmentDialogProps {
  request: any;
  onAssign: (requestId: string, coordinatorName: string) => void;
}

const AssignmentDialog = ({ request, onAssign }: AssignmentDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCoordinator, setSelectedCoordinator] = useState('');
  const [coordinators, setCoordinators] = useState<string[]>([]);
  const [filteredCoordinators, setFilteredCoordinators] = useState<string[]>([]);

  const categories = [
    'All',
    'Cardiology', 
    'Orthopedics',
    'Neurology',
    'Oncology',
    'General Surgery',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Emergency Medicine'
  ];

  useEffect(() => {
    // Load coordinators from multiple sources for robustness
    const loadCoordinators = () => {
      const coordinatorSet = new Set<string>();
      
      // Source 1: coordinator_hospital_assignments
      try {
        const assignments = JSON.parse(localStorage.getItem('coordinator_hospital_assignments') || '[]');
        assignments.forEach((a: any) => {
          if (a.coordinatorName) coordinatorSet.add(a.coordinatorName);
        });
      } catch (e) { console.error('Error loading assignments:', e); }
      
      // Source 2: Users with case-coordinator role
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.forEach((u: any) => {
          if (u.category?.toLowerCase().includes('coordinator') || u.role?.toLowerCase().includes('coordinator')) {
            if (u.name || u.fullName || u.email) {
              coordinatorSet.add(u.name || u.fullName || u.email.split('@')[0]);
            }
          }
        });
      } catch (e) { console.error('Error loading users:', e); }
      
      // Source 3: Existing requests with assigned coordinators
      try {
        const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
        requests.forEach((r: any) => {
          if (r.assignedCoordinator) coordinatorSet.add(r.assignedCoordinator);
          if (r.caseCoordinator) coordinatorSet.add(r.caseCoordinator);
        });
      } catch (e) { console.error('Error loading requests:', e); }
      
      // Source 4: Admin data with coordinators
      try {
        const adminData = JSON.parse(localStorage.getItem('admin_data') || '[]');
        adminData.forEach((d: any) => {
          if (d.caseCoordinator && d.caseCoordinator !== 'No') coordinatorSet.add(d.caseCoordinator);
          if (d.assignedCoordinator) coordinatorSet.add(d.assignedCoordinator);
        });
      } catch (e) { console.error('Error loading admin data:', e); }
      
      const allCoordinators = Array.from(coordinatorSet).filter(Boolean).sort();
      setCoordinators(allCoordinators);
      setFilteredCoordinators(allCoordinators);
    };
    
    loadCoordinators();
  }, []);

  useEffect(() => {
    if (selectedCategory === '' || selectedCategory === 'All') {
      setFilteredCoordinators(coordinators);
    } else {
      // Filter coordinators by specialty/category
      // For now, show all coordinators regardless of category
      // This can be enhanced to have coordinator specialties
      setFilteredCoordinators(coordinators);
    }
  }, [selectedCategory, coordinators]);

  const handleAssign = () => {
    if (!selectedCoordinator) {
      toast({
        title: "Error",
        description: "Please select a case coordinator.",
        variant: "destructive"
      });
      return;
    }

    onAssign(request.id, selectedCoordinator);
    
    toast({
      title: "Request Assigned",
      description: `Request has been assigned to ${selectedCoordinator}.`
    });

    // Reset form
    setSelectedCategory('');
    setSelectedCoordinator('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Assign to Coordinator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Request to Case Coordinator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Request Details</Label>
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <div>Patient: {request.patientName}</div>
              <div>Hospital: {request.hospital}</div>
              <div>Specialty: {request.specialty}</div>
              <div>Status: {request.status}</div>
            </div>
          </div>

          <div>
            <Label htmlFor="category">Filter by Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="coordinator">Select Case Coordinator</Label>
            <Select value={selectedCoordinator} onValueChange={setSelectedCoordinator}>
              <SelectTrigger>
                <SelectValue placeholder="Choose coordinator" />
              </SelectTrigger>
              <SelectContent>
                {filteredCoordinators.map(coordinator => (
                  <SelectItem key={coordinator} value={coordinator}>
                    {coordinator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredCoordinators.length === 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              No coordinators available for the selected category. 
              Please add coordinators in the Hospital-Coordinator Matrix settings.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedCoordinator}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Assign Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;