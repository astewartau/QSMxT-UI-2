import React, { useContext, useState } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { NIfTIToBIDSConversionContext } from './NIfTIToBIDSConversionContext';  // Import the NIfTIToBIDSConversionContext
import CSVEditor from './CSVEditor';

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

  const [csvFilePath, setCsvFilePath] = useState(null);

  const handleStartConvert = () => {
    startProcess(
      'http://localhost:5000/start-nifti-convert',
      { niftiDirectory, outputDirectory, container },
      setNiftiLog,
      setNiftiEventSource,
      niftiEventSource,
      setIsProcessRunning,
      (log) => {
        console.log('Log:', log);
        if (typeof log === 'string' && log.includes('RUN AGAIN AFTER ENTERING RELEVANT BIDS INFORMATION')) {
          const match = log.match(/RELEVANT BIDS INFORMATION TO (.*)\./);
          console.log('Match:', match);
          if (match) {
            const filePath = match[1];
            console.log('CSV File Path:', filePath);
            setCsvFilePath(filePath);
          }
        }
      }
    );
  };

  const handleCsvSave = () => {
    setCsvFilePath(null);
  };

  return (
    <div>
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
      {csvFilePath && <CSVEditor filePath={csvFilePath} onSave={handleCsvSave} />}
    </div>
  );
};

export default NIfTIToBIDSConversion;
