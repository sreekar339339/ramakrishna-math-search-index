// saveWorker.js
import { parentPort } from 'worker_threads';
import fs from 'fs/promises';
import path from 'path';

parentPort.on('message', async ({ url, html, outputDir }) => {
  try {
    const urlPath = new URL(url).pathname || '/index.html';
    let filePath = path.join(outputDir, urlPath);
    if (filePath.endsWith('/')) filePath += 'index.html';
    if (!filePath.endsWith('.html')) filePath += '.html';

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, html);
    parentPort.postMessage({ status: 'done', url });
  } catch (err) {
    parentPort.postMessage({ status: 'error', url, error: err.message });
  }
});