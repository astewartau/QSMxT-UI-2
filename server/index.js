const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const extract = require('extract-zip');
const tar = require('tar-fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

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

// NIfTI Convert Route
app.post('/start-nifti-convert', (req, res) => {
    const { niftiDirectory, outputDirectory, container } = req.body;
    const absNiftiDirectory = toAbsolutePath(niftiDirectory);
    const absOutputDirectory = toAbsolutePath(outputDirectory);

    const command = `nifti-convert ${absNiftiDirectory} ${absOutputDirectory}`;

    runCommand(command, container, res);
});


app.get('/nifti-convert', (req, res) => {
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
    const { qsmBidsDirectory, premade, container } = req.body;
    const absQsmBidsDirectory = toAbsolutePath(qsmBidsDirectory);

    const command = `qsmxt ${absQsmBidsDirectory} --premade ${premade} --auto_yes`;

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
    console.log(`Reading file from: ${filePath}`);

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        res.json({ url: `http://localhost:${PORT}/files/${filePath}` });
    } catch (error) {
        console.error('Error reading file:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Read image file route
app.post('/read-image-file', (req, res) => {
    const { filePath } = req.body;
    console.log(`Reading file from: ${filePath}`);

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        res.json({ url: `http://localhost:${PORT}/files/${filePath}` });
    } catch (error) {
        console.error('Error reading file:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Read image file route
app.post('/read-image-file', (req, res) => {
    const { filePath } = req.body;
    console.log(`Reading file from: ${filePath}`);

    if (fs.existsSync(absolutePath)) {
        res.json({ url: `http://localhost:${PORT}/files/${filePath}` });
    } else {
        res.status(404).send('File not found');
    }
});

const currentWorkingDirectory = process.cwd();
app.use('/files', express.static(currentWorkingDirectory));

app.post('/resolve-path', (req, res) => {
    const { directory, relativePath } = req.body;
    const fullPath = path.resolve(directory, relativePath);
    res.json({ fullPath });
});


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

// Endpoint to fetch CSV file
// Endpoint to fetch CSV file
app.get('/fetch-csv', (req, res) => {
    const { filePath } = req.query;
    const absFilePath = toAbsolutePath(filePath);

    console.log('Fetching CSV file from:', absFilePath);

    if (fs.exists(absFilePath, (exists) => {
        if (exists) {
            const results = [];
            fs.createReadStream(absFilePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    console.log('CSV Data:', results);
                    res.json(results);
                });
        } else {
            res.status(404).send('CSV file not found');
        }
    }));
});

// Endpoint to save edited CSV file
app.post('/save-csv', (req, res) => {
    const { filePath, data } = req.body;
    const absFilePath = toAbsolutePath(filePath);

    try {
        const csvData = parse(data);
        fs.writeFileSync(absFilePath, csvData);
        res.send('CSV file saved successfully');
    } catch (error) {
        res.status(500).send('Error saving CSV file');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
