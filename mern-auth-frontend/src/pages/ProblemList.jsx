// src/pages/ProblemList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const PAGE_SIZE = 10;

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [userLevel, setUserLevel] = useState('Beginner');

  // Fetch user level (dummy logic, replace with real stats if available)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    // Example: fetch user stats and set level
    // setUserLevel('Intermediate');
    setUserLevel(user?.level || 'Beginner');
  }, []);

  const fetchProblems = async () => {
    let query = `?page=${page}&limit=${PAGE_SIZE}`;
    if (difficulty) query += `&difficulty=${difficulty}`;
    if (tag) query += `&tags=${encodeURIComponent(tag.trim().toLowerCase())}`;
    if (search) query += `&title=${encodeURIComponent(search)}`;
    try {
      const res = await axiosInstance.get(`/problems${query}`);
      console.log('✅ Problems loaded:', res.data);
      setProblems(res.data.problems || res.data);
      setTotal(res.data.total || res.data.length);
    } catch (err) {
      console.error('❌ Error fetching problems:', err);
    }
  };

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line
  }, [difficulty, tag, search, page]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">All Problems</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }} className="border px-3 py-2 rounded bg-white dark:bg-gray-900 dark:text-gray-100">
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <input value={tag} onChange={e => { setTag(e.target.value); setPage(1); }} placeholder="Filter by tag (e.g. Array)" className="border px-3 py-2 rounded bg-white dark:bg-gray-900 dark:text-gray-100" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name" className="border px-3 py-2 rounded bg-white dark:bg-gray-900 dark:text-gray-100" />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-300">Level:</span>
          <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200">{userLevel}</span>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full table-auto border border-gray-200 dark:border-gray-700">
          <thead className="bg-indigo-50 dark:bg-gray-800">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-200">Title</th>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-200">Difficulty</th>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-200">Tags</th>
            </tr>
          </thead>
          <tbody>
            {problems.filter(problem => problem.title && problem.title.trim() !== '').map(problem => (
              <tr key={problem._id} className="border-t hover:bg-indigo-50 dark:hover:bg-gray-800 transition dark:border-gray-700">
                <td className="p-3">
                  <Link to={`/problems/${problem._id}`} className="text-indigo-600 dark:text-indigo-300 hover:underline font-medium">
                    {problem.title}
                  </Link>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="p-3">
                  {problem.tags && problem.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.map((tag, idx) => (
                        <span key={idx} className="inline-block px-2 py-0.5 rounded bg-indigo-200 dark:bg-indigo-700 text-xs text-indigo-800 dark:text-indigo-100 font-semibold mr-1">{tag}</span>
                      ))}
                    </div>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50">Prev</button>
        <span className="text-gray-700 dark:text-gray-200">Page {page}</span>
        <button disabled={page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default ProblemList;
