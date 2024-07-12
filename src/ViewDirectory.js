import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Niivue, NVImage } from '@niivue/niivue';

const ViewDirectory = () => {
  const [directory, setDirectory] = useState('');
  const [structure, setStructure] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [jsonContent, setJsonContent] = useState(null);
  const [niiContent, setNiiContent] = useState('');
  const niivueRef = useRef(null);
  const canvasRef = useRef(null);

  const initializeNiivue = useCallback(() => {
    if (canvasRef.current) {
      niivueRef.current = new Niivue();
      niivueRef.current.attachToCanvas(canvasRef.current);
      console.log('NiiVue initialized and attached to canvas');
    }
  }, []);

  const loadNiftiFile = useCallback(async () => {
    if (niiContent && niivueRef.current) {
      console.log(`Fetching NIfTI content from: ${niiContent}`);
      setJsonContent(null); // clear JSON content

      try {
        // Unload current volume if any
        if (niivueRef.current.volumes.length > 0) {
          niivueRef.current.removeVolume(niivueRef.current.volumes[0]);
          console.log('Current volume removed');
        }

        const response = await axios.post('http://localhost:5000/read-nifti-file', { filePath: niiContent });
        const url = response.data.url;
        console.log(`NIfTI file URL: ${url}`);

        const nvImage = await NVImage.loadFromUrl({ url });
        console.log('Loaded NVImage:', nvImage);

        niivueRef.current.addVolume(nvImage);
        console.log('Volume loaded');
        niivueRef.current.setSliceType(niivueRef.current.sliceTypeMultiplanar);
      } catch (error) {
        console.error('Error reading NIfTI file:', error);
        setNiiContent('');
      }
    }
  }, [niiContent]);

  useEffect(() => {
    if (niiContent) {
      if (!niivueRef.current) {
        initializeNiivue();
      }
      loadNiftiFile();
    }
  }, [niiContent, initializeNiivue, loadNiftiFile]);

  const handleInputChange = (event) => {
    setDirectory(event.target.value);
  };

  const fetchDirectoryStructure = () => {
    axios.post('http://localhost:5000/get-directory-structure', { directory })
      .then(response => {
        setStructure(response.data);
      })
      .catch(error => {
        console.error('Error fetching directory structure:', error);
      });
  };

  const handleFileClick = (relativePath) => {
    const fullPath = `${directory}${relativePath}`;
    console.log(`Clicked on: ${fullPath}`);
    setSelectedFile(prevSelected => prevSelected === fullPath ? '' : fullPath);

    if (fullPath.endsWith('.json')) {
      console.log(`Fetching JSON content from: ${fullPath}`);
      axios.post('http://localhost:5000/read-json-file', { filePath: fullPath })
        .then(response => {
          console.log('JSON content:', response.data);
          setJsonContent(response.data);
          setNiiContent(''); // clear NIfTI content
          if (niivueRef.current) {
            niivueRef.current.removeVolume(niivueRef.current.volumes[0]);
            niivueRef.current = null;
            console.log('Removed NiiVue volume and instance on JSON load');
          }
        })
        .catch(error => {
          console.error('Error reading JSON file:', error);
          setJsonContent(null);
        });
    } else if (fullPath.endsWith('.nii') || fullPath.endsWith('.nii.gz')) {
      setJsonContent(null);
      setNiiContent(fullPath);
    } else {
      setJsonContent(null);
      setNiiContent('');
    }
  };

  const renderStructure = (structure, path = '') => {
    return (
      <ul>
        {Object.keys(structure).map(key => {
          const newPath = `${path}/${key}`;
          if (structure[key] && typeof structure[key] === 'object') {
            return (
              <li key={newPath}>
                <strong>{key}</strong>
                {renderStructure(structure[key], newPath)}
              </li>
            );
          }
          return (
            <li 
              key={newPath} 
              onClick={() => handleFileClick(newPath)} 
              style={{ 
                cursor: 'pointer', 
                color: selectedFile === `${directory}${newPath}` ? 'blue' : 'black',
                backgroundColor: selectedFile === `${directory}${newPath}` ? '#e0f7ff' : 'transparent'
              }}
            >
              {key}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div>
      <h1>View Directory</h1>
      <label>
        Directory:
        <input 
          type="text" 
          placeholder="Enter directory path" 
          value={directory} 
          onChange={handleInputChange} 
        />
      </label>
      <button onClick={fetchDirectoryStructure}>View</button>
      {structure && renderStructure(structure)}
      {jsonContent && (
        <div>
          <h2>JSON Content</h2>
          <pre>{JSON.stringify(jsonContent, null, 2)}</pre>
        </div>
      )}
      {niiContent && (
        <div>
          <h2>NIfTI Content</h2>
          <canvas id="gl" ref={canvasRef} width="800" height="600"></canvas>
        </div>
      )}
    </div>
  );
};

export default ViewDirectory;
