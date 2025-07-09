import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/problems", label: "Problems" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/dashboard", label: "Dashboard" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Listen for login/logout/register changes in localStorage
  useEffect(() => {
    const syncUser = () => setUser(JSON.parse(localStorage.getItem("user")));
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // Also update user state on route change (SPA navigation)
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 tracking-tight">
          CodeJudge
        </Link>
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors duration-150 px-2 py-1 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-gray-800 dark:hover:text-indigo-300 ${
                location.pathname === link.to ? "text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-gray-800" : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setDark((d) => !d)}
            className="ml-2 px-2 py-1 rounded text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "🌙" : "☀️"}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="ml-4 text-xs text-gray-500 dark:text-gray-300 hover:underline">
                {user.username || user.email}
                {user.role === 'admin' && <span className="ml-2 px-2 py-1 bg-yellow-400 text-xs rounded">ADMIN</span>}
              </Link>
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline text-sm ml-4">
                Login
              </Link>
              <Link to="/register" className="ml-2 text-indigo-600 font-semibold hover:underline text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
