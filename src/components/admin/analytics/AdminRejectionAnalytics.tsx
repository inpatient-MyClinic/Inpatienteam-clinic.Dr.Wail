
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminRejectionAnalyticsProps {
  data: any[];
}

interface SpecialtyStats {
  total: number;
  rejected: number;
  services: Record<string, ServiceStats>;
}

interface ServiceStats {
  total: number;
  rejected: number;
}

interface DoctorStats {
  total: number;
  rejected: number;
}

interface SpecialtyRejectionRate {
  specialty: string;
  total: number;
  rejected: number;
  rejectionRate: string;
}

interface ServiceRejectionRate {
  service: string;
  total: number;
  rejected: number;
  rejectionRate: string;
}

interface DoctorRejectionRate {
  doctor: string;
  total: number;
  rejected: number;
  rejectionRate: string;
}

export default function AdminRejectionAnalytics({ data }: AdminRejectionAnalyticsProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  
  // Function to export data to Excel
  const exportToExcel = (exportData: any[], filename: string) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const columnWidths = [];
    const headers = Object.keys(exportData[0] || {});
    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...exportData.map(row => String(row[header] || '').length)
      );
      columnWidths[index] = { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, filename);
  };
  
  // Function to get doctor's rejected requests
  const getDoctorRejectedRequests = (doctorName: string) => {
    return data.filter(item => 
      item.user === doctorName && 
      (item.status === 'Rejected' || item.status === 'Cancelled')
    );
  };
  // Calculate specialty rejection rates
  const specialtyStats = data.reduce((acc, item) => {
    const specialty = item.specialty || 'Unknown';
    if (!acc[specialty]) {
      acc[specialty] = { total: 0, rejected: 0, services: {} };
    }
    acc[specialty].total += 1;
    if (item.status === 'Rejected' || item.status === 'Cancelled') {
      acc[specialty].rejected += 1;
    }
    
    // Track services within specialty
    const service = item.serviceDescription || 'General';
    if (!acc[specialty].services[service]) {
      acc[specialty].services[service] = { total: 0, rejected: 0 };
    }
    acc[specialty].services[service].total += 1;
    if (item.status === 'Rejected' || item.status === 'Cancelled') {
      acc[specialty].services[service].rejected += 1;
    }
    
    return acc;
  }, {} as Record<string, SpecialtyStats>);

  // Get specialty rejection rates
  const specialtyRejectionRates: SpecialtyRejectionRate[] = Object.entries(specialtyStats)
    .map(([specialty, stats]: [string, SpecialtyStats]) => ({
      specialty,
      total: stats.total,
      rejected: stats.rejected,
      rejectionRate: ((stats.rejected / stats.total) * 100).toFixed(1)
    }))
    .sort((a, b) => parseFloat(b.rejectionRate) - parseFloat(a.rejectionRate));

  // Get service rejection rates for high-rejection specialties
  const getServiceRejectionRates = (specialty: string): ServiceRejectionRate[] => {
    const services = specialtyStats[specialty]?.services || {};
    return Object.entries(services)
      .map(([service, stats]: [string, ServiceStats]) => ({
        service,
        total: stats.total,
        rejected: stats.rejected,
        rejectionRate: ((stats.rejected / stats.total) * 100).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.rejectionRate) - parseFloat(a.rejectionRate));
  };

  // Get top 3 doctors with highest rejection rates
  const doctorStats = data.reduce((acc, item) => {
    const doctor = item.user || 'Unknown';
    if (!acc[doctor]) {
      acc[doctor] = { total: 0, rejected: 0 };
    }
    acc[doctor].total += 1;
    if (item.status === 'Rejected' || item.status === 'Cancelled') {
      acc[doctor].rejected += 1;
    }
    return acc;
  }, {} as Record<string, DoctorStats>);

  const top3DoctorsRejection: DoctorRejectionRate[] = Object.entries(doctorStats)
    .map(([doctor, stats]: [string, DoctorStats]) => ({
      doctor,
      total: stats.total,
      rejected: stats.rejected,
      rejectionRate: ((stats.rejected / stats.total) * 100).toFixed(1)
    }))
    .sort((a, b) => parseFloat(b.rejectionRate) - parseFloat(a.rejectionRate))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Specialty Rejection Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Specialty Rejection Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Specialty</TableHead>
                <TableHead className="text-center">Total Cases</TableHead>
                <TableHead className="text-center">Rejected Cases</TableHead>
                <TableHead className="text-center">Rejection Rate</TableHead>
                <TableHead>Top Rejected Services</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialtyRejectionRates.map((item) => {
                const topServices = getServiceRejectionRates(item.specialty).slice(0, 2);
                return (
                  <TableRow key={item.specialty}>
                    <TableCell className="font-medium">{item.specialty}</TableCell>
                    <TableCell className="text-center">{item.total}</TableCell>
                    <TableCell className="text-center">{item.rejected}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={parseFloat(item.rejectionRate) > 20 ? "destructive" : "secondary"}>
                        {item.rejectionRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {topServices.map((service) => (
                          <div key={service.service} className="text-sm">
                            {service.service}: <span className="font-medium text-red-600">{service.rejectionRate}%</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top 3 Doctors with High Rejection Rates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-orange-600">Top 3 Doctors - Highest Rejection Rates</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => {
              const exportData = top3DoctorsRejection.map((doctor, index) => ({
                'Rank': index + 1,
                'Doctor': doctor.doctor,
                'Total Cases': doctor.total,
                'Rejected Cases': doctor.rejected,
                'Rejection Rate': `${doctor.rejectionRate}%`
              }));
              exportToExcel(exportData, 'top_3_doctors_rejection_rates.xlsx');
            }}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead className="text-center">Total Cases</TableHead>
                <TableHead className="text-center">Rejected Cases</TableHead>
                <TableHead className="text-center">Rejection Rate</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top3DoctorsRejection.map((doctor, index) => (
                <TableRow key={doctor.doctor}>
                  <TableCell>
                    <Badge variant={index === 0 ? "destructive" : index === 1 ? "secondary" : "outline"}>
                      #{index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{doctor.doctor}</TableCell>
                  <TableCell className="text-center">{doctor.total}</TableCell>
                  <TableCell className="text-center">{doctor.rejected}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="destructive">{doctor.rejectionRate}%</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Requests
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Rejected Requests for {doctor.doctor}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                              Total rejected/cancelled requests: {doctor.rejected}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const rejectedRequests = getDoctorRejectedRequests(doctor.doctor);
                                const exportData = rejectedRequests.map(req => ({
                                  'Request ID': req.id,
                                  'Patient Name': req.patientName || 'N/A',
                                  'Service Description': req.serviceDescription || req.description,
                                  'Hospital': req.hospital,
                                  'Status': req.status,
                                  'Specialty': req.specialty,
                                  'Date': req.date || req.createdAt,
                                  'Rejection Reason': req.rejectionReason || 'Not specified'
                                }));
                                exportToExcel(exportData, `${doctor.doctor}_rejected_requests.xlsx`);
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Request ID</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getDoctorRejectedRequests(doctor.doctor).map((request, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{request.id}</TableCell>
                                  <TableCell>{request.patientName || 'N/A'}</TableCell>
                                  <TableCell>{request.serviceDescription || request.description}</TableCell>
                                  <TableCell>
                                    <Badge variant="destructive">{request.status}</Badge>
                                  </TableCell>
                                  <TableCell>{request.date || request.createdAt}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
