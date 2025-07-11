# 📚 Vivekananda Search

An unofficial, full-text search index for the 3500+ Web-pages published by RamaKrishna Math. — powered by open-source crawling and indexing tools, and hosted freely via GitHub Pages.

---

## 🏗 Project Overview

### 🔍 Goal

To build a searchable, client-side website that indexes the content from:

* [ramakrishnavivekananda.info](https://www.ramakrishnavivekananda.info)

...and enables readers to search across multiple books and essays with near-instant full-text results.

---

## 🔧 Technology Stack

| Purpose       | Tool / Library                         |
| ------------- | -------------------------------------- |
| Web crawler   | Custom Node.js script + native `fetch` |
| Parallelism   | `worker_threads` (Node.js)             |
| Index builder | [Pagefind](https://pagefind.app/)      |
| Frontend UI   | Vanilla JavaScript + Pagefind UI       |
| Hosting       | GitHub Pages                           |
| CI/CD         | GitHub Actions                         |

---

## 🧱 Architecture & Workflow

### Step 1: Crawling

* Node.js script crawls all pages within the domain `https://www.ramakrishnavivekananda.info`
* Follows internal links only
* Downloads HTML content to a `site-download/` folder
* Uses network-read concurrency with `Promise.all` and disk-write parallelism with worker threads

### Step 2: Indexing

* Pagefind CLI runs on `site-download/` to build a static full-text inverted index
* Output placed in `/public/pagefind`

### Step 3: UI

* Vanilla HTML page with:

  * Intro section listing indexed works
  * Pagefind search bar
  * Scroll-to-top button
  * All results open in new tab

### Step 4: Hosting

* `public` folder is uploaded
* Extension support plan canceled due to Chrome Web Store size limits

---

## 🧠 Indexing Algorithm (Pagefind)

Pagefind uses a browser-friendly **compressed inverted index** built during pre-processing. Key features:

* Tokenizes text using language-specific stemmers
* Generates a map: `word -> document(s)`
* Stores minimal metadata (title, content snippet, URL)
* Client loads only filtered segments of the index at query time

---

## 🚀 GitHub Actions Workflow

A `.github/workflows/static.yml` handles:

* Deploying `public/` to `gh-pages`
* Supports preview deployments for PRs (if needed)

---

## 📦 Directory Structure

```
├── site-download/         # Crawled HTML pages
├── public/
│   ├── pagefind/          # Pagefind inverted index and UI assets
│   ├── index.html         # Search UI page
├── crawler.js             # Crawler entrypoint
├── saveWorker.js          # Worker thread to save files
├── package.json
├── README.md              # You are here
```

---

## 🔮 Future Improvements

* [ ] Language detection and multilingual indexing
* [ ] PDF content extraction + OCR indexing
* [ ] Offline-friendly service worker
* [ ] Filters (by book, section, year)
* [ ] Faceted UI with Tailwind or ShadCN
* [ ] Sitemap-based crawler with retry queue

---

## 📖 Credits

* Ramakrishna Math for the publications
* [Pagefind](https://pagefind.app/) for index + search UI
* You, the reader & contributor ✨

---

## 📜 License

MIT (Code). Content from `ramakrishnavivekananda.info` remains under their copyright.
