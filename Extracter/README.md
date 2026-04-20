# AI Keyword Extractor

A full-stack web application that extracts relevant keywords from PDF documents using various NLP algorithms. 
Built with Flask (Python) back-end and a vanilla HTML/CSS/JS front-end.

## Features

- **Drag-and-Drop Interface**: Easy PDF uploading.
- **Multiple NLP Algorithms**:
  - **TF-IDF**: Best for finding statistically significant words across documents.
  - **RAKE**: Best for finding multi-word phrases and idioms.
  - **Word Frequency**: Basic term counting (excluding stop words).
- **Customizable**: Choose 10, 15, 20, or 30 keywords.
- **Data Visualization**: See relative keyword importance generated dynamically via Chart.js.
- **Export Options**: Copy results to clipboard or download as CSV.

## Architecture

```text
keyword-extractor/
├── backend/
│   ├── app.py           ← Flask API (Handles PDF parsing and NLP logic)
│   ├── requirements.txt ← Python dependencies
│   └── render.yaml      ← Production deployment config
├── frontend/
│   ├── index.html       ← User interface layout
│   ├── css/style.css    ← Responsive styling
│   └── js/
│       ├── config.js    ← API endpoint configuration
│       └── app.js       ← DOM manipulation, API fetching, and Chart logic
```

## Setup & Running Locally

### Backend Setup
1. Navigate to the `backend` directory.
2. Initialize virtual environment: `python -m venv venv`
3. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `python app.py` (Runs on port 5000)

### Frontend Setup
1. Navigate to the `frontend` directory in a new terminal.
2. Start a local server: `python -m http.server 8080`
3. Navigate to `http://localhost:8080` in your web browser.

## Deployment

- **Backend**: Can be directly deployed to Render.com by connecting a GitHub repository containing this codebase. Render will auto-detect the `render.yaml`.
- **Frontend**: Can be hosted on Netlify, Vercel, or GitHub Pages. Change `API_URL` in `frontend/js/config.js` to point to the deployed back-end URL before deploying.
