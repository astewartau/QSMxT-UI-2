import React, { useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { AppContext } from './AppContext';

const RunQSMxT = () => {
  const { qsmLog, setQsmLog, qsmEventSource, setQsmEventSource } = useContext(AppContext);

  const handleStartQsm = (qsmBidsDirectory, outputDirectory) => {
    const premade = document.getElementById('premade').value;
    startProcess(
      'http://localhost:5000/start-qsmxt',
      { qsmBidsDirectory, outputDirectory, premade },
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
      onSubmit={handleStartQsm}
      log={qsmLog}
    >
      <label>
        Premade:
        <select id="premade">
          <option value="gre">gre</option>
          <option value="epi">epi</option>
          <option value="fast">fast</option>
          <option value="bet">bet</option>
          <option value="nextqsm">nextqsm</option>
          <option value="body">body</option>
        </select>
      </label>
    </ProcessSection>
  );
};

export default RunQSMxT;
