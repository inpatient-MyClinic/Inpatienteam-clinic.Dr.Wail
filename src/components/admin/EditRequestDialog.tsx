import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';

interface EditRequestDialogProps {
  request: any;
  onSave: (requestId: string, updatedData: any) => void;
}

const EditRequestDialog = ({ request, onSave }: EditRequestDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: request.patientName || '',
    hospital: request.hospital || '',
    specialty: request.specialty || '',
    status: request.status || '',
    notes: request.notes || '',
    urgency: request.urgency || 'Normal',
    expectedSurgeryDate: request.expectedSurgeryDate || '',
    diagnosis: request.diagnosis || ''
  });

  const statusOptions = [
    'Pending',
    'Under Review',
    'Approved',
    'Rejected',
    'Scheduled',
    'Completed',
    'Cancelled'
  ];

  const urgencyOptions = [
    'Low',
    'Normal', 
    'High',
    'Urgent',
    'Emergency'
  ];

  const specialties = [
    'Cardiology',
    'Orthopedics', 
    'Neurology',
    'Oncology',
    'General Surgery',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Emergency Medicine',
    'Internal Medicine',
    'Dermatology'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.patientName.trim() || !formData.hospital.trim()) {
      toast({
        title: "Validation Error",
        description: "Patient name and hospital are required fields.",
        variant: "destructive"
      });
      return;
    }

    onSave(request.id, formData);
    
    toast({
      title: "Request Updated",
      description: "Request has been successfully updated."
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Edit Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Request - {request.patientName}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              placeholder="Enter patient name"
            />
          </div>

          <div>
            <Label htmlFor="hospital">Hospital *</Label>
            <Input
              id="hospital"
              value={formData.hospital}
              onChange={(e) => handleInputChange('hospital', e.target.value)}
              placeholder="Enter hospital name"
            />
          </div>

          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="urgency">Urgency</Label>
            <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                {urgencyOptions.map(urgency => (
                  <SelectItem key={urgency} value={urgency}>
                    {urgency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expectedSurgeryDate">Expected Surgery Date</Label>
            <Input
              id="expectedSurgeryDate"
              type="date"
              value={formData.expectedSurgeryDate}
              onChange={(e) => handleInputChange('expectedSurgeryDate', e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              placeholder="Enter diagnosis details"
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter additional notes"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRequestDialog;