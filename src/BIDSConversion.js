import React, { useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { AppContext } from './AppContext';

const BIDSConversion = () => {
  const { convertLog, setConvertLog, convertEventSource, setConvertEventSource } = useContext(AppContext);

  const handleStartConvert = (bidsDirectory, outputDirectory) => {
    const patterns = document.getElementById('patterns').value;
    startProcess(
      'http://localhost:5000/start-dicom-convert',
      { bidsDirectory, outputDirectory, patterns },
      setConvertLog,
      setConvertEventSource,
      convertEventSource
    );
  };

  return (
    <ProcessSection
      title="QSMxT DICOM to BIDS Converter"
      inputLabel="Sorted DICOM directory"
      outputLabel="Output directory"
      onSubmit={handleStartConvert}
      log={convertLog}
    >
      <label>
        QSM Protocol Patterns:
        <input 
          type="text" 
          placeholder="Enter patterns separated by commas" 
          id="patterns"
        />
      </label>
    </ProcessSection>
  );
};

export default BIDSConversion;
