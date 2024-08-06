import React, { useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { DICOMToBIDSConversionContext } from './DICOMToBIDSConversionContext';  // Import the DICOMToBIDSConversionContext

const DICOMToBIDSConversion = () => {
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
  } = useContext(DICOMToBIDSConversionContext);

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
    <div>
      <label>
        Sorted DICOM directory:
        <input 
          type="text" 
          placeholder="Enter sorted DICOM directory" 
          value={bidsDirectory} 
          onChange={(e) => setBidsDirectory(e.target.value)} 
        />
      </label>
      <label>
        Output directory:
        <input 
          type="text" 
          placeholder="Enter output directory" 
          value={outputDirectory} 
          onChange={(e) => setOutputDirectory(e.target.value)} 
        />
      </label>
      <ProcessSection
        title="QSMxT DICOM to BIDS Converter"
        onSubmit={handleStartConvert}
        log={convertLog}
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
    </div>
  );
};

export default DICOMToBIDSConversion;
