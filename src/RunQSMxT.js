import React, { useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { RunQSMxTContext } from './RunQSMxTContext';  // Import the RunQSMxTContext

const RunQSMxT = ({ container }) => {
  const { 
    qsmBidsDirectory, 
    setQsmBidsDirectory, 
    premade, 
    setPremade, 
    isProcessRunning, 
    setIsProcessRunning, 
    qsmLog, 
    setQsmLog, 
    qsmEventSource, 
    setQsmEventSource 
  } = useContext(RunQSMxTContext);

  const handleStartQsmxt = () => {
    startProcess(
      'http://localhost:5000/start-qsmxt',
      { qsmBidsDirectory, premade, container },
      setQsmLog,
      setQsmEventSource,
      qsmEventSource,
      setIsProcessRunning
    );
  };

  return (
    <div>
      <label>
        BIDS directory:
        <input 
          type="text" 
          placeholder="Enter BIDS directory" 
          value={qsmBidsDirectory} 
          onChange={(e) => setQsmBidsDirectory(e.target.value)} 
        />
      </label>
      <ProcessSection
        title="Run QSMxT"
        onSubmit={handleStartQsmxt}
        log={qsmLog}
        isProcessRunning={isProcessRunning}
        setIsProcessRunning={setIsProcessRunning}
      >
        <div>
          <label>
            Premade:
            <select value={premade} onChange={(e) => setPremade(e.target.value)}>
              <option value="gre">GRE</option>
              <option value="epi">EPI</option>
              <option value="fast">FAST</option>
              <option value="bet">BET</option>
              <option value="nextqsm">NEXTQSM</option>
              <option value="body">BODY</option>
            </select>
          </label>
        </div>
      </ProcessSection>
    </div>
  );
};

export default RunQSMxT;
