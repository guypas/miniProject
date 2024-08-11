import React, { useState } from 'react';
import UrlForm from './urlForm';
import UrlResult from './urlResult';

const API_KEY = "0416fc1f62bfb5dcf199f2eaab6e27cdf22975567b785c47e2b5be94fe9665b2";

export default function AppUrlChecker() {
  const [enteredUrl, setEnteredUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [theme, setTheme] = useState('light'); // Initial theme set to "light"

  const pollAnalysis = async (analysisId, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        method: 'GET',
        headers: {
          'x-apikey': API_KEY,
        },
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        if (analysisData.data.attributes.status === 'completed') {
          return analysisData;
        }
      }

      // Wait for a specified delay before trying again
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new Error('Analysis did not complete in time , try again');
  };

  const checkUrl = async (url) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Send POST request to VirusTotal to analyze the URL
      const response = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': API_KEY,
        },
        body: new URLSearchParams({ url }),
      });

      if (!response.ok) {
        throw new Error('Enter a valid URL');
      }

      // Parse the JSON response to get the analysis ID
      const data = await response.json();
      const analysisId = data.data.id;

      // Polling the analysis status
      const analysisData = await pollAnalysis(analysisId);

      // Check the result of the URL analysis
      const resultData = analysisData.data.attributes;
      const isSafe = resultData.stats.malicious === 0;

      setResult({ isComplete: true, isSafe });
      setEnteredUrl(url); // Store the entered URL

    } catch (error) {
      setError(error.message || 'Failed to check URL');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const changeStates = () => {
    setError(null);
    setResult(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div>
      <button onClick={toggleTheme} style={{ marginBottom: '20px' }}>
        Change Theme
      </button>
      <h1 className='title'>URL Checker</h1>
      <UrlForm changeStates={changeStates} onSubmit={checkUrl} loading={loading} />
      {error && <p>Error: {error}</p>}
      {result && <UrlResult enteredUrl={enteredUrl} result={result} />}
    </div>
  );
}