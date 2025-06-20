
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface StatusData {
  name: string;
  value: number;
}

interface AdminStatusDistributionProps {
  statusData: StatusData[];
  colors: string[];
}

export default function AdminStatusDistribution({ statusData, colors }: AdminStatusDistributionProps) {
  const total = statusData.reduce((sum, item) => sum + item.value, 0);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0";
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">Count: {data.value}</p>
          <p className="text-green-600">Percentage: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ name, value }: any) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
    return `${name} (${percentage}%)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Status breakdown list */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {statusData.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.value}</div>
                  <div className="text-sm text-gray-600">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
