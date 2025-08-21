import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { X } from 'lucide-react';

export default function UnifiedFilters() {
  const { filters, updateFilters, clearFilters, allUsers, currentUser } = useUnifiedData();

  const specialties = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
    'Radiology', 'Surgery', 'Urology', 'Other'
  ];

  const hospitals = ['KFHU', 'KFH', 'ARAMCO', 'NGH', 'KFMC', 'KFSH'];
  const statuses = ['pending', 'in-progress', 'scheduled', 'completed', 'cancelled', 'rejected', 'postponed', 'privilege'];

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {/* Date Range */}
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
            />
          </div>

          {/* Hospital Filter */}
          <div>
            <Label>Hospital</Label>
            <Select
              value={filters.hospital || ''}
              onValueChange={(value) => updateFilters({ hospital: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Hospitals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hospitals</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialty Filter */}
          <div>
            <Label>Specialty</Label>
            <Select
              value={filters.specialty || ''}
              onValueChange={(value) => updateFilters({ specialty: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label>Status</Label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => updateFilters({ status: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To Filter (Admin only) */}
          {currentUser?.role === 'admin' && (
            <div>
              <Label>Assigned To</Label>
              <Select
                value={filters.assignedTo || ''}
                onValueChange={(value) => updateFilters({ assignedTo: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {allUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.startDate && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1">
                From: {filters.startDate}
                <button 
                  onClick={() => updateFilters({ startDate: undefined })}
                  className="hover:bg-primary/20 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.endDate && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1">
                To: {filters.endDate}
                <button 
                  onClick={() => updateFilters({ endDate: undefined })}
                  className="hover:bg-primary/20 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.hospital && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1">
                Hospital: {filters.hospital}
                <button 
                  onClick={() => updateFilters({ hospital: undefined })}
                  className="hover:bg-primary/20 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.specialty && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1">
                Specialty: {filters.specialty}
                <button 
                  onClick={() => updateFilters({ specialty: undefined })}
                  className="hover:bg-primary/20 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.status && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1">
                Status: {filters.status}
                <button 
                  onClick={() => updateFilters({ status: undefined })}
                  className="hover:bg-primary/20 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}