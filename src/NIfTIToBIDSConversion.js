import React, { useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { NIfTIToBIDSConversionContext } from './NIfTIToBIDSConversionContext';  // Import the NIfTIToBIDSConversionContext

const NIfTIToBIDSConversion = ({ container }) => {
  const { 
    niftiDirectory, 
    setNiftiDirectory, 
    outputDirectory, 
    setOutputDirectory, 
    isProcessRunning, 
    setIsProcessRunning, 
    niftiLog, 
    setNiftiLog, 
    niftiEventSource, 
    setNiftiEventSource 
  } = useContext(NIfTIToBIDSConversionContext);

  const handleStartConvert = () => {
    startProcess(
      'http://localhost:5000/start-nifti-convert',
      { niftiDirectory, outputDirectory, container },
      setNiftiLog,
      setNiftiEventSource,
      niftiEventSource,
      setIsProcessRunning
    );
  };

  return (
    <ProcessSection
      title="NIfTI to BIDS Converter"
      inputLabel="NIfTI directory"
      outputLabel="Output directory"
      onSubmit={handleStartConvert}
      log={niftiLog}
      inputValue={niftiDirectory}
      setInputValue={setNiftiDirectory}
      outputValue={outputDirectory}
      setOutputValue={setOutputDirectory}
      isProcessRunning={isProcessRunning}
      setIsProcessRunning={setIsProcessRunning}
    />
  );
};

export default NIfTIToBIDSConversion;
