
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getProviderInfo, saveProviderInfo, ProviderInfo } from '@/utils/providerInfoUtils';
import { Save } from 'lucide-react';

export default function ProviderInfoSettings() {
  const { toast } = useToast();
  const [info, setInfo] = useState<ProviderInfo>(getProviderInfo());

  const handleSave = () => {
    saveProviderInfo(info);
    toast({ title: "Saved", description: "Provider information updated for all invoices" });
  };

  const fields: { key: keyof ProviderInfo; label: string; labelAr?: string }[] = [
    { key: 'name', label: "Provider's Name (EN)" },
    { key: 'nameAr', label: "Provider's Name (AR)" },
    { key: 'address', label: "Address (EN)" },
    { key: 'addressAr', label: "Address (AR)" },
    { key: 'vatNumber', label: "VAT Number" },
    { key: 'crNumber', label: "CR Number" },
    { key: 'shareCapital', label: "Share Capital" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider / VAT Information</CardTitle>
        <CardDescription>This information appears on all VAT invoices. Changes apply immediately to new invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                value={info[f.key]}
                onChange={e => setInfo(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />Save Provider Info
        </Button>
      </CardContent>
    </Card>
  );
}
