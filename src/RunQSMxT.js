import React, { useState, useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { AppContext } from './AppContext';

const RunQSMxT = ({ container }) => {
  const { qsmLog, setQsmLog, qsmEventSource, setQsmEventSource } = useContext(AppContext);
  const [premade, setPremade] = useState('gre');

  const handleStartQsmxt = (qsmBidsDirectory, outputDirectory) => {
    startProcess(
      'http://localhost:5000/start-qsmxt',
      { qsmBidsDirectory, outputDirectory, premade: "default", container },
      setQsmLog,
      setQsmEventSource,
      qsmEventSource
    );
  };

  return (
    <ProcessSection
      title="Run QSMxT"
      inputLabel="BIDS directory"
      outputLabel="Output directory"
      onSubmit={handleStartQsmxt}
      log={qsmLog}
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
