const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
let childProcess;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/start-dicom-sort', (req, res) => {
  const { directory, checkAllFiles } = req.body;
  let command = `dicom-sort ${directory} dicoms-sorted`;
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
  const { bidsDirectory, patterns } = req.body;
  let command = `dicom-convert ${bidsDirectory} bids --auto_yes`;
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
  const { qsmBidsDirectory, premade } = req.body;
  const command = `qsmxt ${qsmBidsDirectory} qsm --premade ${premade} --auto_yes`;

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
