import React, { createContext, useState } from 'react';

const BIDSConversionContext = createContext();

const BIDSConversionProvider = ({ children }) => {
  const [bidsDirectory, setBidsDirectory] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [patterns, setPatterns] = useState('');
  const [isProcessRunning, setIsProcessRunning] = useState(false);
  const [convertLog, setConvertLog] = useState('');
  const [convertEventSource, setConvertEventSource] = useState(null);

  return (
    <BIDSConversionContext.Provider value={{
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
    </BIDSConversionContext.Provider>
  );
};

export { BIDSConversionContext, BIDSConversionProvider };
