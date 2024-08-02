import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Niivue, NVImage } from '@niivue/niivue';
import SplitPane from 'react-split-pane';
import ReactMarkdown from 'react-markdown';
import './ViewDirectory.css';
import TableComponent from './TableComponent';

const ViewDirectory = () => {
  const [directory, setDirectory] = useState('');
  const [structure, setStructure] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [selectedFile, setSelectedFile] = useState('');
  const [textContent, setTextContent] = useState(null);
  const [niiContent, setNiiContent] = useState('');
  const [imageContent, setImageContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [unsupportedContent, setUnsupportedContent] = useState('');
  const [jsonContent, setJsonContent] = useState(null); // State for JSON content
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
      setTextContent(null);
      setImageContent('');
      setMarkdownContent('');
      setUnsupportedContent('');
      setJsonContent(null); // Clear previous JSON content

      try {
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

        // Check for associated JSON file
        const jsonFilePath = niiContent.replace(/\.(nii|nii\.gz)$/, '.json');
        try {
          const jsonResponse = await axios.post('http://localhost:5000/read-text-file', { filePath: jsonFilePath });
          setJsonContent(JSON.parse(jsonResponse.data.content));
        } catch (jsonError) {
          console.error('Associated JSON file not found or error reading JSON file:', jsonError);
          setJsonContent(null);
        }
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
        setCollapsed(generateInitialCollapsedState(response.data));
      })
      .catch(error => {
        console.error('Error fetching directory structure:', error);
      });
  };

  const generateInitialCollapsedState = (structure, path = '') => {
    let collapsedState = {};
    Object.keys(structure).forEach(key => {
      const newPath = `${path}/${key}`;
      if (structure[key] && typeof structure[key] === 'object') {
        collapsedState[newPath] = true;
        collapsedState = { ...collapsedState, ...generateInitialCollapsedState(structure[key], newPath) };
      }
    });
    return collapsedState;
  };

  const handleFileClick = async (relativePath) => {
    const fullPath = `${directory}${relativePath}`.replace(/\/\//g, '/');
    console.log(`Clicked on: ${fullPath}`);
    setSelectedFile(fullPath);

    if (fullPath.endsWith('.nii') || fullPath.endsWith('.nii.gz')) {
      setTextContent(null);
      setImageContent('');
      setMarkdownContent('');
      setUnsupportedContent('');
      setJsonContent(null); // Clear previous JSON content
      setNiiContent(fullPath);
    } else if (fullPath.endsWith('.png') || fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg') || fullPath.endsWith('.ico')) {
      setTextContent(null);
      setNiiContent('');
      setMarkdownContent('');
      setUnsupportedContent('');
      setJsonContent(null); // Clear previous JSON content
      axios.post('http://localhost:5000/read-image-file', { filePath: fullPath })
        .then(response => {
          setImageContent(response.data.url);
        })
        .catch(error => {
          console.error('Error reading image file:', error);
          setImageContent('');
        });
    } else if (fullPath.endsWith('.md') || fullPath.endsWith('README')) {
      setTextContent(null);
      setNiiContent('');
      setImageContent('');
      setUnsupportedContent('');
      setJsonContent(null); // Clear previous JSON content
      axios.post('http://localhost:5000/read-text-file', { filePath: fullPath })
        .then(response => {
          setMarkdownContent(response.data.content);
        })
        .catch(error => {
          console.error('Error reading Markdown file:', error);
          setMarkdownContent('');
        });
    } else {
      try {
        const response = await axios.post('http://localhost:5000/read-text-file', { filePath: fullPath });
        console.log('Text content:', response.data.content);
        const content = response.data.content;

        // Check if the content is likely to be text or binary
        if (isTextContent(content)) {
          try {
            const jsonContent = JSON.parse(content);
            setTextContent(jsonContent);
          } catch (e) {
            setTextContent(content);
          }
          setNiiContent('');
          setImageContent('');
          setMarkdownContent('');
          setUnsupportedContent('');
        } else {
          setTextContent(null);
          setNiiContent('');
          setImageContent('');
          setMarkdownContent('');
          setUnsupportedContent(fullPath);
        }

        if (niivueRef.current) {
          niivueRef.current.removeVolume(niivueRef.current.volumes[0]);
          niivueRef.current = null;
          console.log('Removed NiiVue volume and instance on text file load');
        }
      } catch (error) {
        console.error('Error reading text file:', error);
        setTextContent(null);
        setNiiContent('');
        setImageContent('');
        setMarkdownContent('');
        setUnsupportedContent(fullPath);
      }
    }
  };

  const isTextContent = (content) => {
    // Check if the content is likely to be text
    // This is a simple heuristic: it checks for the presence of binary data
    const textCharacters = /^[\x00-\x7F]*$/;
    return textCharacters.test(content);
  };

  const toggleCollapse = (path) => {
    setCollapsed(prevState => ({
      ...prevState,
      [path]: !prevState[path]
    }));
  };

  const renderStructure = (structure, path = '', level = 0) => {
    if (!structure) return null;

    const entries = Object.keys(structure).map(key => ({
      name: key,
      isDirectory: structure[key] && typeof structure[key] === 'object',
      path: `${path}/${key}`
    }));

    entries.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <ul style={{ paddingLeft: level * 10 }}>
        {entries.map(entry => {
          if (entry.isDirectory) {
            return (
              <li key={entry.path}>
                <div onClick={() => toggleCollapse(entry.path)} style={{ cursor: 'pointer' }}>
                  <strong>{collapsed[entry.path] ? '[+]' : '[-]'} {entry.name}</strong>
                </div>
                {!collapsed[entry.path] && renderStructure(structure[entry.name], entry.path, level + 1)}
              </li>
            );
          } else {
            return (
              <li
                key={entry.path}
                onClick={() => handleFileClick(entry.path)}
                style={{
                  cursor: 'pointer',
                  color: selectedFile === `${directory}${entry.path}` ? 'blue' : 'black',
                  backgroundColor: selectedFile === `${directory}${entry.path}` ? '#e0f7ff' : 'transparent'
                }}
              >
                {entry.name}
              </li>
            );
          }
        })}
      </ul>
    );
  };

  const handleResize = () => {
    try {
      if (niivueRef.current) {
        niivueRef.current.updateGLVolume();
      }
    } catch (error) {
      console.error('Error during resize:', error);
    }
  };

  return (
    <div className="view-directory-container">
      <SplitPane split="vertical" minSize={200} defaultSize={400} onChange={handleResize}>
        <div className="directory-structure">
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
        </div>
        <div className="content-display">
          {selectedFile && (
            <div>
              <h2>
                <a href={`http://localhost:5000/files${selectedFile.replace(directory, '')}`} download>{selectedFile.split('/').pop()}</a>
              </h2>
              {textContent && (
                <div>
                  {typeof textContent === 'object' ? <TableComponent jsonData={textContent} /> : <pre>{textContent}</pre>}
                </div>
              )}
              {niiContent && (
                <div>
                  <canvas id="gl" ref={canvasRef} width="800" height="600"></canvas>
                </div>
              )}
              {jsonContent && (
                <div>
                  <h3>Associated JSON Data:</h3>
                  <TableComponent jsonData={jsonContent} />
                </div>
              )}
              {imageContent && (
                <div>
                  <img src={imageContent} alt="Selected file" style={{ maxWidth: '100%' }} />
                </div>
              )}
              {markdownContent && (
                <div>
                  <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </div>
              )}
              {unsupportedContent && (
                <div>
                  <p>No preview available for this filetype.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </SplitPane>
    </div>
  );
};

export default ViewDirectory;
