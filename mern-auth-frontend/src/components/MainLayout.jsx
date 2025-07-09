import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/problems", label: "Problems" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/submission-history", label: "Submissions" },
  { to: "/create-problem", label: "Create" },
];

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col">
      {/* Header/Navbar */}
      <header className="w-full bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">CodeJudge</Link>
          <nav className="space-x-2 text-sm font-medium flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1 rounded-lg transition hover:bg-indigo-50 hover:text-indigo-700 ${location.pathname.startsWith(link.to) ? "bg-indigo-100 text-indigo-700" : "text-gray-700"}`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <span className="ml-4 text-gray-500 text-xs">{user.username || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="ml-4 text-indigo-600 hover:underline">Login</Link>
                <Link to="/register" className="ml-2 text-indigo-600 hover:underline">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">{children}</main>
      {/* Footer */}
      <footer className="w-full bg-white shadow-inner py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CodeJudge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
