import React, { createContext, useState } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [sortLog, setSortLog] = useState('');
  const [convertLog, setConvertLog] = useState('');
  const [qsmLog, setQsmLog] = useState('');
  const [sortEventSource, setSortEventSource] = useState(null);
  const [convertEventSource, setConvertEventSource] = useState(null);
  const [qsmEventSource, setQsmEventSource] = useState(null);

  return (
    <AppContext.Provider value={{
      sortLog, setSortLog,
      convertLog, setConvertLog,
      qsmLog, setQsmLog,
      sortEventSource, setSortEventSource,
      convertEventSource, setConvertEventSource,
      qsmEventSource, setQsmEventSource,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
