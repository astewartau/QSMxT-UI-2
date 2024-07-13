import React, { useContext, useState } from 'react';  // Added useState import
import ProcessSection from './ProcessSection';
import { startProcess } from './utils';
import { SortDICOMsContext } from './SortDICOMsContext';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const SortDICOMs = ({ container }) => {
  const { 
    dicomDirectory, 
    setDicomDirectory, 
    outputDirectory, 
    setOutputDirectory, 
    isProcessRunning, 
    setIsProcessRunning, 
    sortLog, 
    setSortLog, 
    sortEventSource, 
    setSortEventSource 
  } = useContext(SortDICOMsContext);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleStartSort = (directory, outputDirectory) => {
    console.log('Starting DICOM sort with directories:', directory, outputDirectory); // Debug message
    setIsProcessRunning(true);
    startProcess(
      'http://localhost:5000/start-dicom-sort',
      { directory, outputDirectory, checkAllFiles: true, container },
      setSortLog,
      setSortEventSource,
      sortEventSource,
      setIsProcessRunning
    );
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    console.log('File dropped:', file); // Debug message
    setSelectedFile(file);
    setFileName(file.name);
    handleFileUpload(file);
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('dicomArchive', file);

    try {
      console.log('Uploading file:', file.name); // Debug message
      const response = await axios.post('http://localhost:5000/upload-dicoms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const progress = Math.round((loaded * 100) / total);
          setUploadProgress(progress);
          console.log(`Upload Progress: ${progress}%`); // Debug message
        },
      });
      console.log('Upload response:', response.data); // Debug message
      setDicomDirectory(response.data.extractedPath);
      setOutputDirectory(`${response.data.extractedPath}-sorted`);
      setUploadProgress(0); // Reset progress after successful upload
      setUploadComplete(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0); // Reset progress on error
      setUploadComplete(false);
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
      outputValue={outputDirectory}
      setOutputValue={setOutputDirectory}
      isProcessRunning={isProcessRunning}
      setIsProcessRunning={setIsProcessRunning}
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
        {uploadComplete && <p>✔ Upload complete</p>}
      </div>
    </ProcessSection>
  );
};

export default SortDICOMs;
