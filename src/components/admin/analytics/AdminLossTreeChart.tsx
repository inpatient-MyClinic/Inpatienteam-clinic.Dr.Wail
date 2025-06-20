
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LossTreeData {
  stage: string;
  count: number;
  percentage: number;
}

interface AdminLossTreeChartProps {
  lossTreeData: LossTreeData[];
}

export default function AdminLossTreeChart({ lossTreeData }: AdminLossTreeChartProps) {
  const DelayBreakdown = ({ title, count }: { title: string; count: number }) => (
    <div className="flex-1 p-4 border rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-2 text-center">{title}</h4>
      <p className="text-2xl font-bold text-blue-600 mb-3 text-center">{count}</p>
      <div className="space-y-2">
        {["doctor", "insurance", "hospital", "patient"].map(cause => {
          // Simulate some distribution for demo purposes
          const simulatedCount = Math.floor(count * Math.random() * 0.3);
          return (
            <div key={cause} className="flex items-center text-sm">
              <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                {simulatedCount}
              </span>
              <span className="capitalize">{cause}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loss Tree Analysis</CardTitle>
        <CardDescription>Breakdown of delay causes by status category</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        {lossTreeData.map((item) => (
          <DelayBreakdown key={item.stage} title={item.stage} count={item.count} />
        ))}
      </CardContent>
    </Card>
  );
}
