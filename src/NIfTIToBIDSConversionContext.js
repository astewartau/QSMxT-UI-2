import React, { createContext, useState } from 'react';

const NIfTIToBIDSConversionContext = createContext();

const NIfTIToBIDSConversionProvider = ({ children }) => {
  const [niftiDirectory, setNiftiDirectory] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [isProcessRunning, setIsProcessRunning] = useState(false);
  const [niftiLog, setNiftiLog] = useState('');
  const [niftiEventSource, setNiftiEventSource] = useState(null);

  return (
    <NIfTIToBIDSConversionContext.Provider value={{
      niftiDirectory,
      setNiftiDirectory,
      outputDirectory,
      setOutputDirectory,
      isProcessRunning,
      setIsProcessRunning,
      niftiLog,
      setNiftiLog,
      niftiEventSource,
      setNiftiEventSource,
    }}>
      {children}
    </NIfTIToBIDSConversionContext.Provider>
  );
};

export { NIfTIToBIDSConversionContext, NIfTIToBIDSConversionProvider };
