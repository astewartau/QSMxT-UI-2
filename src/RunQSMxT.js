import React, { useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { RunQSMxTContext } from './RunQSMxTContext';  // Import the RunQSMxTContext

const RunQSMxT = ({ container }) => {
  const { 
    qsmBidsDirectory, 
    setQsmBidsDirectory, 
    outputDirectory, 
    setOutputDirectory, 
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
      { qsmBidsDirectory, outputDirectory, premade, container },
      setQsmLog,
      setQsmEventSource,
      qsmEventSource,
      setIsProcessRunning
    );
  };

  return (
    <ProcessSection
      title="Run QSMxT"
      inputLabel="BIDS directory"
      outputLabel="Output directory"
      onSubmit={handleStartQsmxt}
      log={qsmLog}
      inputValue={qsmBidsDirectory}
      setInputValue={setQsmBidsDirectory}
      outputValue={outputDirectory}
      setOutputValue={setOutputDirectory}
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
  );
};

export default RunQSMxT;
