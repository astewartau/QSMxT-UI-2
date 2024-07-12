import React, { useState } from 'react';

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
      <pre>{log}</pre>
    </div>
  );
};

export default ProcessSection;
