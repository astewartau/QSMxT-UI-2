import React, { createContext, useState } from 'react';

const SortDICOMsContext = createContext();

const SortDICOMsProvider = ({ children }) => {
  const [dicomDirectory, setDicomDirectory] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [isProcessRunning, setIsProcessRunning] = useState(false);
  const [sortLog, setSortLog] = useState('');
  const [sortEventSource, setSortEventSource] = useState(null);

  return (
    <SortDICOMsContext.Provider value={{
      dicomDirectory,
      setDicomDirectory,
      outputDirectory,
      setOutputDirectory,
      isProcessRunning,
      setIsProcessRunning,
      sortLog,
      setSortLog,
      sortEventSource,
      setSortEventSource,
    }}>
      {children}
    </SortDICOMsContext.Provider>
  );
};

export { SortDICOMsContext, SortDICOMsProvider };
