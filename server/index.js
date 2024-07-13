const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const extract = require('extract-zip');
const tar = require('tar-fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
let childProcess;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Function to run command either locally or in Docker container
const runCommand = (command, container, res) => {
    if (childProcess) {
        res.status(400).send('Process already running');
        return;
    }

    if (container) {
        command = `docker run --rm -v ${process.env.HOME}:${process.env.HOME} ${container} ${command}`;
    }

    childProcess = exec(command);
    res.send('Process started');
};


// Stop any running process
app.post('/stop-process', (req, res) => {
    if (childProcess) {
      childProcess.kill('SIGKILL');
      childProcess = null;
      res.send('Process stopped');
    } else {
      res.status(400).send('No process running');
    }
  });

// Convert to absolute path if not already
const toAbsolutePath = (dir) => {
    return path.isAbsolute(dir) ? dir : path.resolve(dir);
};

// DICOM Sort Route
app.post('/start-dicom-sort', (req, res) => {
    const { directory, outputDirectory, checkAllFiles, container } = req.body;
    const absDirectory = toAbsolutePath(directory);
    const absOutputDirectory = toAbsolutePath(outputDirectory);

    let command = `dicom-sort ${absDirectory} ${absOutputDirectory}`;
    if (checkAllFiles) {
        command += ' --check_all_files';
    }

    runCommand(command, container, res);
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
        childProcess = null;
        res.end();
    });
});

// DICOM Convert Route
app.post('/start-dicom-convert', (req, res) => {
    const { bidsDirectory, outputDirectory, patterns, container } = req.body;
    const absBidsDirectory = toAbsolutePath(bidsDirectory);
    const absOutputDirectory = toAbsolutePath(outputDirectory);

    let command = `dicom-convert ${absBidsDirectory} ${absOutputDirectory} --auto_yes`;
    if (patterns) {
        const patternList = patterns.split(',').map(p => p.trim()).join(' ');
        command += ` --qsm_protocol_patterns ${patternList}`;
    }

    runCommand(command, container, res);
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
        childProcess = null;
        res.end();
    });
});

// QSMxT Route
app.post('/start-qsmxt', (req, res) => {
    const { qsmBidsDirectory, outputDirectory, premade, container } = req.body;
    const absQsmBidsDirectory = toAbsolutePath(qsmBidsDirectory);
    const absOutputDirectory = toAbsolutePath(outputDirectory);

    const command = `qsmxt ${absQsmBidsDirectory} ${absOutputDirectory} --premade ${premade} --auto_yes`;

    runCommand(command, container, res);
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
        childProcess = null;
        res.end();
    });
});

// Directory Structure Route
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

// Read Text File Route
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

// Read NIfTI File Route
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

// Create the upload directory if it doesn't exist
const ensureUploadDirectory = () => {
    const uploadDir = path.resolve(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
};

// Upload and Extract Compressed DICOMs Route
app.post('/upload-dicoms', upload.single('dicomArchive'), (req, res) => {
    ensureUploadDirectory();
    console.log(`Receiving DICOM archive...`);
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    const uploadPath = path.resolve(__dirname, 'uploads', file.filename);
    const extractPath = path.resolve(__dirname, 'uploads', 'dicoms');

    fs.renameSync(file.path, uploadPath);

    const extractFile = () => {
        if (file.originalname.endsWith('.zip')) {
            extract(uploadPath, { dir: extractPath })
                .then(() => {
                    fs.unlinkSync(uploadPath); // Remove the compressed file after extraction
                    res.json({ extractedPath: extractPath });
                })
                .catch(err => {
                    console.error('Extraction error:', err);
                    res.status(500).send('Error extracting file');
                });
        } else if (file.originalname.endsWith('.tar')) {
            fs.createReadStream(uploadPath)
                .pipe(tar.extract(extractPath))
                .on('finish', () => {
                    fs.unlinkSync(uploadPath); // Remove the compressed file after extraction
                    res.json({ extractedPath: extractPath });
                })
                .on('error', (err) => {
                    console.error('Extraction error:', err);
                    res.status(500).send('Error extracting file');
                });
        } else {
            res.status(400).send('Unsupported file format');
        }
    };

    extractFile();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
