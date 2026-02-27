#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const tar = require('tar-stream');
const zlib = require('zlib');

const arxivId = process.argv[2];
if (!arxivId) {
  console.error(JSON.stringify({ success: false, error: 'Usage: node download-tex.cjs <arxiv-id>' }));
  process.exit(1);
}

const tmpDir = '/tmp/claude-paper-downloads';
const extractDir = path.join(tmpDir, arxivId);
const tarPath = path.join(tmpDir, `${arxivId}.tar.gz`);

// Create tmp directory if it doesn't exist
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Download TeX source from arXiv
function downloadTexSource(arxivId) {
  return new Promise((resolve, reject) => {
    const texUrl = `https://arxiv.org/e-print/${arxivId}`;

    const file = fs.createWriteStream(tarPath);

    https.get(texUrl, (response) => {
      if (response.statusCode === 404) {
        reject(new Error('TeX source not available for this paper'));
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(tarPath);
      });
    }).on('error', (err) => {
      fs.unlink(tarPath, () => {});
      reject(err);
    });
  });
}

// Extract tar.gz archive
function extractTarGz(tarPath, extractDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    const extract = tar.extract();

    extract.on('entry', (header, stream, next) => {
      const filePath = path.join(extractDir, header.name);

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (header.type === 'file') {
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);
        writeStream.on('finish', next);
      } else {
        stream.on('end', next);
        stream.resume();
      }
    });

    extract.on('finish', () => {
      resolve(extractDir);
    });

    extract.on('error', reject);

    const readStream = fs.createReadStream(tarPath);
    const gunzip = zlib.createGunzip();

    readStream.pipe(gunzip).pipe(extract);
  });
}

// Find main .tex file
function findMainTexFile(extractDir) {
  const files = fs.readdirSync(extractDir, { recursive: true });
  const texFiles = files.filter(f => f.endsWith('.tex'));

  if (texFiles.length === 0) {
    throw new Error('No .tex files found in archive');
  }

  // Priority list for main file names
  const priorities = ['main.tex', 'ms.tex', 'paper.tex', 'article.tex'];

  // Check priority names first
  for (const priority of priorities) {
    const found = texFiles.find(f => path.basename(f) === priority);
    if (found) {
      const fullPath = path.join(extractDir, found);
      if (isRootTexFile(fullPath)) {
        return fullPath;
      }
    }
  }

  // Check all .tex files for \documentclass
  for (const texFile of texFiles) {
    const fullPath = path.join(extractDir, texFile);
    if (isRootTexFile(fullPath)) {
      return fullPath;
    }
  }

  // If no root file found, return the largest .tex file
  let largestFile = null;
  let largestSize = 0;

  for (const texFile of texFiles) {
    const fullPath = path.join(extractDir, texFile);
    const stats = fs.statSync(fullPath);
    if (stats.size > largestSize) {
      largestSize = stats.size;
      largestFile = fullPath;
    }
  }

  if (largestFile) {
    return largestFile;
  }

  throw new Error('Could not determine main .tex file');
}

// Check if a .tex file is a root file (contains \documentclass)
function isRootTexFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return /\\documentclass/.test(content);
  } catch (err) {
    return false;
  }
}

// Main execution
(async () => {
  try {
    await downloadTexSource(arxivId);
    await extractTarGz(tarPath, extractDir);
    const mainTex = findMainTexFile(extractDir);

    console.log(JSON.stringify({
      success: true,
      mainTex,
      extractPath: extractDir,
      arxivId
    }));
  } catch (err) {
    console.error(JSON.stringify({
      success: false,
      error: err.message
    }));
    process.exit(1);
  }
})();
