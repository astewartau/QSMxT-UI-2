import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SortDICOMs from './SortDICOMs';
import BIDSConversion from './BIDSConversion';
import RunQSMxT from './RunQSMxT';
import ViewDirectory from './ViewDirectory';
import { AppProvider } from './AppContext';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <nav>
            <ul>
              <li>
                <Link to="/sort-dicoms">Sort DICOMs</Link>
              </li>
              <li>
                <Link to="/bids-conversion">BIDS Conversion</Link>
              </li>
              <li>
                <Link to="/run-qsmxt">Run QSMxT</Link>
              </li>
              <li>
                <Link to="/view">View</Link>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/sort-dicoms" element={<SortDICOMs />} />
            <Route path="/bids-conversion" element={<BIDSConversion />} />
            <Route path="/run-qsmxt" element={<RunQSMxT />} />
            <Route path="/view" element={<ViewDirectory />} />
            <Route path="/" element={<SortDICOMs />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
