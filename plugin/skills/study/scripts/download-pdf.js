#!/usr/bin/env node

/**
 * Download PDF from URL or validate local path
 * Supports:
 * - Direct PDF URLs
 * - arXiv URLs (both /abs/ and /pdf/ formats)
 * - Local file paths
 *
 * Output: Local file path to PDF (either downloaded or original)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const DOWNLOAD_DIR = '/tmp/claude-paper-downloads';
const TIMEOUT = 30000; // 30 seconds
const MAX_REDIRECTS = 5;

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

/**
 * Check if input is a URL
 */
function isUrl(input) {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract arXiv ID from URL
 * Supports both:
 * - https://arxiv.org/abs/2301.07041
 * - https://arxiv.org/pdf/2301.07041.pdf
 */
function extractArxivId(url) {
  const arxivAbsPattern = /arxiv\.org\/abs\/(\d+\.\d+)/;
  const arxivPdfPattern = /arxiv\.org\/pdf\/(\d+\.\d+)/;

  const absMatch = url.match(arxivAbsPattern);
  if (absMatch) return absMatch[1];

  const pdfMatch = url.match(arxivPdfPattern);
  if (pdfMatch) return pdfMatch[1];

  return null;
}

/**
 * Convert arXiv URL to PDF URL
 */
function convertArxivToPdfUrl(url) {
  const arxivId = extractArxivId(url);
  if (!arxivId) return null;

  return `https://arxiv.org/pdf/${arxivId}.pdf`;
}

/**
 * Download file from URL
 */
async function downloadFile(url, redirects = 0) {
  if (redirects > MAX_REDIRECTS) {
    throw new Error('Too many redirects');
  }

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (url.startsWith('https') ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Claude Paper Plugin (https://github.com/yourusername/claude-paper)'
      }
    };

    const req = protocol.request(options, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (!redirectUrl) {
          reject(new Error(`Redirect (status ${res.statusCode}) without Location header`));
          return;
        }
        // Handle relative redirects
        const absoluteRedirectUrl = redirectUrl.startsWith('http')
          ? redirectUrl
          : `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
        downloadFile(absoluteRedirectUrl, redirects + 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      // Check for HTTP errors
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      // Validate content-type
      const contentType = res.headers['content-type'] || '';
      if (!contentType.includes('application/pdf')) {
        reject(new Error(`URL must point to a PDF file (got: ${contentType})`));
        return;
      }

      // Generate filename
      const urlBasename = path.basename(urlObj.pathname);
      const filename = urlBasename || `downloaded-${Date.now()}.pdf`;
      const filepath = path.join(DOWNLOAD_DIR, filename);

      // Stream to file
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Cleanup on error
        reject(new Error(`Failed to write file: ${err.message}`));
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT}ms`));
    });

    req.on('error', (err) => {
      reject(new Error(`Network error: ${err.message}`));
    });

    req.end();
  });
}

/**
 * Validate local PDF file
 */
function validateLocalPath(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }

  const stats = fs.statSync(filepath);
  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${filepath}`);
  }

  // Check file extension
  if (!filepath.toLowerCase().endsWith('.pdf')) {
    throw new Error(`File must be a PDF: ${filepath}`);
  }

  return filepath;
}

/**
 * Main function
 */
async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error('Usage: download-pdf.js <url-or-path>');
    process.exit(1);
  }

  try {
    let localPath;

    if (isUrl(input)) {
      let downloadUrl = input;

      // Check if arXiv URL
      if (input.includes('arxiv.org/')) {
        const pdfUrl = convertArxivToPdfUrl(input);
        if (pdfUrl) {
          downloadUrl = pdfUrl;
        }
      }

      // Download
      console.error(`Downloading PDF from: ${downloadUrl}`);
      localPath = await downloadFile(downloadUrl);
      console.error(`Downloaded to: ${localPath}`);
    } else {
      // Validate local path
      localPath = validateLocalPath(input);
    }

    // Output local path (for parse-pdf.js to consume)
    console.log(localPath);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
