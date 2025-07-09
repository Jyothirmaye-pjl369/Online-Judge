import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../api/axios';
import { useUser } from '../context/UserContext';

const languages = ['cpp', 'python', 'c'];

const codeTemplates = {
  python: `# Write your Python code here`,
  cpp: `// Write your C++ code here`,
  c: `// Write your C code here`
};

const API_BASE_URL = "http://localhost:5000";

const ProblemDetails = () => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [explanation, setExplanation] = useState('');
  const { refreshUser } = useUser();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/problems/${problemId}`);
        setProblem(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (code === '' && codeTemplates[language]) {
      setCode(codeTemplates[language]);
    }
  }, [language, code]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const now = new Date();
      const timestamp = now.toISOString();

      const res = await axiosInstance.post(
        '/submit',
        {
          problemId,
          code,
          language,
          testCases: problem.testCases,
          submittedAt: timestamp
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
      if (res.data.verdict === 'Accepted' || res.data.status === 'Accepted') {
        await refreshUser();
      }
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setRunLoading(true);
    setRunResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.post(
        '/submit/run',
        { code, language, input: customInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRunResult(res.data);
    } catch (err) {
      setRunResult({ error: err.response?.data?.error || 'Run failed' });
    } finally {
      setRunLoading(false);
    }
  };

  const handleExplain = async () => {
    setExplainLoading(true);
    setExplanation('');
    try {
      const res = await axiosInstance.post('/ai/explain', { code });
      setExplanation(res.data.explanation);
    } catch (err) {
      setExplanation('Failed to get explanation.');
    } finally {
      setExplainLoading(false);
    }
  };

  if (!problem) return <div className="p-4">Loading problem...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side: Problem Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-2 text-indigo-700 dark:text-indigo-300">{problem.title}</h1>
          <section className="mb-4">
            <h2 className="font-semibold text-lg mb-1 text-gray-800 dark:text-gray-200">Description</h2>
            <p className="text-gray-700 dark:text-gray-300">{problem.description}</p>
          </section>
          <section className="grid grid-cols-1 gap-2 mb-4">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Input Format</h3>
              <p className="ml-2 text-gray-600 dark:text-gray-300">{problem.inputFormat}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Output Format</h3>
              <p className="ml-2 text-gray-600 dark:text-gray-300">{problem.outputFormat}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Constraints</h3>
              <ul className="ml-4 list-disc text-gray-600 dark:text-gray-300">
                {problem.constraints?.split('\n').map((c, i) => <li key={i}>{c}</li>) || <li>No constraints specified.</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Sample Input</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">{problem.sampleInput}</pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Sample Output</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">{problem.sampleOutput}</pre>
            </div>
          </section>
        </div>

        {/* Right Side: Editor & Actions */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-inner mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
              <select
                className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-900 dark:text-gray-100"
                value={language}
                onChange={e => {
                  setLanguage(e.target.value);
                  setCode(codeTemplates[e.target.value]);
                }}>
                {languages.map(lang => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
              </select>
              <button onClick={handleRun} disabled={runLoading} className="bg-green-500 text-white px-5 py-2 rounded-lg font-semibold">{runLoading ? 'Running...' : 'Run'}</button>
              <button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold">{loading ? 'Submitting...' : 'Submit Code'}</button>
              <button onClick={handleExplain} disabled={explainLoading || !code} className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold">{explainLoading ? 'Explaining...' : 'Explain Code'}</button>
            </div>
            <textarea rows={12} className="w-full p-3 border rounded-lg font-mono bg-white dark:bg-gray-900 dark:text-gray-100" value={code} onChange={e => setCode(e.target.value)} />
          </div>

          {/* Custom Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Input</label>
            <textarea rows={2} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={customInput} onChange={e => setCustomInput(e.target.value)} />
          </div>

          {/* Run Result */}
          {runResult && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Run Output:</h2>
              {runResult.error ? (
                <pre className="text-red-500 mt-2">{runResult.error}</pre>
              ) : (
                <pre className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded">{runResult.output}</pre>
              )}
            </div>
          )}

          {/* Submission Result */}
          {result && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Result:</h2>
              <p className={
                result.verdict === 'Accepted'
                  ? 'text-green-600 font-bold'
                  : result.verdict === 'Runtime Error'
                  ? 'text-red-500 font-bold'
                  : result.verdict === 'Wrong Answer'
                  ? 'text-yellow-600 font-bold'
                  : 'text-red-600 font-bold'
              }>
                Verdict: {result.verdict}
              </p>
              {result.results && result.results.map((r, idx) => (
                <div key={idx} className="border p-2 mt-2 rounded bg-gray-50 dark:bg-gray-800">
                  <p><strong>Test {idx + 1}:</strong> {r.passed ? '✅ Passed' : '❌ Failed'}</p>
                  <p>Input: <code>{r.input}</code></p>
                  <p>Expected: <code>{r.expected}</code></p>
                  <p>Received: <code>{r.output}</code></p>
                </div>
              ))}
              {result.error && <pre className="text-red-500 mt-2">{result.error}</pre>}
            </div>
          )}

          {/* Explanation */}
          {explanation && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Code Explanation</h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-gray-900 dark:text-gray-100 whitespace-pre-line">{explanation}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetails;
