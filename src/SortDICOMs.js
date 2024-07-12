import React, { useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { AppContext } from './AppContext';

const SortDICOMs = () => {
  const { sortLog, setSortLog, sortEventSource, setSortEventSource } = useContext(AppContext);

  const handleStartSort = (directory, outputDirectory) => {
    startProcess(
      'http://localhost:5000/start-dicom-sort',
      { directory, outputDirectory, checkAllFiles: true },
      setSortLog,
      setSortEventSource,
      sortEventSource
    );
  };

  return (
    <ProcessSection
      title="QSMxT DICOM Sorter"
      inputLabel="DICOM directory"
      outputLabel="Output directory"
      onSubmit={handleStartSort}
      log={sortLog}
    >
      <div>
        <input 
          type="checkbox" 
          id="checkAllFiles"
        />
        <label>Check all files (--check_all_files)</label>
      </div>
    </ProcessSection>
  );
};

export default SortDICOMs;
