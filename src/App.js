import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SortDICOMs from './SortDICOMs';
import BIDSConversion from './BIDSConversion';
import RunQSMxT from './RunQSMxT';
import ViewDirectory from './ViewDirectory';
import { AppProvider } from './AppContext';
import { SortDICOMsProvider } from './SortDICOMsContext';  // Import the SortDICOMsProvider
import { BIDSConversionProvider } from './BIDSConversionContext';  // Import the BIDSConversionProvider
import { RunQSMxTProvider } from './RunQSMxTContext';  // Import the RunQSMxTProvider

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
        <BIDSConversionProvider>
          <RunQSMxTProvider>  {/* Wrap the routes with RunQSMxTProvider */}
            <Router>
              <div className="App">
                <nav style={{ display: 'flex', alignItems: 'center' }}>
                  <ul style={{ display: 'flex', listStyleType: 'none', margin: 0, padding: 0 }}>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/sort-dicoms">Sort DICOMs</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/bids-conversion">BIDS Conversion</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/run-qsmxt">Run QSMxT</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/view">View</Link>
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
                  <Route path="/bids-conversion" element={<BIDSConversion container={selectedContainer} />} />
                  <Route path="/run-qsmxt" element={<RunQSMxT container={selectedContainer} />} />
                  <Route path="/view" element={<ViewDirectory />} />
                  <Route path="/" element={<SortDICOMs container={selectedContainer} />} />
                </Routes>
              </div>
            </Router>
          </RunQSMxTProvider>
        </BIDSConversionProvider>
      </SortDICOMsProvider>
    </AppProvider>
  );
};

export default App;
