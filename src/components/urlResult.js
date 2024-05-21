import React from 'react'

export default function UrlResult({ enteredUrl, result }) {
  if(result.isComplete){
    return (
      <div className="result-container">
        <p className={result.isSafe ? 'safe' : 'malicious'}>
          {result.isSafe ? 'URL is safe' : 'URL is malicious'}
        </p>
        <p>URL entered: {enteredUrl}</p>
      </div>
    )
} else{
    return (
      <div>
        please try again
      </div>
    )
}
}
