import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axiosInstance.get("/leaderboard/top-users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">🏆 Leaderboard</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-white">Rank</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-white">Username</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-white">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 dark:text-white">Problems Solved</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-600 dark:text-gray-300">
                    No submissions found
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.userId} className="border-b dark:border-gray-700">
                    <td className="px-4 py-2 font-bold text-indigo-600 dark:text-indigo-400">#{idx + 1}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-white">{user.username}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300 text-sm">{user.email}</td>
                    <td className="px-4 py-2 font-semibold text-green-600 dark:text-green-400">{user.problemsSolved}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
