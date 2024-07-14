import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CSVEditor = ({ filePath, onSave }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    console.log('Fetching CSV from:', filePath);
    axios.get('http://localhost:5000/fetch-csv', { params: { filePath } })
      .then(response => {
        setData(response.data);
        if (response.data.length > 0) {
          setHeaders(Object.keys(response.data[0]));
        }
      })
      .catch(error => {
        console.error('Error fetching CSV:', error);
      });
  }, [filePath]);

  const handleInputChange = (e, rowIndex, columnName) => {
    const updatedData = data.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, [columnName]: e.target.value };
      }
      return row;
    });
    setData(updatedData);
  };

  const handleSave = () => {
    axios.post('http://localhost:5000/save-csv', { filePath, data })
      .then(response => {
        console.log('CSV saved successfully');
        onSave();
      })
      .catch(error => {
        console.error('Error saving CSV:', error);
      });
  };

  return (
    <div>
      <h2>Edit CSV</h2>
      <table>
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map(column => (
                <td key={column}>
                  <input 
                    type="text" 
                    value={row[column]} 
                    onChange={(e) => handleInputChange(e, rowIndex, column)} 
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave}>Save CSV</button>
    </div>
  );
};

export default CSVEditor;
