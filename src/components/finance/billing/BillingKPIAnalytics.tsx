
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface KPIData {
  hospital: string;
  statementToAgreement: number;
  agreementToVAT: number;
  vatToPayment: number;
  doctorPaymentDays: number;
}

const sampleKPIs: KPIData[] = [
  { hospital: 'King Fahad Hospital', statementToAgreement: 3, agreementToVAT: 2, vatToPayment: 35, doctorPaymentDays: 38 },
  { hospital: 'Saudi German Hospital', statementToAgreement: 7, agreementToVAT: 4, vatToPayment: 48, doctorPaymentDays: 50 },
  { hospital: 'Dr. Soliman Fakeeh Hospital', statementToAgreement: 4, agreementToVAT: 3, vatToPayment: 40, doctorPaymentDays: 42 },
];

const KPI_TARGETS = {
  statementToAgreement: 5,
  agreementToVAT: 5,
  vatToPayment: 42,
  doctorPaymentDays: 42,
};

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function BillingKPIAnalytics({ isAdmin = false }: { isAdmin?: boolean }) {
  const [monthFilter, setMonthFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [targets, setTargets] = useState(KPI_TARGETS);

  const hospitals = sampleKPIs.map(k => k.hospital);
  const filteredKPIs = sampleKPIs.filter(k => hospitalFilter === 'all' || k.hospital === hospitalFilter);

  const avgSTA = Math.round(filteredKPIs.reduce((s, k) => s + k.statementToAgreement, 0) / filteredKPIs.length);
  const avgATV = Math.round(filteredKPIs.reduce((s, k) => s + k.agreementToVAT, 0) / filteredKPIs.length);
  const avgVTP = Math.round(filteredKPIs.reduce((s, k) => s + k.vatToPayment, 0) / filteredKPIs.length);
  const avgDP = Math.round(filteredKPIs.reduce((s, k) => s + k.doctorPaymentDays, 0) / filteredKPIs.length);

  const kpiStatus = (value: number, target: number) => {
    if (value <= target) return { color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle className="w-4 h-4" />, label: 'On Track' };
    return { color: 'text-red-600', bg: 'bg-red-50', icon: <AlertTriangle className="w-4 h-4" />, label: 'Delayed' };
  };

  const kpiCards = [
    { title: 'Statement → Agreement', value: avgSTA, target: targets.statementToAgreement, unit: 'days' },
    { title: 'Agreement → VAT Invoice', value: avgATV, target: targets.agreementToVAT, unit: 'days' },
    { title: 'VAT Invoice → Payment', value: avgVTP, target: targets.vatToPayment, unit: 'days' },
    { title: 'Doctor Payment Processing', value: avgDP, target: targets.doctorPaymentDays, unit: 'days' },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">YTD</SelectItem>
            {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Hospital" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hospitals</SelectItem>
            {hospitals.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => {
          const status = kpiStatus(kpi.value, kpi.target);
          return (
            <Card key={i} className={status.bg}>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">{kpi.title}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${status.color}`}>{kpi.value}</span>
                  <span className="text-sm text-gray-500">{kpi.unit}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {status.icon}
                  <span className={`text-xs ${status.color}`}>Target: {kpi.target} {kpi.unit}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hospital Breakdown Table */}
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Hospital</TableHead>
              <TableHead className="text-center">Statement→Agreement</TableHead>
              <TableHead className="text-center">Agreement→VAT</TableHead>
              <TableHead className="text-center">VAT→Payment</TableHead>
              <TableHead className="text-center">Doctor Payment</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKPIs.map(kpi => {
              const hasDelay = kpi.statementToAgreement > targets.statementToAgreement ||
                kpi.vatToPayment > targets.vatToPayment;
              return (
                <TableRow key={kpi.hospital}>
                  <TableCell className="font-medium">{kpi.hospital}</TableCell>
                  <TableCell className="text-center">
                    <span className={kpi.statementToAgreement > targets.statementToAgreement ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {kpi.statementToAgreement}d
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={kpi.agreementToVAT > targets.agreementToVAT ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {kpi.agreementToVAT}d
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={kpi.vatToPayment > targets.vatToPayment ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {kpi.vatToPayment}d
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={kpi.doctorPaymentDays > targets.doctorPaymentDays ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {kpi.doctorPaymentDays}d
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {hasDelay ? (
                      <Badge className="bg-red-100 text-red-800">Delayed</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">On Track</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Admin KPI Settings */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              KPI Target Settings (Admin Only)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'statementToAgreement', label: 'Statement → Agreement (days)' },
                { key: 'agreementToVAT', label: 'Agreement → VAT (days)' },
                { key: 'vatToPayment', label: 'VAT → Payment (days)' },
                { key: 'doctorPaymentDays', label: 'Doctor Payment (days)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-gray-600">{label}</label>
                  <input
                    type="number"
                    value={targets[key as keyof typeof targets]}
                    onChange={e => setTargets(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="w-full border rounded p-2 text-sm mt-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
