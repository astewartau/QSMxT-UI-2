import React, { createContext, useState } from 'react';

const RunQSMxTContext = createContext();

const RunQSMxTProvider = ({ children }) => {
  const [qsmBidsDirectory, setQsmBidsDirectory] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [premade, setPremade] = useState('gre');
  const [isProcessRunning, setIsProcessRunning] = useState(false);
  const [qsmLog, setQsmLog] = useState('');
  const [qsmEventSource, setQsmEventSource] = useState(null);

  return (
    <RunQSMxTContext.Provider value={{
      qsmBidsDirectory,
      setQsmBidsDirectory,
      outputDirectory,
      setOutputDirectory,
      premade,
      setPremade,
      isProcessRunning,
      setIsProcessRunning,
      qsmLog,
      setQsmLog,
      qsmEventSource,
      setQsmEventSource,
    }}>
      {children}
    </RunQSMxTContext.Provider>
  );
};

export { RunQSMxTContext, RunQSMxTProvider };
