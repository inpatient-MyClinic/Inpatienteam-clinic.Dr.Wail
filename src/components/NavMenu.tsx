
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Create Request", to: "/create-request" },
  { label: "My Requests", to: "/my-requests" },
  { label: "Analytics", to: "/analytics" },
  { label: "Settings & Directory", to: "/settings-directory" },
  { label: "Notifications & Logs", to: "/notifications-logs" },
];

export default function NavMenu() {
  const location = useLocation();
  return (
    <nav className="flex flex-wrap justify-center gap-4 mt-6 mb-8">
      {navItems.map(({ label, to }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2 rounded transition-colors font-medium ${
              isActive
                ? "bg-blue-800 text-white"
                : "bg-blue-100 hover:bg-blue-300 text-blue-800"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
