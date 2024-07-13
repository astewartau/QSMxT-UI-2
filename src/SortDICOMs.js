import React, { useState, useContext } from 'react';
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { AppContext } from './AppContext';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const SortDICOMs = () => {
  const { sortLog, setSortLog, sortEventSource, setSortEventSource } = useContext(AppContext);
  const [dicomDirectory, setDicomDirectory] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [uploadedDir, setUploadedDir] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleStartSort = (directory, outputDirectory) => {
    startProcess(
      'http://localhost:5000/start-dicom-sort',
      { directory, outputDirectory, checkAllFiles: true },
      setSortLog,
      setSortEventSource,
      sortEventSource
    );
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setSelectedFile(file);
    setFileName(file.name);
    handleFileUpload(file);
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('dicomArchive', file);

    try {
      const response = await axios.post('http://localhost:5000/upload-dicoms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const progress = Math.round((loaded * 100) / total);
          setUploadProgress(progress);
          console.log(`Upload Progress: ${progress}%`);
        },
      });
      setUploadedDir(response.data.extractedPath);
      setDicomDirectory(response.data.extractedPath);
      setUploadProgress(0); // Reset progress after successful upload
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0); // Reset progress on error
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: '.zip,.tar' });

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
      <div {...getRootProps({ className: 'dropzone' })} style={{ border: '2px dashed #cccccc', padding: '20px', textAlign: 'center' }}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>{fileName || 'Drag \'n\' drop a compressed DICOM folder (.zip or .tar) here, or click to select one'}</p>
        )}
        {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
      </div>
      {uploadedDir && (
        <div>
          <strong>Extracted DICOM directory:</strong>
          <p>{uploadedDir}</p>
        </div>
      )}
    </ProcessSection>
  );
};

export default SortDICOMs;
