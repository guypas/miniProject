import React, { useState } from 'react';
import UrlForm from './urlForm';
import UrlResult from './urlResult';


const API_KEY = "0416fc1f62bfb5dcf199f2eaab6e27cdf22975567b785c47e2b5be94fe9665b2"; // the key we got from the site

export default function AppUrlChecker() {
  const [enteredUrl, setEnteredUrl] = useState(''); // for entering the url
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [theme, setTheme] = useState('light'); // for dark mode

  const pollAnalysis = async (analysisId, retries = 8, delay = 3000) => { // Function to poll VirusTotal API to check the status of the analysis
    for (let i = 0; i < retries; i++) {
      try {
        const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
          method: 'GET',
          headers: {
            'x-apikey': API_KEY,
          },
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          if (analysisData.data.attributes.status === 'completed') { // in case the procces completed
            return analysisData;
          }
        } else {
          throw new Error('Failed to fetch analysis results');
        }

      } catch (error) {
        console.error('Polling error:', error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));  // Wait for a specified delay before trying again
    }

    throw new Error('Analysis did not complete in time. Please try again.');
  };

  // Function to check the URL by sending a request to VirusTotal API
  const checkUrl = async (url) => {
    try {
      setLoading(true);
      setError(null); // clear previous errors
      setResult(null); // Clear previous results

      // Fetch the analysis results from VirusTotal API
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

      const data = await response.json();
      const analysisId = data.data.id;

      const analysisData = await pollAnalysis(analysisId);

      const resultData = analysisData.data.attributes;
      const isSafe = resultData.stats?.malicious === 0;

      setResult({ isComplete: true, isSafe });  // Set result state with analysis outcome
      setEnteredUrl(url);

    } catch (error) {
      setError(error.message || 'Failed to check URL');
      setResult(null);  // Clear result state on error
    } finally {
      setLoading(false); // Set loading to false once the process is complete
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
      {loading && (
        <div className="spinner"></div>
      )}
      {error && <p>Error: {error}</p>}
      {result && <UrlResult enteredUrl={enteredUrl} result={result} />}
    </div>
  );
}
