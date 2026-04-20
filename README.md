# KeyLens — PDF Keyword Extractor
> A full-stack NLP web application for extracting keywords from PDF documents.

## Live Demo Architecture
```
Browser (HTML/CSS/JS)  →  Flask REST API  →  NLP Engine (TF-IDF / RAKE / Frequency)
```

---

## 1. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Plain HTML + CSS + JS | No build tools needed; easy to host anywhere |
| Backend | Python Flask | Lightweight, beginner-friendly, great NLP ecosystem |
| PDF Parsing | pdfplumber | Accurate text extraction from PDFs |
| Keywords (primary) | TF-IDF via scikit-learn | Industry-standard, handles multi-word phrases |
| Keywords (alt) | RAKE via rake-nltk | Phrase-based extraction, no training needed |
| Keywords (alt) | Word Frequency + NLTK | Simplest baseline, always works |
| Deployment (backend) | Render.com | Free tier, zero config |
| Deployment (frontend) | Netlify / Vercel | Free, instant deploy from folder |

---

## 2. Project Structure

```
keyword-extractor/
├── backend/
│   ├── app.py              ← Flask API (all endpoints)
│   ├── requirements.txt    ← Python dependencies
│   └── render.yaml         ← Render deployment config
│
├── frontend/
│   ├── index.html          ← Main UI
│   ├── css/
│   │   └── style.css       ← All styles
│   └── js/
│       ├── config.js       ← API URL config (change this for prod)
│       └── app.js          ← All UI logic
│
└── README.md
```

---

## 3. Local Setup

### Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
# → Running on http://localhost:5000
```

### Frontend

No build step needed. Just open `frontend/index.html` in a browser.

**Option A — Direct open:**
```bash
open frontend/index.html        # Mac
start frontend/index.html       # Windows
```

**Option B — Local server (avoids any CORS edge cases):**
```bash
cd frontend
python -m http.server 8080
# → Open http://localhost:8080
```

---

## 4. API Reference

### `GET /`
Health check.

**Response:**
```json
{ "status": "ok", "message": "Keyword Extractor API is running" }
```

### `POST /extract`
Extract keywords from a PDF.

**Form fields:**
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `file` | File (.pdf) | Yes | — | The PDF to analyze |
| `method` | string | No | `tfidf` | `tfidf`, `rake`, or `frequency` |
| `top_n` | int | No | `15` | Number of keywords (5–30) |

**Response:**
```json
{
  "keywords": [
    { "keyword": "machine learning", "score": 0.4821 },
    { "keyword": "neural network", "score": 0.3102 }
  ],
  "method": "tfidf",
  "pages": 12,
  "word_count": 4823,
  "filename": "research_paper.pdf"
}
```

---

## 5. Deployment

### Backend → Render (Free)

1. Push your `backend/` folder to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — click **Deploy**
5. Copy your Render URL (e.g. `https://keyword-extractor-api.onrender.com`)

### Frontend → Netlify (Free)

1. Open `frontend/js/config.js`
2. Change `API_BASE_URL` to your Render URL:
   ```js
   const CONFIG = {
     API_BASE_URL: "https://keyword-extractor-api.onrender.com",
   };
   ```
3. Go to [netlify.com](https://netlify.com) → **Add new site → Deploy manually**
4. Drag and drop the entire `frontend/` folder
5. Your site is live instantly!

**Alternative: Vercel**
```bash
npm i -g vercel
cd frontend
vercel
```

---

## 6. How the NLP Works

### TF-IDF (Term Frequency–Inverse Document Frequency)
- Splits the PDF text into sentence-chunks
- Builds a vocabulary of 1- and 2-word phrases
- Scores each phrase by how often it appears in THIS document vs. how common it is in general
- High score = important to this specific document

### RAKE (Rapid Automatic Keyword Extraction)
- Finds "candidate phrases" by splitting on stop words and punctuation
- Scores phrases based on word co-occurrence
- No ML training required; purely statistical

### Word Frequency
- Removes stop words (the, is, a, …)
- Counts how often each remaining word appears
- Returns the most frequent words as keywords

---

## 7. Project Description (for submission)

### KeyLens — PDF Keyword Extractor

**Objective:** KeyLens is a full-stack web application that automatically extracts the most relevant keywords and keyphrases from any PDF document using Natural Language Processing (NLP) techniques.

**Tech Stack:** Python (Flask) backend, plain HTML/CSS/JavaScript frontend, pdfplumber for PDF parsing, scikit-learn (TF-IDF), RAKE-NLTK, and NLTK for three different extraction algorithms.

**Features:**
- Drag-and-drop PDF upload with file validation
- Three NLP extraction methods: TF-IDF, RAKE, and Word Frequency
- Configurable number of keywords (5–30)
- Visual keyword display with relevance score bar chart
- One-click CSV export and clipboard copy
- Fully responsive, mobile-friendly design
- REST API with JSON responses

**How it works:** The user uploads a PDF; the Flask backend extracts raw text using pdfplumber, cleans and preprocesses it, then applies the selected NLP algorithm to score and rank terms. The top-N keywords are returned as JSON and rendered in the browser as interactive chips with a bar chart showing relative scores.

**Deployment:** Backend hosted on Render (free tier), frontend hosted on Netlify (free tier), accessible via a public URL.
