import React, { useState, useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { AppContext } from './AppContext';
import axios from 'axios';

const SortDICOMs = () => {
  const { sortLog, setSortLog, sortEventSource, setSortEventSource } = useContext(AppContext);
  const [dicomDirectory, setDicomDirectory] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [uploadedDir, setUploadedDir] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleStartSort = (directory, outputDirectory) => {
    startProcess(
      'http://localhost:5000/start-dicom-sort',
      { directory, outputDirectory, checkAllFiles: true },
      setSortLog,
      setSortEventSource,
      sortEventSource
    );
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('dicomArchive', selectedFile);

      try {
        const response = await axios.post('http://localhost:5000/upload-dicoms', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const progress = Math.round((loaded * 100) / total);
            setUploadProgress(progress);
          },
        });
        setUploadedDir(response.data.extractedPath);
        setDicomDirectory(response.data.extractedPath);
        setUploadProgress(0); // Reset progress after successful upload
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadProgress(0); // Reset progress on error
      }
    }
  };

  return (
    <ProcessSection
      title="QSMxT DICOM Sorter"
      inputLabel="DICOM directory"
      outputLabel="Output directory"
      onSubmit={handleStartSort}
      log={sortLog}
      inputValue={dicomDirectory}
      setInputValue={setDicomDirectory}
    >
      <div>
        <input 
          type="checkbox" 
          id="checkAllFiles" 
        />
        <label htmlFor="checkAllFiles">Check all files (--check_all_files)</label>
      </div>
      <div>
        <label htmlFor="dicomUpload">Upload compressed DICOM folder (.zip or .tar):</label>
        <input 
          type="file" 
          id="dicomUpload" 
          accept=".zip,.tar" 
          onChange={handleFileChange} 
        />
        <button onClick={handleFileUpload}>Upload</button>
        {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
        {uploadedDir && (
          <div>
            <strong>Extracted DICOM directory:</strong>
            <p>{uploadedDir}</p>
          </div>
        )}
      </div>
    </ProcessSection>
  );
};

export default SortDICOMs;
