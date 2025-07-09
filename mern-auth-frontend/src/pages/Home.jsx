import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-white dark:from-gray-900 dark:via-indigo-900 dark:to-gray-800 flex flex-col transition-colors duration-500">
      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center text-center px-6 py-16 relative overflow-hidden">
        {/* Hero Illustration */}
        <img
          src="/hero-coding.svg"
          alt="Coding Hero"
          className="hidden md:block absolute left-10 top-1/2 -translate-y-1/2 w-56 h-56 pointer-events-none select-none animate-float"
          style={{ zIndex: 0 }}
        />
        <div className="max-w-2xl relative z-10">
          <span className="block text-sm font-semibold text-indigo-500 mb-2 tracking-wide">
            India's Most Trusted Coding Platform
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6 transition-colors duration-500">
            Practice. Compete. Improve.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-500">
            Welcome to{" "}
            <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
              CodeJudge
            </span>{" "}
            – your platform to solve coding problems, test your skills, and climb
            the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/problems"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition transform hover:scale-105 shadow"
            >
              Solve Problems
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-200 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900 transition transform hover:scale-105 shadow"
            >
              Join Now
            </Link>
          </div>
        </div>
        {/* Subtle animated particles (optional, simple SVG circles) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none animate-pulse"
          style={{ zIndex: 0 }}
        >
          <circle
            cx="20%"
            cy="30%"
            r="2"
            fill="#6366F1"
            fillOpacity="0.2"
          />
          <circle
            cx="80%"
            cy="60%"
            r="3"
            fill="#6366F1"
            fillOpacity="0.15"
          />
          <circle
            cx="60%"
            cy="80%"
            r="1.5"
            fill="#6366F1"
            fillOpacity="0.18"
          />
          <circle
            cx="40%"
            cy="20%"
            r="2.5"
            fill="#6366F1"
            fillOpacity="0.13"
          />
        </svg>
      </section>
      {/* Footer */}
      <footer className="w-full bg-white dark:bg-gray-900 shadow-inner py-4 mt-auto transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-500">
          © {new Date().getFullYear()} CodeJudge. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
