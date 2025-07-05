// STEP 1: Crawler Script (Node.js with concurrency and threaded disk writes + improvements)
// Crawls all internal links of the site and saves them as static HTML files in parallel using a worker pool

import path from 'path';
import {load} from 'cheerio';
import { URL } from 'url';
import PQueue from 'p-queue';
import { Worker } from 'worker_threads';

const BASE_URL = 'https://www.ramakrishnavivekananda.info';
const OUTPUT_DIR = './site-download';
const SAVE_WORKER_PATH = path.resolve('./saveWorker.js');
const visited = new Set();
const queue = new Set([BASE_URL]);

const fetchConcurrency = 10;
const fetchQueue = new PQueue({ concurrency: fetchConcurrency });

const WORKER_POOL_SIZE = 4;
const workers = Array.from({ length: WORKER_POOL_SIZE }, () => new Worker(SAVE_WORKER_PATH));
const workerQueue = new PQueue({ concurrency: WORKER_POOL_SIZE });

// Graceful exit on unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

function savePage(url, html) {
  return new Promise((resolve, reject) => {
    const worker = workers.shift();
    const listener = (msg) => {
      if (msg.url === url) {
        worker.off('message', listener);
        workers.push(worker); // Return worker to pool
        if (msg.status === 'done') {
          console.log('Saved:', url);
          resolve();
        } else {
          console.warn('Failed to save:', url, msg.error);
          reject(msg.error);
        }
      }
    };
    worker.on('message', listener);
    worker.postMessage({ url, html, outputDir: OUTPUT_DIR });
  });
}

function isInternalLink(href) {
  try {
    const url = new URL(href, BASE_URL);
    return url.hostname === new URL(BASE_URL).hostname;
  } catch {
    return false;
  }
}

async function fetchWithRetry(url, retries = 3) {
  const headers = {
    'User-Agent': 'VivekanandaSearchBot/1.0 (+https://yourproject.github.io)'
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.text();
    } catch (err) {
      console.warn(`Fetch failed for ${url} (attempt ${attempt}): ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, 500 * attempt)); // Exponential backoff
    }
  }
}

async function processUrl(current) {
  if (visited.has(current)) return;
  visited.add(current);

  try {
    const html = await fetchWithRetry(current);
    await workerQueue.add(() => savePage(current, html));

    const $ = load(html);
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const absUrl = new URL(href, current).toString();
      if (isInternalLink(absUrl) && !visited.has(absUrl)) {
        if (!queue.has(absUrl)) {
          queue.add(absUrl);
          fetchQueue.add(() => processUrl(absUrl));
        }
      }
    });
  } catch (e) {
    console.warn('Failed to process:', current, e.message);
  }
}

async function crawl() {
  for (const url of queue) {
    fetchQueue.add(() => processUrl(url));
  }
  await fetchQueue.onIdle();
  await workerQueue.onIdle();
  console.log('Crawling complete.');
}

// Run the crawler
crawl();
