import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './spinner.css'; // Make sure to import the CSS file for the spinner
import './styles.css'; // Import the styles for warning and error messages

const ProcessSection = ({ title, onSubmit, log, children, isProcessRunning, setIsProcessRunning }) => {
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    if (eventSource) {
      console.log('EventSource initialized');
      eventSource.onmessage = (e) => {
        console.log('Event Source Message:', e.data);
        if (e.data.includes('Process exited with code')) {
          console.log('Process finished or error occurred, closing Event Source');
          setIsProcessRunning(false);
          if (eventSource) {
            eventSource.close();
            setEventSource(null);
          }
        }
      };
      eventSource.onerror = (e) => {
        console.error('Event Source Error:', e);
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

  const handleSubmit = () => {
    console.log('Starting process');
    if (eventSource) {
      eventSource.close();
    }
    setIsProcessRunning(true);
    onSubmit(setEventSource);
  };

  const handleStop = () => {
    console.log('Stopping process');
    axios.post('http://localhost:5000/stop-process')
      .then(response => {
        console.log('Stop process response:', response.data);
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
      {children}
      <button onClick={handleSubmit} disabled={isProcessRunning}>Start</button>
      <button onClick={handleStop} disabled={!isProcessRunning}>Stop</button>
      {isProcessRunning && <div className="spinner"></div>}
      <pre dangerouslySetInnerHTML={{ __html: log }}></pre>
    </div>
  );
};

export default ProcessSection;
