
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MessagingIcons from "@/components/messaging/MessagingIcons";

export default function FinanceDashboard() {
  const navigate = useNavigate();

  const financeStats = [
    { label: "Total Revenue", value: "₹45,230", icon: DollarSign, color: "bg-green-600" },
    { label: "Pending Payments", value: "₹12,450", icon: Clock, color: "bg-yellow-600" },
    { label: "Processed Today", value: "₹8,750", icon: CheckCircle, color: "bg-blue-600" },
    { label: "Overdue", value: "₹2,100", icon: AlertCircle, color: "bg-red-600" },
  ];

  const recentTransactions = [
    { patient: "Ahmed Hassan", amount: "₹3,500", status: "Paid", date: "2025-06-20" },
    { patient: "Sara Ali", amount: "₹2,200", status: "Pending", date: "2025-06-19" },
    { patient: "Omar Khalil", amount: "₹4,750", status: "Paid", date: "2025-06-19" },
    { patient: "Fatima Nour", amount: "₹1,850", status: "Processing", date: "2025-06-18" },
  ];

  // Calculate unread messages for finance role
  const unreadCount = 7; // This would typically come from a hook or API

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
              alt="My Clinic Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
              <p className="text-gray-600">Financial Management & Payments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <MessagingIcons currentUserRole="finance" unreadCount={unreadCount} />
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/role-selection")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Roles
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {financeStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Patient</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{transaction.patient}</td>
                    <td className="py-3 px-4 font-medium">{transaction.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
