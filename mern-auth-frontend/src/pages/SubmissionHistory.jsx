import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';

const SubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = JSON.parse(localStorage.getItem('user')).id;
        const res = await axiosInstance.get(`/submissions/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Submission History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="table-auto w-full border border-gray-200">
            <thead>
              <tr className="bg-indigo-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Problem</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Language</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id} className="border-t hover:bg-indigo-50 transition">
                  <td className="px-4 py-2">{sub.problem?.title || 'N/A'}</td>
                  <td className={`px-4 py-2 font-semibold ${sub.status === 'Passed' ? 'text-green-600' : sub.status === 'Failed' ? 'text-red-600' : 'text-yellow-600'}`}>{sub.status}</td>
                  <td className="px-4 py-2">{sub.language}</td>
                  <td className="px-4 py-2">{new Date(sub.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;
