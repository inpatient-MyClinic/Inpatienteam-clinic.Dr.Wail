
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { servicesBySpecialty } from "@/data/medicalData";
import { useToast } from "@/hooks/use-toast";

const hospitals = [
  "King Fahad Hospital",
  "King Faisal Hospital", 
  "King Abdulaziz Hospital",
  "Prince Sultan Hospital",
  "King Khalid Hospital",
  "King Saud Hospital",
  "National Guard Hospital",
  "Specialized Hospital"
];

const ServicePricingTable = () => {
  const { toast } = useToast();
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [pricing, setPricing] = useState<{[key: string]: {[hospital: string]: number}}>({});

  const handlePriceChange = (service: string, hospital: string, price: string) => {
    setPricing(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [hospital]: parseFloat(price) || 0
      }
    }));
  };

  const savePricing = () => {
    toast({
      title: "Success",
      description: "Pricing updated successfully"
    });
  };

  const availableServices = selectedSpecialty ? servicesBySpecialty[selectedSpecialty] || [] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Pricing by Hospital</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Specialty</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(servicesBySpecialty).map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedSpecialty && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Description</TableHead>
                  {hospitals.map(hospital => (
                    <TableHead key={hospital}>{hospital}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableServices.map(service => (
                  <TableRow key={service}>
                    <TableCell className="font-medium">{service}</TableCell>
                    {hospitals.map(hospital => (
                      <TableCell key={hospital}>
                        <Input
                          type="number"
                          placeholder="0"
                          value={pricing[service]?.[hospital] || ""}
                          onChange={(e) => handlePriceChange(service, hospital, e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Button onClick={savePricing} className="mt-4">
          Save Pricing
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServicePricingTable;
