import React, { useState } from 'react';
import UrlForm from './urlForm'
import UrlResult from './urlResult'

const API_KEY = process.env.REACT_APP_VIRUSTOTAL_API_KEY; 

export default function AppUrlChecker() {

    const [enteredUrl, setEnteredUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [theme, setTheme] = useState('light'); // Initial theme set to "light"
    //console.log(API_KEY);


    const checkUrl = async (url) => {
      try {
        setLoading(true);
        setError(null);
  
        // Send POST request to VirusTotal to analyze the URL
        const response = await fetch('https://www.virustotal.com/api/v3/urls', {
          method: 'POST',
          headers: {
            'x-apikey': API_KEY,
          },
          body: new URLSearchParams({ url }),
        });
  
        if (!response.ok) {
          throw new Error('enter a valid url');
        }
  
        // Parse the JSON response to get the analysis ID
        const data = await response.json();
        const analysisId = data.data.id;
  
        // Wait for a short period to allow VirusTotal to analyze the URL
        await new Promise(resolve => setTimeout(resolve, 5000));
  
        // Fetch the analysis results using the analysis ID
        const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
          method: 'GET',
          headers: {
            'x-apikey': API_KEY,
          },
        });
  
        if (!analysisResponse.ok) {
          throw new Error('Failed to retrieve analysis results');
        }
  
        // Parse the analysis results
        const analysisData = await analysisResponse.json();
        console.log('Full analysis data:', analysisData); // Log the full response to understand its structure
  
        // Log specific parts to understand the structure better
        console.log('Data:', analysisData.data);
        console.log('Attributes:', analysisData.data.attributes);
        console.log('Last analysis stats:', analysisData.data.attributes?.last_analysis_stats);
  
        // Check the result of the URL analysis
        const resultData = analysisData.data.attributes;
        const isComplete = resultData.status === "completed";
        const isSafe = resultData.stats.malicious === 0;
        //const message = resultData.stats.toString();
        setResult({isComplete, isSafe });
        
  
        setEnteredUrl(url); // Store the entered URL
  
      } catch (error) {
        setError(error.message || 'Failed to check URL');
      } finally {
        setLoading(false);
      }
    };

    const changeStates =  () => {
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
  )
}
