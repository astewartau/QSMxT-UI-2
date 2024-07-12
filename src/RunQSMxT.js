import React, { useState, useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { AppContext } from './AppContext';

const QSMxT = () => {
  const { qsmxtLog, setQsmxtLog, qsmxtEventSource, setQsmxtEventSource } = useContext(AppContext);
  const [mode, setMode] = useState('local');

  const handleStartQSMxT = (qsmBidsDirectory, outputDirectory, premade) => {
    startProcess(
      'http://localhost:5000/start-qsmxt',
      { qsmBidsDirectory, outputDirectory, premade, mode },
      setQsmxtLog,
      setQsmxtEventSource,
      qsmxtEventSource
    );
  };

  return (
    <ProcessSection
      title="QSMxT"
      inputLabel="QSM BIDS directory"
      outputLabel="Output directory"
      onSubmit={handleStartQSMxT}
      log={qsmxtLog}
    >
      <label>
        Premade:
        <select>
          <option value="gre">gre</option>
          <option value="epi">epi</option>
          <option value="fast">fast</option>
          <option value="bet">bet</option>
          <option value="nextqsm">nextqsm</option>
          <option value="body">body</option>
        </select>
      </label>
      <label>
        Mode:
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="local">Local</option>
          <option value="container">Container</option>
        </select>
      </label>
    </ProcessSection>
  );
};

export default QSMxT;
