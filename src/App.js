import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SortDICOMs from './SortDICOMs';
import DICOMToBIDSConversion from './DICOMToBIDSConversion';
import RunQSMxT from './RunQSMxT';
import ViewDirectory from './ViewDirectory';
import NIfTIToBIDSConversion from './NIfTIToBIDSConversion';  // Import NIfTIToBIDSConversion
import { AppProvider } from './AppContext';
import { SortDICOMsProvider } from './SortDICOMsContext';  // Import the SortDICOMsProvider
import { DICOMToBIDSConversionProvider } from './DICOMToBIDSConversionContext';  // Import the BIDSConversionProvider
import { RunQSMxTProvider } from './RunQSMxTContext';  // Import the RunQSMxTProvider
import { NIfTIToBIDSConversionProvider } from './NIfTIToBIDSConversionContext';  // Import the NIfTIToBIDSConversionProvider

const containerOptions = [
  { label: "Local", value: "" },
  { label: "vnmd/qsmxt_6.4.4:20240514", value: "vnmd/qsmxt_6.4.4:20240514" },
  { label: "vnmd/qsmxt_6.3.2:20231101", value: "vnmd/qsmxt_6.3.2:20231101" },
];

const App = () => {
  const [selectedContainer, setSelectedContainer] = useState(containerOptions[0].value);

  return (
    <AppProvider>
      <SortDICOMsProvider>
        <DICOMToBIDSConversionProvider>
          <RunQSMxTProvider>
            <NIfTIToBIDSConversionProvider>  {/* Wrap the routes with NIfTIToBIDSConversionProvider */}
              <Router>
                <div className="App">
                  <nav style={{ display: 'flex', alignItems: 'center' }}>
                    <ul style={{ display: 'flex', listStyleType: 'none', margin: 0, padding: 0 }}>
                      <li style={{ margin: '0 10px' }}>
                        <Link to="/sort-dicoms">Sort DICOMs</Link>
                      </li>
                      <li style={{ margin: '0 10px' }}>
                        <Link to="/dicom-to-bids-conversion">DICOM to BIDS</Link>
                      </li>
                      <li style={{ margin: '0 10px' }}>
                        <Link to="/nifti-to-bids-conversion">NIfTI to BIDS</Link>
                      </li>
                      <li style={{ margin: '0 10px' }}>
                        <Link to="/run-qsmxt">QSMxT</Link>
                      </li>
                      <li style={{ margin: '0 10px' }}>
                        <Link to="/view-directory">View Directory</Link>
                      </li>
                    </ul>
                    <div style={{ marginLeft: 'auto' }}>
                      <label htmlFor="containerSelect">Container:</label>
                      <select 
                        id="containerSelect" 
                        value={selectedContainer} 
                        onChange={(e) => setSelectedContainer(e.target.value)}
                      >
                        {containerOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </nav>
                  <Routes>
                    <Route path="/sort-dicoms" element={<SortDICOMs container={selectedContainer} />} />
                    <Route path="/dicom-to-bids-conversion" element={<DICOMToBIDSConversion container={selectedContainer} />} />
                    <Route path="/nifti-to-bids-conversion" element={<NIfTIToBIDSConversion container={selectedContainer} />} />
                    <Route path="/run-qsmxt" element={<RunQSMxT container={selectedContainer} />} />
                    <Route path="/view-directory" element={<ViewDirectory />} />
                    <Route path="/" element={<SortDICOMs container={selectedContainer} />} />
                  </Routes>
                </div>
              </Router>
            </NIfTIToBIDSConversionProvider>
          </RunQSMxTProvider>
        </DICOMToBIDSConversionProvider>
      </SortDICOMsProvider>
    </AppProvider>
  );
};

export default App;
