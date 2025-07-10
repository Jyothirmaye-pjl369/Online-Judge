import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const ExplainCodeButton = ({ code }) => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    setExplanation('');
    try {
      const res = await axiosInstance.post('/ai/explain', { code });
      setExplanation(res.data.explanation);
    } catch (err) {
      setExplanation('Failed to get explanation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleExplain}
        disabled={loading || !code}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? 'Explaining...' : 'Explain Code'}
      </button>
      {explanation && (
        <div className="mt-2 p-2 bg-gray-100 rounded">
          <strong>Explanation:</strong>
          <div>{explanation}</div>
        </div>
      )}
    </div>
  );
};

export default ExplainCodeButton;