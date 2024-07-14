import React, { createContext, useState } from 'react';

const DICOMToBIDSConversionContext = createContext();

const DICOMToBIDSConversionProvider = ({ children }) => {
  const [bidsDirectory, setBidsDirectory] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [patterns, setPatterns] = useState('');
  const [isProcessRunning, setIsProcessRunning] = useState(false);
  const [convertLog, setConvertLog] = useState('');
  const [convertEventSource, setConvertEventSource] = useState(null);

  return (
    <DICOMToBIDSConversionContext.Provider value={{
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
      setConvertEventSource,
    }}>
      {children}
    </DICOMToBIDSConversionContext.Provider>
  );
};

export { DICOMToBIDSConversionContext, DICOMToBIDSConversionProvider };
