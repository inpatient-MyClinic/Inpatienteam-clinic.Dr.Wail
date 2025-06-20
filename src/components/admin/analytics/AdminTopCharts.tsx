
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopData {
  name: string;
  count: number;
}

interface AdminTopChartsProps {
  top5Specialties: TopData[];
  top5Hospitals: TopData[];
  top5Doctors: TopData[];
}

export default function AdminTopCharts({ top5Specialties, top5Hospitals, top5Doctors }: AdminTopChartsProps) {
  const ListCard = ({ title, data, color }: { title: string; data: TopData[]; color: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{item.name}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${color}`}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ListCard title="Top 5 Specialties" data={top5Specialties} color="bg-blue-600" />
      <ListCard title="Top 5 Hospitals" data={top5Hospitals} color="bg-green-600" />
      <ListCard title="Top 5 Doctors" data={top5Doctors} color="bg-yellow-600" />
    </div>
  );
}
