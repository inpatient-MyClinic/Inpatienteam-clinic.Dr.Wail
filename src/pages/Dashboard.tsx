
import Footer from "@/components/Footer";

const Dashboard = () => (
  <div className="min-h-screen flex flex-col">
    <div className="flex flex-col items-center justify-center flex-1">
      <h1 className="text-3xl font-bold mb-4 text-blue-900">Dashboard</h1>
      <p className="text-gray-600">Role-based Dashboard page (content will depend on login/role)</p>
    </div>
    <Footer />
  </div>
);

export default Dashboard;
