
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, X } from "lucide-react";

interface UserFiltersProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  onExport: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const UserFilters = ({
  searchFilter,
  setSearchFilter,
  onExport,
  hasActiveFilters,
  onClearFilters,
  filteredCount,
  totalCount
}: UserFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search & Export</CardTitle>
        <CardDescription>Search users and export data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-end mb-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Users</Label>
            <Input
              id="search"
              placeholder="Search by email or category..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <Button onClick={onExport} variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredCount} of {totalCount} users
            </div>
            <Button 
              variant="ghost" 
              onClick={onClearFilters}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserFilters;
