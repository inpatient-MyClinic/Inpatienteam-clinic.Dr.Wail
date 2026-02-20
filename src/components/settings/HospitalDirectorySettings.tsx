
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getHospitalDirectory, saveHospitalDirectory, HospitalInfo } from '@/utils/providerInfoUtils';
import { Plus, Save, Trash2 } from 'lucide-react';

export default function HospitalDirectorySettings() {
  const { toast } = useToast();
  const [directory, setDirectory] = useState<Record<string, HospitalInfo>>(getHospitalDirectory());
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newVat, setNewVat] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    const updated = { ...directory, [newName.trim()]: { name: newName.trim(), address: newAddress, vatNumber: newVat } };
    setDirectory(updated);
    saveHospitalDirectory(updated);
    setNewName(''); setNewAddress(''); setNewVat('');
    toast({ title: "Added", description: `${newName} added to hospital directory` });
  };

  const handleRemove = (name: string) => {
    const updated = { ...directory };
    delete updated[name];
    setDirectory(updated);
    saveHospitalDirectory(updated);
    toast({ title: "Removed", description: `${name} removed from directory` });
  };

  const handleUpdate = (name: string, field: keyof HospitalInfo, value: string) => {
    const updated = { ...directory, [name]: { ...directory[name], [field]: value } };
    setDirectory(updated);
    saveHospitalDirectory(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Directory</CardTitle>
        <CardDescription>Hospital addresses and VAT numbers auto-populate on VAT invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4 items-end">
          <div className="flex-1">
            <Label>Hospital Name</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. King Fahad Hospital" />
          </div>
          <div className="flex-1">
            <Label>Address</Label>
            <Input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Hospital address" />
          </div>
          <div className="w-48">
            <Label>VAT Number</Label>
            <Input value={newVat} onChange={e => setNewVat(e.target.value)} placeholder="VAT #" />
          </div>
          <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </div>

        {Object.keys(directory).length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>VAT Number</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(directory).map(([name, info]) => (
                <TableRow key={name}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell>
                    <Input
                      value={info.address}
                      onChange={e => handleUpdate(name, 'address', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={info.vatNumber}
                      onChange={e => handleUpdate(name, 'vatNumber', e.target.value)}
                      className="h-8 font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => handleRemove(name)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
