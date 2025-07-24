
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Upload, Download, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import * as XLSX from 'xlsx';

type DoctorAccess = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  canViewPricing: boolean;
  isActive: boolean;
};

const ServicePricingAccess = () => {
  const { toast } = useToast();
  const [doctorAccess, setDoctorAccess] = React.useState<DoctorAccess[]>([
    {
      id: "1",
      name: "Dr. Ahmed Al-Rashid",
      email: "dr.ahmed@hospital.com",
      specialty: "Cardiology",
      canViewPricing: true,
      isActive: true
    },
    {
      id: "2",
      name: "Dr. Sarah Johnson",
      email: "dr.sarah@hospital.com",
      specialty: "Neurology",
      canViewPricing: false,
      isActive: true
    },
    {
      id: "3",
      name: "Dr. Mohammed Hassan",
      email: "dr.mohammed@hospital.com",
      specialty: "Orthopedics",
      canViewPricing: true,
      isActive: false
    },
    {
      id: "4",
      name: "Dr. Fatima Al-Zahra",
      email: "dr.fatima@hospital.com",
      specialty: "Pediatrics",
      canViewPricing: false,
      isActive: true
    }
  ]);

  const [servicePricing, setServicePricing] = React.useState([]);
  const [pricingVersions, setPricingVersions] = React.useState([]);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    const savedPricing = localStorage.getItem('service_pricing');
    if (savedPricing) {
      setServicePricing(JSON.parse(savedPricing));
    }
    
    const savedVersions = localStorage.getItem('pricing_versions');
    if (savedVersions) {
      setPricingVersions(JSON.parse(savedVersions));
    }
  }, []);

  const toggleViewAccess = (doctorId: string) => {
    setDoctorAccess(prev => 
      prev.map(doctor => 
        doctor.id === doctorId 
          ? { ...doctor, canViewPricing: !doctor.canViewPricing }
          : doctor
      )
    );
    
    const doctor = doctorAccess.find(d => d.id === doctorId);
    toast({
      title: "Access Updated",
      description: `${doctor?.name}'s pricing access has been ${
        doctor?.canViewPricing ? 'removed' : 'granted'
      }`
    });
  };

  const toggleActiveStatus = (doctorId: string) => {
    setDoctorAccess(prev => 
      prev.map(doctor => 
        doctor.id === doctorId 
          ? { ...doctor, isActive: !doctor.isActive, canViewPricing: doctor.isActive ? false : doctor.canViewPricing }
          : doctor
      )
    );
    
    const doctor = doctorAccess.find(d => d.id === doctorId);
    toast({
      title: "Status Updated",
      description: `${doctor?.name} has been ${
        doctor?.isActive ? 'deactivated' : 'activated'
      }`
    });
  };

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Save current version as backup
        const currentVersion = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          version: `v${pricingVersions.length + 1}`,
          data: servicePricing,
          uploadedBy: 'Admin'
        };

        const newVersions = [...pricingVersions, currentVersion];
        setPricingVersions(newVersions);
        localStorage.setItem('pricing_versions', JSON.stringify(newVersions));

        // Update current pricing
        setServicePricing(jsonData);
        localStorage.setItem('service_pricing', JSON.stringify(jsonData));

        toast({
          title: "Success",
          description: `Service pricing updated with ${jsonData.length} items. Previous version saved as ${currentVersion.version}`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process Excel file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Hospital Name': 'King Fahad Hospital',
        'Service Description': 'Cardiac Surgery - Valve Replacement',
        'Specialty': 'Cardiology',
        'Price': 50000
      },
      {
        'Hospital Name': 'King Faisal Hospital',
        'Service Description': 'Orthopedic Surgery - Knee Replacement',
        'Specialty': 'Orthopedics',
        'Price': 35000
      }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(template);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Service Pricing Template');
    XLSX.writeFile(workbook, 'service_pricing_template.xlsx');
  };

  const downloadCurrentPricing = () => {
    if (servicePricing.length === 0) {
      toast({
        title: "No Data",
        description: "No pricing data available to download",
        variant: "destructive"
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(servicePricing);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Current Service Pricing');
    XLSX.writeFile(workbook, `service_pricing_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const grantAccessToAll = () => {
    setDoctorAccess(prev => 
      prev.map(doctor => 
        doctor.isActive ? { ...doctor, canViewPricing: true } : doctor
      )
    );
    
    toast({
      title: "Bulk Access Granted",
      description: "All active doctors can now view pricing"
    });
  };

  const revokeAccessFromAll = () => {
    setDoctorAccess(prev => 
      prev.map(doctor => ({ ...doctor, canViewPricing: false }))
    );
    
    toast({
      title: "Bulk Access Revoked",
      description: "Pricing access removed from all doctors"
    });
  };

  const activeDoctors = doctorAccess.filter(d => d.isActive);
  const doctorsWithAccess = doctorAccess.filter(d => d.canViewPricing && d.isActive);

  return (
    <div className="space-y-6">
      {/* Service Pricing Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Excel
            </Button>
            <Button onClick={downloadCurrentPricing} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Current Pricing
            </Button>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            className="hidden"
          />

          {/* Pricing Versions History */}
          {pricingVersions.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Pricing History</h3>
              <div className="space-y-2">
                {pricingVersions.map((version) => (
                  <div key={version.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <Badge variant="outline">{version.version}</Badge>
                      <span className="ml-2 text-sm text-gray-600">
                        {version.date} - {version.data.length} items
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">by {version.uploadedBy}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Pricing Preview */}
          {servicePricing.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Current Pricing Data ({servicePricing.length} items)</h3>
              <div className="max-h-48 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicePricing.slice(0, 10).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item['Hospital Name']}</TableCell>
                        <TableCell>{item['Service Description']}</TableCell>
                        <TableCell>{item['Specialty']}</TableCell>
                        <TableCell>{item['Price']}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {servicePricing.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2">
                    ... and {servicePricing.length - 10} more items
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing Access Control</CardTitle>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Total Doctors: {doctorAccess.length}</span>
            <span>Active: {activeDoctors.length}</span>
            <span>With Pricing Access: {doctorsWithAccess.length}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={grantAccessToAll} variant="outline" size="sm">
              Grant Access to All Active
            </Button>
            <Button onClick={revokeAccessFromAll} variant="outline" size="sm">
              Revoke All Access
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pricing Access</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctorAccess.map((doctor) => (
                <TableRow key={doctor.id} className={!doctor.isActive ? "opacity-50" : ""}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{doctor.name}</div>
                      <div className="text-sm text-gray-500">{doctor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doctor.specialty}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doctor.isActive ? "default" : "secondary"}>
                      {doctor.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {doctor.canViewPricing && doctor.isActive ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={doctor.canViewPricing && doctor.isActive ? "text-green-600" : "text-gray-400"}>
                        {doctor.canViewPricing && doctor.isActive ? "Can View" : "No Access"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor={`access-${doctor.id}`} className="text-xs">Access</Label>
                        <Switch
                          id={`access-${doctor.id}`}
                          checked={doctor.canViewPricing}
                          onCheckedChange={() => toggleViewAccess(doctor.id)}
                          disabled={!doctor.isActive}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Label htmlFor={`active-${doctor.id}`} className="text-xs">Active</Label>
                        <Switch
                          id={`active-${doctor.id}`}
                          checked={doctor.isActive}
                          onCheckedChange={() => toggleActiveStatus(doctor.id)}
                        />
                      </div>
                    </div>
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

export default ServicePricingAccess;
