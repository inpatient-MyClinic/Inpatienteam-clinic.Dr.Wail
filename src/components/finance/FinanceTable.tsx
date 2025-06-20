
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface Transaction {
  id: string;
  patientName: string;
  mrn: string;
  hospital: string;
  doctor: string;
  service: string;
  amount: string;
  status: string;
  date: string;
}

interface FinanceTableProps {
  transactions: Transaction[];
  onUpdatePaymentStatus: (id: string, isPaid: boolean) => void;
}

export default function FinanceTable({
  transactions,
  onUpdatePaymentStatus
}: FinanceTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Delay Payment":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Financial Transactions</h2>
        <p className="text-sm text-gray-600">Showing {transactions.length} transactions</p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>MRN</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{transaction.patientName}</TableCell>
              <TableCell className="text-gray-600">{transaction.mrn}</TableCell>
              <TableCell className="text-gray-600">{transaction.id}</TableCell>
              <TableCell className="text-gray-600">{transaction.hospital}</TableCell>
              <TableCell className="text-gray-600">{transaction.doctor}</TableCell>
              <TableCell className="text-gray-600">{transaction.service}</TableCell>
              <TableCell className="font-semibold text-green-600">{transaction.amount}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">{transaction.date}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdatePaymentStatus(transaction.id, true)}
                    className="text-green-600 hover:bg-green-50"
                    disabled={transaction.status === "Paid"}
                  >
                    <Check className="w-4 h-4" />
                    Paid
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdatePaymentStatus(transaction.id, false)}
                    className="text-red-600 hover:bg-red-50"
                    disabled={transaction.status !== "Paid"}
                  >
                    <X className="w-4 h-4" />
                    Not Paid
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
