const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
let childProcess;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/start-dicom-sort', (req, res) => {
  const { directory, outputDirectory, checkAllFiles } = req.body;
  let command = `dicom-sort ${directory} ${outputDirectory}`;
  if (checkAllFiles) {
    command += ' --check_all_files';
  }

  if (childProcess) {
    res.status(400).send('Process already running');
    return;
  }

  childProcess = exec(command);
  res.send('Process started');
});

app.get('/dicom-sort', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!childProcess) {
    res.write('data: No process running\n\n');
    res.end();
    return;
  }

  const sendData = (data) => {
    const lines = data.split('\n');
    lines.forEach(line => {
      if (line) {
        res.write(`data: ${line}\n\n`);
      }
    });
    res.flushHeaders();
  };

  childProcess.stdout.on('data', sendData);
  childProcess.stderr.on('data', sendData);

  childProcess.on('close', (code) => {
    sendData(`Process exited with code ${code}`);
    if (code === 0) {
      sendData('Success: DICOMs sorted successfully');
    } else {
      sendData(`Error: Process exited with code ${code}`);
    }
    childProcess = null;
    res.end();
  });
});

app.post('/start-dicom-convert', (req, res) => {
  const { bidsDirectory, outputDirectory, patterns } = req.body;
  let command = `dicom-convert ${bidsDirectory} ${outputDirectory} --auto_yes`;
  if (patterns) {
    const patternList = patterns.split(',').map(p => p.trim()).join(' ');
    command += ` --qsm_protocol_patterns ${patternList}`;
  }

  if (childProcess) {
    res.status(400).send('Process already running');
    return;
  }

  childProcess = exec(command);
  res.send('Process started');
});

app.get('/dicom-convert', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!childProcess) {
    res.write('data: No process running\n\n');
    res.end();
    return;
  }

  const sendData = (data) => {
    const lines = data.split('\n');
    lines.forEach(line => {
      if (line) {
        res.write(`data: ${line}\n\n`);
      }
    });
    res.flushHeaders();
  };

  childProcess.stdout.on('data', sendData);
  childProcess.stderr.on('data', sendData);

  childProcess.on('close', (code) => {
    sendData(`Process exited with code ${code}`);
    if (code === 0) {
      sendData('Success: DICOMs converted to BIDS successfully');
    } else {
      sendData(`Error: Process exited with code ${code}`);
    }
    childProcess = null;
    res.end();
  });
});

app.post('/start-qsmxt', (req, res) => {
  const { qsmBidsDirectory, outputDirectory, premade } = req.body;
  const command = `qsmxt ${qsmBidsDirectory} ${outputDirectory} --premade ${premade} --auto_yes`;

  if (childProcess) {
    res.status(400).send('Process already running');
    return;
  }

  childProcess = exec(command);
  res.send('Process started');
});

app.get('/qsmxt', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!childProcess) {
    res.write('data: No process running\n\n');
    res.end();
    return;
  }

  const sendData = (data) => {
    const lines = data.split('\n');
    lines.forEach(line => {
      if (line) {
        res.write(`data: ${line}\n\n`);
      }
    });
    res.flushHeaders();
  };

  childProcess.stdout.on('data', sendData);
  childProcess.stderr.on('data', sendData);

  childProcess.on('close', (code) => {
    sendData(`Process exited with code ${code}`);
    if (code === 0) {
      sendData('Success: QSMxT process completed successfully');
    } else {
      sendData(`Error: Process exited with code ${code}`);
    }
    childProcess = null;
    res.end();
  });
});

const getDirectoryStructure = (dirPath) => {
  const result = {};
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      result[file] = getDirectoryStructure(filePath);
    } else {
      result[file] = null;  // Mark files with null
    }
  });

  return result;
};

app.post('/get-directory-structure', (req, res) => {
  const { directory } = req.body;

  try {
    const structure = getDirectoryStructure(directory);
    res.json(structure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/read-text-file', (req, res) => {
  const { filePath } = req.body;
  console.log(`Reading text file from: ${filePath}`);

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json({ content: data });
  } catch (error) {
    console.error('Error reading text file:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/read-nifti-file', (req, res) => {
  const { filePath } = req.body;
  const absolutePath = path.resolve(filePath);
  if (fs.existsSync(absolutePath)) {
    const relativePath = path.relative('/', absolutePath);
    res.json({ url: `http://localhost:${PORT}/files/${relativePath}` });
  } else {
    res.status(404).send('File not found');
  }
});

app.use('/files', express.static(path.resolve('/')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

