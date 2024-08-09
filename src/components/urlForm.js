import React from 'react';
import { useRef } from 'react';

export default function UrlForm({changeStates, onSubmit, loading }) {

   
    const inputUrl = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();

        const currentUrl = inputUrl.current.value;

        
          onSubmit(currentUrl);
        };

  return (
    <div className="form-container">
        <input ref={inputUrl} type="text" placeholder="Enter URL" />
        <button disabled={loading} onClick={handleSubmit}>{loading ? 'Loading...' : 'Check Now!'} </button>
      {/* {!isValidUrl && <p className="error-message">Please enter a valid URL</p>}  */}
    </div>
  )
}
