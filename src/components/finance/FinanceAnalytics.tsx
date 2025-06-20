
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";

interface FinanceAnalyticsProps {
  totalPaid: number;
  totalNotPaid: number;
  totalAmount: string;
  paidAmount: string;
  unpaidAmount: string;
}

export default function FinanceAnalytics({
  totalPaid,
  totalNotPaid,
  totalAmount,
  paidAmount,
  unpaidAmount
}: FinanceAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requests Paid</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalPaid}</div>
          <p className="text-xs text-muted-foreground">
            Total Amount: {paidAmount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requests Not Paid</CardTitle>
          <Clock className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{totalNotPaid}</div>
          <p className="text-xs text-muted-foreground">
            Total Amount: {unpaidAmount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPaid + totalNotPaid}</div>
          <p className="text-xs text-muted-foreground">
            Total Amount: {totalAmount}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
