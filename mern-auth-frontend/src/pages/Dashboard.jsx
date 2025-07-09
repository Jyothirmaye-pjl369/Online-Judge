import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import { useUser } from '../context/UserContext';

const Dashboard = () => {
  const { user } = useUser();
  const userId = user?._id || user?.id;
  const [userStats, setUserStats] = useState({
    solved: 0,
    attempted: 0,
    accuracy: 0,
    rank: null,
    username: user?.username || user?.email || '',
    email: user?.email || '',
    bio: user?.bio || '',
    role: user?.role || 'user',
  });
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const submissionsRes = await axiosInstance.get(
          `/submissions/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const submissions = submissionsRes.data;
        const attempted = submissions.length;
        const solvedSet = new Set();
        submissions.forEach((s) => {
          if (s.status === 'Accepted') solvedSet.add(s.problem?._id || s.problem);
        });
        const solved = solvedSet.size;
        const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
        const leaderboardRes = await axiosInstance.get('/leaderboard/top-users');
        const leaderboard = leaderboardRes.data;
        let rank = null;
        leaderboard.forEach((entry, idx) => {
          if (String(entry.userId) === String(userId)) rank = idx + 1;
        });
        setUserStats({
          solved,
          attempted,
          accuracy,
          rank,
          username: user.username || user.email,
          email: user.email,
          bio: user.bio || '',
          role: user.role || 'user',
        });
      } catch (err) {
        setUserStats((prev) => ({ ...prev, username: user?.username || user?.email || '' }));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId, user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put("/auth/profile", { bio: editBio }, { headers: { Authorization: `Bearer ${token}` } });
      setUserStats((prev) => ({ ...prev, bio: editBio }));
      setShowProfile(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Profile Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-500">
              Welcome, {userStats.username}{" "}
              {userStats.role === "admin" && (
                <span className="ml-2 px-2 py-1 bg-yellow-400 text-xs rounded">ADMIN</span>
              )}
              👋
            </h2>
            <p className="text-gray-500 dark:text-gray-300 mt-1 transition-colors duration-500">{userStats.email}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-500">{userStats.bio}</p>
            <p className="text-gray-500 dark:text-gray-300 mt-1 transition-colors duration-500">Track your progress and explore coding challenges.</p>
            <button
              onClick={() => setShowProfile(true)}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-700 transition-colors duration-300"
            >
              Edit Profile
            </button>
          </div>
        </div>
        {showProfile && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm relative transition-colors duration-500">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => setShowProfile(false)}
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">Edit Profile</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-400 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500"
                  rows={3}
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-700 transition-colors duration-300"
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 transition-colors duration-500">
            <p className="text-sm text-gray-500 dark:text-gray-300">Solved Problems</p>
            <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{userStats.solved}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 transition-colors duration-500">
            <p className="text-sm text-gray-500 dark:text-gray-300">Attempted</p>
            <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{userStats.attempted}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 transition-colors duration-500">
            <p className="text-sm text-gray-500 dark:text-gray-300">Accuracy</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{userStats.accuracy}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 transition-colors duration-500">
            <p className="text-sm text-gray-500 dark:text-gray-300">Your Rank</p>
            <p className="text-2xl font-semibold text-pink-600 dark:text-pink-400">
              {userStats.rank ? `#${userStats.rank}` : "-"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/problems"
            className="bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-700 p-6 flex flex-col justify-between transition-colors duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">Solve New Problems</h3>
            <p className="text-sm text-indigo-100 dark:text-indigo-200">Browse and solve algorithm challenges.</p>
          </Link>

          <Link
            to="/create-problem"
            className="bg-green-600 text-white rounded-xl shadow hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-700 p-6 flex flex-col justify-between transition-colors duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">Create a Problem</h3>
            <p className="text-sm text-green-100 dark:text-green-200">Contribute your own coding questions.</p>
          </Link>

          <Link
            to="/leaderboard"
            className="bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500 p-6 flex flex-col justify-between transition-colors duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">View Leaderboard</h3>
            <p className="text-sm text-yellow-100 dark:text-yellow-200">See how you rank among others.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
