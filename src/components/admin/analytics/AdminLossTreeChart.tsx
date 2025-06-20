
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LossTreeData {
  stage: string;
  count: number;
  percentage: number;
}

interface AdminLossTreeChartProps {
  lossTreeData: LossTreeData[];
}

export default function AdminLossTreeChart({ lossTreeData }: AdminLossTreeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loss Tree Analysis</CardTitle>
        <CardDescription>Request flow through different stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lossTreeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
            <Line type="monotone" dataKey="percentage" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-2">
          {lossTreeData.map((item, index) => (
            <Badge key={index} variant="outline">
              {item.stage}: {item.count} ({item.percentage.toFixed(1)}%)
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
