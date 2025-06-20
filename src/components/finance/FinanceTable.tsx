
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";

interface Transaction {
  id: string;
  patient: string;
  amount: string;
  status: string;
  date: string;
  description: string;
}

interface FinanceTableProps {
  transactions: Transaction[];
  onViewTransaction: (id: string) => void;
  onEditTransaction: (id: string) => void;
}

export default function FinanceTable({
  transactions,
  onViewTransaction,
  onEditTransaction
}: FinanceTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Overdue":
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
            <TableHead>Patient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{transaction.patient}</TableCell>
              <TableCell className="font-semibold text-green-600">{transaction.amount}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">{transaction.date}</TableCell>
              <TableCell className="text-gray-600">{transaction.description}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewTransaction(transaction.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditTransaction(transaction.id)}
                  >
                    <Edit className="w-4 h-4" />
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
