import React, { useState } from 'react';
import axios from 'axios';

const ProcessSection = ({ title, inputLabel, outputLabel, onSubmit, log, children }) => {
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [eventSource, setEventSource] = useState(null);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleOutputChange = (event) => {
    setOutputValue(event.target.value);
  };

  const handleSubmit = () => {
    if (eventSource) {
      eventSource.close();
    }
    onSubmit(inputValue, outputValue, setEventSource);
  };

  const handleStop = () => {
    axios.post('http://localhost:5000/stop-process')
      .then(response => {
        console.log(response.data);
        if (eventSource) {
          eventSource.close();
        }
      })
      .catch(error => {
        console.error('Error stopping process:', error);
      });
  };

  return (
    <div>
      <h1>{title}</h1>
      <label>
        {inputLabel}:
        <input 
          type="text" 
          placeholder={`Enter ${inputLabel.toLowerCase()}`} 
          value={inputValue} 
          onChange={handleInputChange} 
        />
      </label>
      <label>
        {outputLabel}:
        <input 
          type="text" 
          placeholder={`Enter ${outputLabel.toLowerCase()}`} 
          value={outputValue} 
          onChange={handleOutputChange} 
        />
      </label>
      {children}
      <button onClick={handleSubmit}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <pre>{log}</pre>
    </div>
  );
};

export default ProcessSection;
