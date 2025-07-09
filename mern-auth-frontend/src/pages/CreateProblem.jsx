import axiosInstance from '../api/axios';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateProblem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    difficulty: "Easy",
    tags: "",
  });
  const [testCases, setTestCases] = useState([
    { input: '', expectedOutput: '' }
  ]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.email !== "pjljyothi@gmail.com") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestCaseChange = (idx, field, value) => {
    setTestCases(prev => prev.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc));
  };

  const addTestCase = () => {
    setTestCases(prev => [...prev, { input: '', expectedOutput: '' }]);
  };

  const removeTestCase = (idx) => {
    setTestCases(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        testCases: testCases.filter(tc => tc.input && tc.expectedOutput)
      };
      await axiosInstance.post('/problems', payload, { headers: { Authorization: `Bearer ${token}` } });
      setMsg("Problem created successfully!");
      setFormData({
        title: "",
        description: "",
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        sampleInput: "",
        sampleOutput: "",
        difficulty: "Easy",
        tags: "",
      });
      setTestCases([{ input: '', expectedOutput: '' }]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create problem");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-8 transition-colors duration-500">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 transition-colors duration-500">Create a New Problem</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Input Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input Format</label>
            <textarea
              name="inputFormat"
              rows="2"
              value={formData.inputFormat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Output Format</label>
            <textarea
              name="outputFormat"
              rows="2"
              value={formData.outputFormat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Constraints</label>
            <textarea
              name="constraints"
              rows="2"
              value={formData.constraints}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Sample Input / Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Input</label>
              <textarea
                name="sampleInput"
                rows="2"
                value={formData.sampleInput}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Output</label>
              <textarea
                name="sampleOutput"
                rows="2"
                value={formData.sampleOutput}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          {/* Test Cases Section */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Test Cases</label>
            {testCases.map((tc, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 mb-3 items-start">
                <textarea
                  placeholder="Input"
                  value={tc.input}
                  onChange={e => handleTestCaseChange(idx, 'input', e.target.value)}
                  rows={2}
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  required
                />
                <textarea
                  placeholder="Expected Output"
                  value={tc.expectedOutput}
                  onChange={e => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                  rows={2}
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  required
                />
                <button type="button" onClick={() => removeTestCase(idx)} className="text-red-600 dark:text-red-400 font-bold px-2 py-1 hover:underline" disabled={testCases.length === 1}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addTestCase} className="mt-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded hover:bg-indigo-200 dark:hover:bg-indigo-700 font-semibold transition-colors">+ Add Test Case</button>
          </div>
          {/* Difficulty & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. Array, DP, String"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-indigo-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 dark:bg-indigo-700 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
            >
              Create Problem
            </button>
          </div>
          {/* Message Display */}
          {msg && <div className="mt-4 text-green-600 dark:text-green-400">{msg}</div>}
          {error && <div className="mt-4 text-red-600 dark:text-red-400">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default CreateProblem;
