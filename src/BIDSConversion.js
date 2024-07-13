import React, { useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { BIDSConversionContext } from './BIDSConversionContext';  // Import the BIDSConversionContext

const BIDSConversion = () => {
  const { 
    bidsDirectory, 
    setBidsDirectory, 
    outputDirectory, 
    setOutputDirectory, 
    patterns, 
    setPatterns, 
    isProcessRunning, 
    setIsProcessRunning, 
    convertLog, 
    setConvertLog, 
    convertEventSource, 
    setConvertEventSource 
  } = useContext(BIDSConversionContext);

  const handleStartConvert = () => {
    startProcess(
      'http://localhost:5000/start-dicom-convert',
      { bidsDirectory, outputDirectory, patterns },
      setConvertLog,
      setConvertEventSource,
      convertEventSource,
      setIsProcessRunning
    );
  };

  return (
    <ProcessSection
      title="QSMxT DICOM to BIDS Converter"
      inputLabel="Sorted DICOM directory"
      outputLabel="Output directory"
      onSubmit={handleStartConvert}
      log={convertLog}
      inputValue={bidsDirectory}
      setInputValue={setBidsDirectory}
      outputValue={outputDirectory}
      setOutputValue={setOutputDirectory}
      isProcessRunning={isProcessRunning}
      setIsProcessRunning={setIsProcessRunning}
    >
      <label>
        QSM Protocol Patterns:
        <input 
          type="text" 
          placeholder="Enter patterns separated by commas" 
          value={patterns}
          onChange={(e) => setPatterns(e.target.value)}
        />
      </label>
    </ProcessSection>
  );
};

export default BIDSConversion;
