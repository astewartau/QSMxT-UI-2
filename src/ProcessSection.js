import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './spinner.css'; // Make sure to import the CSS file for the spinner

const ProcessSection = ({ title, inputLabel, outputLabel, onSubmit, log, children, inputValue, setInputValue, outputValue, setOutputValue, isProcessRunning, setIsProcessRunning }) => {
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    if (eventSource) {
      console.log('EventSource initialized'); // Debug message
      eventSource.onmessage = (e) => {
        console.log('Event Source Message:', e.data); // Debug message
        if (e.data.includes('Process exited with code')) {
          console.log('Process finished or error occurred, closing Event Source'); // Debug message
          setIsProcessRunning(false);
          if (eventSource) {
            eventSource.close();
            setEventSource(null);
          }
        }
      };
      eventSource.onerror = (e) => {
        console.error('Event Source Error:', e); // Debug message
        setIsProcessRunning(false);
        if (eventSource) {
          eventSource.close();
          setEventSource(null);
        }
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource, setIsProcessRunning]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleOutputChange = (event) => {
    setOutputValue(event.target.value);
  };

  const handleSubmit = () => {
    if (inputValue && outputValue) {
      console.log('Starting process with:', inputValue, outputValue); // Debug message
      if (eventSource) {
        eventSource.close();
      }
      setIsProcessRunning(true);
      onSubmit(inputValue, outputValue, setEventSource);
    } else {
      console.log('Input or output value missing'); // Debug message
    }
  };

  const handleStop = () => {
    console.log('Stopping process'); // Debug message
    axios.post('http://localhost:5000/stop-process')
      .then(response => {
        console.log('Stop process response:', response.data); // Debug message
        if (eventSource) {
          eventSource.close();
          setEventSource(null);
        }
        setIsProcessRunning(false);
      })
      .catch(error => {
        console.error('Error stopping process:', error);
        setIsProcessRunning(false);
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
      <button onClick={handleSubmit} disabled={!inputValue || !outputValue || isProcessRunning}>Start</button>
      <button onClick={handleStop} disabled={!isProcessRunning}>Stop</button>
      {isProcessRunning && <div className="spinner"></div>}
      <pre>{log}</pre>
    </div>
  );
};

export default ProcessSection;
