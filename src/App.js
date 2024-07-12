import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [directory, setDirectory] = useState('');
  const [checkAllFiles, setCheckAllFiles] = useState(false);  // State for checkbox
  const [log, setLog] = useState('');
  const [bidsDirectory, setBidsDirectory] = useState('');  // State for BIDS directory input
  const [bidsLog, setBidsLog] = useState('');  // State for BIDS log
  const [patterns, setPatterns] = useState('');  // State for qsm_protocol_patterns
  const [qsmBidsDirectory, setQsmBidsDirectory] = useState('');  // State for QSM BIDS directory input
  const [premade, setPremade] = useState('gre');  // State for premade options
  const [qsmLog, setQsmLog] = useState('');  // State for QSM log
  const [eventSource, setEventSource] = useState(null);

  const handleInputChange = (event) => {
    setDirectory(event.target.value);
  };

  const handleCheckboxChange = (event) => {
    setCheckAllFiles(event.target.checked);
  };

  const handleBidsInputChange = (event) => {
    setBidsDirectory(event.target.value);
  };

  const handlePatternsChange = (event) => {
    setPatterns(event.target.value);
  };

  const handleQsmBidsInputChange = (event) => {
    setQsmBidsDirectory(event.target.value);
  };

  const handlePremadeChange = (event) => {
    setPremade(event.target.value);
  };

  const handleStartSort = () => {
    setLog('');

    if (eventSource) {
      eventSource.close();
    }

    // Start the dicom-sort process with optional --check_all_files flag
    axios.post('http://localhost:5000/start-dicom-sort', { directory, checkAllFiles })
      .then(response => {
        setLog('Process started\n');
        const newEventSource = new EventSource('http://localhost:5000/dicom-sort');
        setEventSource(newEventSource);

        newEventSource.onmessage = (event) => {
          setLog(prevLog => prevLog + event.data + '\n');

          // Close the EventSource when the process completes
          if (event.data.includes('Success') || event.data.includes('Error')) {
            newEventSource.close();
            setEventSource(null);
            setLog(prevLog => prevLog + 'Connection closed\n');
          }
        };

        newEventSource.onerror = (event) => {
          let errorMessage = 'An error occurred';
          if (event && event.message) {
            errorMessage = event.message;
          } else if (event && event.target && event.target.readyState === EventSource.CLOSED) {
            errorMessage = 'Connection closed';
          } else if (event && event.target && event.target.readyState === EventSource.CONNECTING) {
            errorMessage = 'Reconnecting';
          }

          // Log detailed error information
          console.error('EventSource error:', event);
          setLog(prevLog => prevLog + `Error: ${errorMessage}\n`);

          // If the EventSource is closed, close it to prevent further errors
          if (event.target.readyState === EventSource.CLOSED) {
            newEventSource.close();
            setEventSource(null);
          }
        };

        newEventSource.onclose = () => {
          setLog(prevLog => prevLog + 'Connection closed\n');
          setEventSource(null);
        };
      })
      .catch(error => {
        console.error('Axios request failed:', error);
        setLog(`Error: ${error.message || 'Request failed'}\n`);
      });
  };

  const handleStartConvert = () => {
    setBidsLog('');

    if (eventSource) {
      eventSource.close();
    }

    // Start the dicom-convert process
    axios.post('http://localhost:5000/start-dicom-convert', { bidsDirectory, patterns })
      .then(response => {
        setBidsLog('Process started\n');
        const newEventSource = new EventSource('http://localhost:5000/dicom-convert');
        setEventSource(newEventSource);

        newEventSource.onmessage = (event) => {
          setBidsLog(prevLog => prevLog + event.data + '\n');

          // Close the EventSource when the process completes
          if (event.data.includes('Success') || event.data.includes('Error')) {
            newEventSource.close();
            setEventSource(null);
            setBidsLog(prevLog => prevLog + 'Connection closed\n');
          }
        };

        newEventSource.onerror = (event) => {
          let errorMessage = 'An error occurred';
          if (event && event.message) {
            errorMessage = event.message;
          } else if (event && event.target && event.target.readyState === EventSource.CLOSED) {
            errorMessage = 'Connection closed';
          } else if (event && event.target && event.target.readyState === EventSource.CONNECTING) {
            errorMessage = 'Reconnecting';
          }

          // Log detailed error information
          console.error('EventSource error:', event);
          setBidsLog(prevLog => prevLog + `Error: ${errorMessage}\n`);

          // If the EventSource is closed, close it to prevent further errors
          if (event.target.readyState === EventSource.CLOSED) {
            newEventSource.close();
            setEventSource(null);
          }
        };

        newEventSource.onclose = () => {
          setBidsLog(prevLog => prevLog + 'Connection closed\n');
          setEventSource(null);
        };
      })
      .catch(error => {
        console.error('Axios request failed:', error);
        setBidsLog(`Error: ${error.message || 'Request failed'}\n`);
      });
  };

  const handleStartQsm = () => {
    setQsmLog('');

    if (eventSource) {
      eventSource.close();
    }

    // Start the qsmxt process
    axios.post('http://localhost:5000/start-qsmxt', { qsmBidsDirectory, premade })
      .then(response => {
        setQsmLog('Process started\n');
        const newEventSource = new EventSource('http://localhost:5000/qsmxt');
        setEventSource(newEventSource);

        newEventSource.onmessage = (event) => {
          setQsmLog(prevLog => prevLog + event.data + '\n');

          // Close the EventSource when the process completes
          if (event.data.includes('Success') || event.data.includes('Error')) {
            newEventSource.close();
            setEventSource(null);
            setQsmLog(prevLog => prevLog + 'Connection closed\n');
          }
        };

        newEventSource.onerror = (event) => {
          let errorMessage = 'An error occurred';
          if (event && event.message) {
            errorMessage = event.message;
          } else if (event && event.target && event.target.readyState === EventSource.CLOSED) {
            errorMessage = 'Connection closed';
          } else if (event && event.target && event.target.readyState === EventSource.CONNECTING) {
            errorMessage = 'Reconnecting';
          }

          // Log detailed error information
          console.error('EventSource error:', event);
          setQsmLog(prevLog => prevLog + `Error: ${errorMessage}\n`);

          // If the EventSource is closed, close it to prevent further errors
          if (event.target.readyState === EventSource.CLOSED) {
            newEventSource.close();
            setEventSource(null);
          }
        };

        newEventSource.onclose = () => {
          setQsmLog(prevLog => prevLog + 'Connection closed\n');
          setEventSource(null);
        };
      })
      .catch(error => {
        console.error('Axios request failed:', error);
        setQsmLog(`Error: ${error.message || 'Request failed'}\n`);
      });
  };

  return (
    <div className="App">
      <h1>QSMxT DICOM Sorter</h1>
      <label>
        DICOM directory:
        <input 
          type="text" 
          placeholder="Enter DICOM directory path" 
          value={directory} 
          onChange={handleInputChange} 
        />
      </label>
      <div>
        <input 
          type="checkbox" 
          checked={checkAllFiles} 
          onChange={handleCheckboxChange} 
        />
        <label>Check all files (--check_all_files)</label>
      </div>
      <button onClick={handleStartSort}>Start</button>
      <pre>{log}</pre>

      <h1>QSMxT DICOM to BIDS Converter</h1>
      <label>
        Sorted DICOM directory:
        <input 
          type="text" 
          placeholder="Enter sorted DICOM directory path" 
          value={bidsDirectory} 
          onChange={handleBidsInputChange} 
        />
      </label>
      <label>
        QSM Protocol Patterns:
        <input 
          type="text" 
          placeholder="Enter patterns separated by commas" 
          value={patterns} 
          onChange={handlePatternsChange} 
        />
      </label>
      <button onClick={handleStartConvert}>Start</button>
      <pre>{bidsLog}</pre>

      <h1>Run QSMxT</h1>
      <label>
        BIDS directory:
        <input 
          type="text" 
          placeholder="Enter BIDS directory path" 
          value={qsmBidsDirectory} 
          onChange={handleQsmBidsInputChange} 
        />
      </label>
      <label>
        Premade:
        <select value={premade} onChange={handlePremadeChange}>
          <option value="gre">gre</option>
          <option value="epi">epi</option>
          <option value="fast">fast</option>
          <option value="bet">bet</option>
          <option value="nextqsm">nextqsm</option>
          <option value="body">body</option>
        </select>
      </label>
      <button onClick={handleStartQsm}>Start</button>
      <pre>{qsmLog}</pre>
    </div>
  );
}

export default App;
